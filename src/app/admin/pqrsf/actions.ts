"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendComplaintResolution } from "@/lib/email/resend";
import {
  aiAvailable,
  draftComplaintResponseIfAvailable,
} from "@/lib/ai";
import type {
  ComplaintPriority,
  ComplaintStatus,
  ComplaintType,
} from "@/lib/pqrsf";

type Result = { ok: true } | { ok: false; error: string };

async function getActor(): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id } : null;
}

export async function changeStatus(
  id: string,
  status: ComplaintStatus,
): Promise<Result> {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "Sesión expirada." };

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("complaints")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { ok: false, error: "PQRSF no encontrada." };

  const update =
    status === "resuelto"
      ? { status, resolved_at: new Date().toISOString() }
      : { status };

  const { error } = await admin.from("complaints").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await admin.from("complaint_events").insert({
    complaint_id: id,
    event_type: "status_changed",
    from_value: current.status,
    to_value: status,
    actor_id: actor.id,
  });

  revalidatePath(`/admin/pqrsf/${id}`);
  revalidatePath("/admin/pqrsf");
  return { ok: true };
}

export async function changePriority(
  id: string,
  priority: ComplaintPriority,
): Promise<Result> {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "Sesión expirada." };

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("complaints")
    .select("priority")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { ok: false, error: "PQRSF no encontrada." };

  const { error } = await admin
    .from("complaints")
    .update({ priority })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await admin.from("complaint_events").insert({
    complaint_id: id,
    event_type: "priority_changed",
    from_value: current.priority,
    to_value: priority,
    actor_id: actor.id,
  });

  revalidatePath(`/admin/pqrsf/${id}`);
  revalidatePath("/admin/pqrsf");
  return { ok: true };
}

export async function assign(
  id: string,
  assigneeId: string | null,
): Promise<Result> {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "Sesión expirada." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("complaints")
    .update({ assigned_to: assigneeId })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await admin.from("complaint_events").insert({
    complaint_id: id,
    event_type: "assigned",
    to_value: assigneeId,
    actor_id: actor.id,
  });

  revalidatePath(`/admin/pqrsf/${id}`);
  revalidatePath("/admin/pqrsf");
  return { ok: true };
}

export async function addInternalNote(
  id: string,
  note: string,
): Promise<Result> {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "Sesión expirada." };
  const trimmed = note.trim();
  if (!trimmed) return { ok: false, error: "Nota vacía." };

  const admin = createAdminClient();
  await admin.from("complaint_events").insert({
    complaint_id: id,
    event_type: "note_added",
    note: trimmed,
    actor_id: actor.id,
  });

  revalidatePath(`/admin/pqrsf/${id}`);
  return { ok: true };
}

export async function draftAiResponse(
  id: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "Sesión expirada." };
  if (!aiAvailable()) {
    return {
      ok: false,
      error:
        "AI no configurada. Definí ANTHROPIC_API_KEY en las variables de entorno.",
    };
  }

  const admin = createAdminClient();
  const { data: c } = await admin
    .from("complaints")
    .select(
      "id, tracking_code, type, subject, description, guest_name, ai_classification",
    )
    .eq("id", id)
    .maybeSingle<{
      id: string;
      tracking_code: string;
      type: ComplaintType;
      subject: string;
      description: string;
      guest_name: string;
      ai_classification: { area?: string } | null;
    }>();
  if (!c) return { ok: false, error: "No encontrada." };

  // Buscar ejemplos de respuestas previas del mismo tipo (últimas 3 resueltas)
  const { data: examples } = await admin
    .from("complaints")
    .select("subject, description, resolution_notes")
    .eq("type", c.type)
    .eq("status", "resuelto")
    .not("resolution_notes", "is", null)
    .order("resolved_at", { ascending: false })
    .limit(3);

  const draft = await draftComplaintResponseIfAvailable({
    type: c.type,
    subject: c.subject,
    description: c.description,
    guestName: c.guest_name,
    trackingCode: c.tracking_code,
    examples: (examples ?? []).map((e) => ({
      subject: e.subject,
      description: e.description,
      resolution: e.resolution_notes ?? "",
    })),
  });

  if (!draft) return { ok: false, error: "No se pudo generar el borrador." };
  return { ok: true, text: draft };
}

export async function resolve(
  id: string,
  resolutionNotes: string,
  sendEmail: boolean,
): Promise<Result> {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "Sesión expirada." };
  const trimmed = resolutionNotes.trim();
  if (trimmed.length < 10) {
    return {
      ok: false,
      error: "La respuesta debe tener al menos 10 caracteres.",
    };
  }

  const admin = createAdminClient();
  const { data: current, error: readErr } = await admin
    .from("complaints")
    .select("id, tracking_code, type, subject, status, guest_name, guest_email")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      tracking_code: string;
      type: ComplaintType;
      subject: string;
      status: ComplaintStatus;
      guest_name: string;
      guest_email: string;
    }>();
  if (readErr || !current) {
    return { ok: false, error: "PQRSF no encontrada." };
  }

  const { error } = await admin
    .from("complaints")
    .update({
      resolution_notes: trimmed,
      status: "resuelto",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await admin.from("complaint_events").insert([
    {
      complaint_id: id,
      event_type: "resolved",
      from_value: current.status,
      to_value: "resuelto",
      note: trimmed,
      actor_id: actor.id,
    },
  ]);

  if (sendEmail) {
    try {
      await sendComplaintResolution(current.guest_email, {
        guestName: current.guest_name,
        trackingCode: current.tracking_code,
        type: current.type,
        subject: current.subject,
        resolutionNotes: trimmed,
      });
    } catch (e) {
      console.error("[pqrsf resolve] email:", e);
    }
  }

  revalidatePath(`/admin/pqrsf/${id}`);
  revalidatePath("/admin/pqrsf");
  return { ok: true };
}
