"use client";

import { useState, useTransition } from "react";
import {
  inviteUser,
  changeRole,
  revokeUser,
} from "@/app/admin/usuarios/actions";

export type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: "owner" | "staff";
  created_at: string;
};

export default function UsuariosManager({
  currentUserId,
  users,
}: {
  currentUserId: string;
  users: UserRow[];
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [message, setMessage] = useState<
    { kind: "ok" | "error"; text: string } | null
  >(null);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-stone-600">
          {users.length} {users.length === 1 ? "usuario" : "usuarios"}
        </p>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Invitar usuario
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            message.kind === "ok"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr className="text-left text-xs uppercase tracking-wider text-stone-600">
              <th className="px-6 py-3 font-medium">Usuario</th>
              <th className="px-6 py-3 font-medium">Rol</th>
              <th className="px-6 py-3 font-medium">Creado</th>
              <th className="px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRowView
                key={u.id}
                user={u}
                isSelf={u.id === currentUserId}
                onMessage={setMessage}
              />
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onResult={(res) => {
            if (res.ok) {
              setShowInvite(false);
              setMessage({
                kind: "ok",
                text: "Invitación enviada al email.",
              });
            } else {
              setMessage({ kind: "error", text: res.error });
            }
          }}
        />
      )}
    </>
  );
}

function UserRowView({
  user,
  isSelf,
  onMessage,
}: {
  user: UserRow;
  isSelf: boolean;
  onMessage: (m: { kind: "ok" | "error"; text: string } | null) => void;
}) {
  const [pending, startTransition] = useTransition();

  function onToggleRole() {
    const next: "owner" | "staff" = user.role === "owner" ? "staff" : "owner";
    onMessage(null);
    startTransition(async () => {
      const res = await changeRole(user.id, next);
      if (!res.ok) onMessage({ kind: "error", text: res.error });
    });
  }

  function onRevoke() {
    if (
      !confirm(
        `¿Revocar acceso a ${user.email}? Se eliminará su cuenta de autenticación.`,
      )
    )
      return;
    onMessage(null);
    startTransition(async () => {
      const res = await revokeUser(user.id);
      if (res.ok) {
        onMessage({ kind: "ok", text: "Usuario eliminado." });
      } else {
        onMessage({ kind: "error", text: res.error });
      }
    });
  }

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="px-6 py-4">
        <p className="font-medium text-stone-900">
          {user.full_name || user.email}
          {isSelf && (
            <span className="ml-2 text-[10px] uppercase tracking-widest text-stone-500">
              (tú)
            </span>
          )}
        </p>
        <p className="text-xs text-stone-500">{user.email}</p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
            user.role === "owner"
              ? "bg-secondary-container text-secondary"
              : "bg-stone-100 text-stone-700"
          }`}
        >
          {user.role === "owner" ? "Owner" : "Staff"}
        </span>
      </td>
      <td className="px-6 py-4 text-stone-600 text-xs">
        {new Date(user.created_at).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={onToggleRole}
            disabled={pending || isSelf}
            className="text-xs text-stone-700 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title={
              isSelf ? "No podés cambiar tu propio rol" : "Cambiar rol"
            }
          >
            {user.role === "owner" ? "Hacer staff" : "Hacer owner"}
          </button>
          <button
            onClick={onRevoke}
            disabled={pending || isSelf}
            className="text-xs text-rose-600 hover:text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed"
            title={isSelf ? "No podés eliminarte" : "Revocar acceso"}
          >
            Revocar
          </button>
        </div>
      </td>
    </tr>
  );
}

function InviteModal({
  onClose,
  onResult,
}: {
  onClose: () => void;
  onResult: (r: { ok: true } | { ok: false; error: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"owner" | "staff">("staff");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await inviteUser({ email, full_name: fullName, role });
      onResult(res);
    });
  }

  return (
    <div
      className="fixed inset-0 bg-stone-900/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-editorial text-xl text-primary">
              Invitar usuario
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Se enviará un email con un link para que defina su contraseña.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Nombre completo
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1.5">
              Rol
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("staff")}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${
                  role === "staff"
                    ? "border-primary bg-primary-container text-white"
                    : "border-stone-300 text-stone-700 hover:bg-stone-50"
                }`}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${
                  role === "owner"
                    ? "border-primary bg-primary-container text-white"
                    : "border-stone-300 text-stone-700 hover:bg-stone-50"
                }`}
              >
                Owner
              </button>
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              Staff puede gestionar reservas y huéspedes. Owner también puede
              administrar usuarios y configuración.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-container disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            {pending ? "Enviando…" : "Enviar invitación"}
          </button>
        </div>
      </form>
    </div>
  );
}
