import { Resend } from 'resend';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/seo/config';

const resend = new Resend(process.env.RESEND_API_KEY);

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  general: 'Общо запитване',
  property_interest: 'Интерес към имот',
  viewing_request: 'Заявка за оглед',
  valuation: 'Оценка на имот',
  selling: 'Продажба на имот',
  renting: 'Отдаване под наем',
};

export interface InquiryEmailData {
  full_name: string;
  email: string;
  phone?: string;
  message: string;
  inquiryId: number;
  inquiryType: string;
  /** The listing the inquiry was sent from, if any */
  property?: { title: string; url: string } | null;
}

/** Visitor input goes into HTML – escape everything that is interpolated */
function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function sendInquiryNotification(data: InquiryEmailData): Promise<void> {
  const { full_name, email, phone, message, inquiryId, inquiryType, property } = data;
  const typeLabel = INQUIRY_TYPE_LABELS[inquiryType] ?? inquiryType;

  await resend.emails.send({
    from: process.env.SMTP_FROM_EMAIL ?? 'info@novanest.bg',
    to: site.contact.email,
    replyTo: email,
    subject: `Ново запитване #${inquiryId} от ${full_name}${property ? ` – ${property.title}` : ''}`,
    html: `
      <h2>Ново запитване – ${esc(typeLabel)}</h2>
      <p><strong>Запитване #${inquiryId}</strong></p>
      ${property ? `<p><strong>Имот:</strong> <a href="${esc(property.url)}">${esc(property.title)}</a></p>` : ''}
      <hr />
      <p><strong>Име:</strong> ${esc(full_name)}</p>
      <p><strong>Имейл:</strong> ${esc(email)}</p>
      ${phone ? `<p><strong>Телефон:</strong> ${esc(phone)}</p>` : ''}
      <p><strong>Съобщение:</strong></p>
      <p>${esc(message).replace(/\n/g, '<br />')}</p>
      <hr />
      <p><small>Управление на запитвания: <a href="${absoluteUrl('/admin/inquiries/')}">Админ панел</a></small></p>
    `,
  });
}
