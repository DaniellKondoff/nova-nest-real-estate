import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface InquiryEmailData {
  full_name: string;
  email: string;
  phone?: string;
  message: string;
  inquiryId: number;
}

export async function sendInquiryNotification(data: InquiryEmailData): Promise<void> {
  const { full_name, email, phone, message, inquiryId } = data;

  await resend.emails.send({
    from: process.env.SMTP_FROM_EMAIL ?? 'info@novanest.bg',
    //to: 'novanestrealestatebg@gmail.com',
    to: 'danielkondov91@gmail.com',
    subject: `Ново запитване #${inquiryId} от ${full_name}`,
    html: `
      <h2>Ново запитване от контактната форма</h2>
      <p><strong>Запитване #${inquiryId}</strong></p>
      <hr />
      <p><strong>Име:</strong> ${full_name}</p>
      <p><strong>Имейл:</strong> ${email}</p>
      ${phone ? `<p><strong>Телефон:</strong> ${phone}</p>` : ''}
      <p><strong>Съобщение:</strong></p>
      <p>${message.replace(/\n/g, '<br />')}</p>
      <hr />
      <p><small>Управление на запитвания: <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inquiries">Админ панел</a></small></p>
    `,
  });
}