import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "reservas@esenza.co";

export const resend = apiKey ? new Resend(apiKey) : null;

export interface BookingEmailData {
  guestName: string;
  checkIn: string;
  checkOut: string;
  numGuests: number;
  packageName: string;
  totalPrice: number;
  specialRequests?: string;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-CO")} COP`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function sendBookingConfirmationToGuest(
  to: string,
  data: BookingEmailData,
) {
  if (!resend) {
    console.warn("[email] Resend not configured, skipping guest email");
    return;
  }

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: "Hemos recibido tu reserva · Esenza",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <h1 style="font-family: 'Georgia', serif; font-weight: 300; color: #002814; font-size: 36px; margin: 0;">Esenza</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; color: #6f5d16; font-size: 11px; margin-top: 4px;">Natural Wellness Stay</p>

        <h2 style="margin-top: 40px; font-weight: 400; color: #002814;">Hola ${data.guestName},</h2>
        <p style="line-height: 1.7;">Hemos recibido tu solicitud de reserva. En las próximas horas un miembro del equipo te contactará por WhatsApp para confirmar los detalles y coordinar tu llegada.</p>

        <div style="background: #fdf9f3; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <h3 style="margin: 0 0 16px; font-weight: 500; color: #002814;">Detalles de tu reserva</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #666;">Check-in</td><td style="text-align: right; font-weight: 500;">${formatDate(data.checkIn)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Check-out</td><td style="text-align: right; font-weight: 500;">${formatDate(data.checkOut)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Huéspedes</td><td style="text-align: right; font-weight: 500;">${data.numGuests}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Paquete</td><td style="text-align: right; font-weight: 500; text-transform: capitalize;">${data.packageName}</td></tr>
            <tr><td style="padding: 12px 0 6px; color: #666; border-top: 1px solid #e5e5e5;">Total</td><td style="padding: 12px 0 6px; text-align: right; font-weight: 600; color: #002814; border-top: 1px solid #e5e5e5;">${formatPrice(data.totalPrice)}</td></tr>
          </table>
        </div>

        ${data.specialRequests ? `<p style="font-size: 14px; color: #666;"><strong>Tus comentarios:</strong><br>${data.specialRequests}</p>` : ""}

        <p style="line-height: 1.7; margin-top: 32px;">Si tienes cualquier pregunta mientras tanto, no dudes en responder a este correo.</p>

        <p style="margin-top: 40px; color: #6f5d16; font-style: italic;">Con calma,<br>El equipo de Esenza</p>
      </div>
    `,
  });
}

export async function sendBookingNotificationToAdmin(
  to: string,
  data: BookingEmailData & {
    guestEmail: string;
    guestPhone: string;
    bookingId: string;
  },
) {
  if (!resend) {
    console.warn("[email] Resend not configured, skipping admin email");
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: `Nueva reserva: ${data.guestName} · ${data.checkIn}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #002814; margin: 0 0 24px;">🌿 Nueva reserva recibida</h2>

        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Nombre</td><td style="font-weight: 500;">${data.guestName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td><a href="mailto:${data.guestEmail}">${data.guestEmail}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Teléfono</td><td><a href="https://wa.me/${data.guestPhone.replace(/\D/g, "")}">${data.guestPhone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Check-in</td><td>${formatDate(data.checkIn)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Check-out</td><td>${formatDate(data.checkOut)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Huéspedes</td><td>${data.numGuests}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Paquete</td><td style="text-transform: capitalize;">${data.packageName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Total</td><td style="font-weight: 600;">${formatPrice(data.totalPrice)}</td></tr>
        </table>

        ${data.specialRequests ? `<p style="margin-top: 20px; font-size: 14px;"><strong>Comentarios:</strong><br>${data.specialRequests}</p>` : ""}

        <a href="${siteUrl}/admin/reservas/${data.bookingId}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #002814; color: white; text-decoration: none; border-radius: 24px; font-size: 14px;">Ver en admin</a>
      </div>
    `,
  });
}
