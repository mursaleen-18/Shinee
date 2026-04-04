import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const canSendEmail = () => {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS &&
    !!process.env.SMTP_FROM
  );
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoCandidates = [
  path.resolve(__dirname, "../../frontend/src/assets/logo.png"),
  path.resolve(__dirname, "../../frontend/src/assets/logo1.png"),
  path.resolve(__dirname, "../../frontend/public/favicon.png"),
];

const getLogoAttachment = () => {
  for (const candidate of logoCandidates) {
    if (fs.existsSync(candidate)) {
      return {
        filename: "shine-logo.png",
        path: candidate,
        cid: "shine-logo@shine-app",
      };
    }
  }
  return null;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildShineEmail = ({
  title,
  greeting,
  lines = [],
  ctaText,
  ctaUrl,
  footerNote,
}) => {
  const attachmentLogo = getLogoAttachment();
  const envLogoUrl = process.env.SHINE_LOGO_URL || "";
  const logoTag = attachmentLogo
    ? '<img src="cid:shine-logo@shine-app" alt="Shine" style="height:42px;" />'
    : envLogoUrl
    ? `<img src="${escapeHtml(envLogoUrl)}" alt="Shine" style="height:42px;" />`
    : '<div style="font-size:24px;font-weight:700;color:#111827;">Shine</div>';

  const htmlLines = lines
    .map((line) => `<p style="margin:0 0 12px;color:#374151;line-height:1.6;">${escapeHtml(line)}</p>`)
    .join("");

  const cta = ctaText && ctaUrl
    ? `<a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;margin-top:8px;">${escapeHtml(ctaText)}</a>`
    : "";

  const html = `
    <div style="margin:0;padding:24px;background:#f3f4f6;font-family:Segoe UI,Arial,sans-serif;">
      <table role="presentation" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
            ${logoTag}
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h1 style="margin:0 0 14px;font-size:20px;color:#111827;">${escapeHtml(title || "Notification from Shine")}</h1>
            <p style="margin:0 0 14px;color:#111827;line-height:1.6;">${escapeHtml(greeting || "Hello,")}</p>
            ${htmlLines}
            ${cta}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 24px;background:#fafafa;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">
              ${escapeHtml(footerNote || "This is an automated message from Shine. Please do not reply to this email.")}
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = [
    title,
    greeting,
    ...lines,
    ctaText && ctaUrl ? `${ctaText}: ${ctaUrl}` : "",
    footerNote || "This is an automated message from Shine.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    html,
    text,
    attachments: attachmentLogo ? [attachmentLogo] : [],
  };
};

export const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  try {
    if (!to) return;
    if (!canSendEmail()) {
      console.log("Email skipped (SMTP not configured):", { to, subject });
      return;
    }

    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
      attachments,
    });
  } catch (error) {
    console.log("Email send failed:", error.message);
  }
};

export const sendShineEmail = async ({
  to,
  subject,
  title,
  greeting,
  lines,
  ctaText,
  ctaUrl,
  footerNote,
}) => {
  const payload = buildShineEmail({
    title,
    greeting,
    lines,
    ctaText,
    ctaUrl,
    footerNote,
  });

  await sendEmail({
    to,
    subject,
    text: payload.text,
    html: payload.html,
    attachments: payload.attachments,
  });
};
