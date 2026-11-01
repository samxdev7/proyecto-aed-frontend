import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const internalSecret = process.env.INTERNAL_EMAIL_SECRET;
    const providedSecret = request.headers.get("x-internal-secret");

    if (!internalSecret || providedSecret !== internalSecret) {
      return Response.json(
        { success: false, error: "No autorizado: secreto interno inválido" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json(
        { success: false, error: "Cuerpo de solicitud inválido o no es JSON" },
        { status: 400 }
      );
    }

    const { to, subject, html, from } = body;

    if (!to || !subject || !html) {
      return Response.json(
        { success: false, error: "Faltan campos requeridos (to, subject, html)" },
        { status: 400 }
      );
    }

    const host = process.env.MAIL_HOST || "smtp.gmail.com";
    const port = Number(process.env.MAIL_PORT || 587);
    const user = process.env.MAIL_USERNAME;
    const pass = process.env.MAIL_PASSWORD;

    if (!user || !pass) {
      return Response.json(
        { success: false, error: "Variables MAIL_USERNAME o MAIL_PASSWORD no configuradas en Vercel" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 15000,
    });

    const remitente = from || `"Club Nicaragüense de Montañismo" <${user}>`;

    const info = await transporter.sendMail({
      from: remitente,
      to,
      subject,
      html,
    });

    return Response.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Error en relay de correo Vercel:", error);
    return Response.json(
      { success: false, error: error?.message || "Error interno al enviar correo" },
      { status: 500 }
    );
  }
}
