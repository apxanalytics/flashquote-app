interface BusinessInfo {
  name: string;
  phone?: string;
  email?: string;
  license_number?: string;
  logo_url?: string;
}

interface ProposalEmailData {
  customer_name: string;
  job_title: string;
  job_description?: string;
  amount: number;
  duration?: string;
  proposal_link: string;
  business: BusinessInfo;
}

interface InvoiceEmailData {
  customer_name: string;
  invoice_number: string;
  job_title?: string;
  amount: number;
  due_date: string;
  payment_link: string;
  business: BusinessInfo;
  items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

interface ReminderEmailData {
  customer_name: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  days_overdue: number;
  payment_link: string;
  business: BusinessInfo;
}

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
  .container { max-width: 600px; margin: 0 auto; background: white; }
  .header { background: #2563eb; color: white; padding: 32px 24px; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
  .content { padding: 32px 24px; }
  .content h2 { color: #1f2937; font-size: 20px; margin: 0 0 16px 0; }
  .content p { margin: 0 0 16px 0; color: #4b5563; }
  .info-box { background: #f3f4f6; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; }
  .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
  .info-label { color: #6b7280; font-size: 14px; }
  .info-value { font-weight: 600; color: #1f2937; }
  .button { display: inline-block; padding: 14px 32px; background: #2563eb; color: white !important; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; text-align: center; }
  .button:hover { background: #1d4ed8; }
  .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
  .footer p { margin: 8px 0; color: #6b7280; font-size: 14px; }
  .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; }
  .urgent { background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; }
  .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  .table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
  .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
`;

export function generateProposalEmail(data: ProposalEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.business.name}</h1>
      ${data.business.logo_url ? `<img src="${data.business.logo_url}" alt="Logo" style="height: 48px; margin-top: 16px;">` : ''}
    </div>

    <div class="content">
      <h2>Your ${data.job_title} Proposal is Ready!</h2>

      <p>Hi ${data.customer_name},</p>

      <p>Thank you for the opportunity to work with you. We've prepared a detailed proposal for your project.</p>

      ${data.job_description ? `<p>${data.job_description}</p>` : ''}

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Project</span>
          <span class="info-value">${data.job_title}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Estimated Investment</span>
          <span class="info-value" style="font-size: 20px; color: #2563eb;">$${data.amount.toLocaleString()}</span>
        </div>
        ${data.duration ? `
        <div class="info-row">
          <span class="info-label">Timeline</span>
          <span class="info-value">${data.duration}</span>
        </div>
        ` : ''}
      </div>

      <p style="text-align: center;">
        <a href="${data.proposal_link}" class="button">View & Sign Proposal</a>
      </p>

      <p>Have questions? Feel free to reply to this email or give us a call.</p>

      <p>We look forward to working with you!</p>

      <p style="margin-top: 24px;">
        Best regards,<br>
        <strong>${data.business.name}</strong>
      </p>
    </div>

    <div class="footer">
      <p><strong>${data.business.name}</strong></p>
      ${data.business.phone ? `<p>📞 ${data.business.phone}</p>` : ''}
      ${data.business.email ? `<p>✉️ ${data.business.email}</p>` : ''}
      ${data.business.license_number ? `<p>License #${data.business.license_number}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `;
}

export function generateInvoiceEmail(data: InvoiceEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Invoice #${data.invoice_number}</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">${data.business.name}</p>
    </div>

    <div class="content">
      <h2>${data.job_title ? `${data.job_title} - ` : ''}Invoice Ready</h2>

      <p>Hi ${data.customer_name},</p>

      <p>${data.job_title ? `Your ${data.job_title} project is complete!` : 'Thank you for your business.'} Here's your invoice.</p>

      ${data.items && data.items.length > 0 ? `
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">$${item.amount.toLocaleString()}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Invoice Number</span>
          <span class="info-value">${data.invoice_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Due Date</span>
          <span class="info-value">${data.due_date}</span>
        </div>
        <div class="info-row" style="border-top: 2px solid #e5e7eb; margin-top: 12px; padding-top: 12px;">
          <span class="info-label" style="font-size: 16px;">Amount Due</span>
          <span class="info-value" style="font-size: 24px; color: #2563eb;">$${data.amount.toLocaleString()}</span>
        </div>
      </div>

      <p style="text-align: center;">
        <a href="${data.payment_link}" class="button">Pay Invoice Online</a>
      </p>

      <p style="font-size: 14px; color: #6b7280;">You can pay securely online with credit card or bank transfer.</p>

      <p>Thank you for your business!</p>

      <p style="margin-top: 24px;">
        Best regards,<br>
        <strong>${data.business.name}</strong>
      </p>
    </div>

    <div class="footer">
      <p><strong>${data.business.name}</strong></p>
      ${data.business.phone ? `<p>📞 ${data.business.phone}</p>` : ''}
      ${data.business.email ? `<p>✉️ ${data.business.email}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `;
}

export function generatePaymentReminderEmail(data: ReminderEmailData): string {
  const isUrgent = data.days_overdue > 7;
  const headerColor = isUrgent ? '#dc2626' : data.days_overdue > 0 ? '#f59e0b' : '#2563eb';
  const urgencyText = isUrgent ? 'URGENT: ' : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: ${headerColor};">
      <h1>${urgencyText}Payment Reminder</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">${data.business.name}</p>
    </div>

    <div class="content">
      <p>Hi ${data.customer_name},</p>

      <p>This is a ${isUrgent ? 'final' : 'friendly'} reminder about your outstanding invoice.</p>

      <div class="${isUrgent ? 'urgent' : 'warning'}">
        <p style="margin: 0; font-weight: 600;">
          ${data.days_overdue > 0
            ? `Invoice #${data.invoice_number} is ${data.days_overdue} ${data.days_overdue === 1 ? 'day' : 'days'} overdue.`
            : `Invoice #${data.invoice_number} is due today.`
          }
        </p>
      </div>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Invoice Number</span>
          <span class="info-value">${data.invoice_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Original Due Date</span>
          <span class="info-value">${data.due_date}</span>
        </div>
        <div class="info-row" style="border-top: 2px solid #e5e7eb; margin-top: 12px; padding-top: 12px;">
          <span class="info-label" style="font-size: 16px;">Amount Due</span>
          <span class="info-value" style="font-size: 24px; color: ${headerColor};">$${data.amount.toLocaleString()}</span>
        </div>
      </div>

      <p style="text-align: center;">
        <a href="${data.payment_link}" class="button" style="background: ${headerColor};">Pay Now</a>
      </p>

      <p style="font-size: 14px; color: #6b7280;">If you've already sent payment, please disregard this reminder.</p>

      <p>Questions? Please contact us at your earliest convenience.</p>

      <p style="margin-top: 24px;">
        Thank you,<br>
        <strong>${data.business.name}</strong>
      </p>
    </div>

    <div class="footer">
      <p><strong>${data.business.name}</strong></p>
      ${data.business.phone ? `<p>📞 ${data.business.phone}</p>` : ''}
      ${data.business.email ? `<p>✉️ ${data.business.email}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `;
}

export function generatePaymentReceivedEmail(data: {
  customer_name: string;
  invoice_number: string;
  amount: number;
  payment_date: string;
  business: BusinessInfo;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #10b981;">
      <h1>✓ Payment Received</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">${data.business.name}</p>
    </div>

    <div class="content">
      <p>Hi ${data.customer_name},</p>

      <p>Thank you! We've received your payment.</p>

      <div class="info-box" style="border-left-color: #10b981;">
        <div class="info-row">
          <span class="info-label">Invoice</span>
          <span class="info-value">${data.invoice_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Date</span>
          <span class="info-value">${data.payment_date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount Paid</span>
          <span class="info-value" style="color: #10b981; font-size: 20px;">$${data.amount.toLocaleString()}</span>
        </div>
      </div>

      <p>A receipt has been sent to your email for your records.</p>

      <p>Thank you for your business! We truly appreciate the opportunity to work with you.</p>

      <p style="margin-top: 24px;">
        Best regards,<br>
        <strong>${data.business.name}</strong>
      </p>
    </div>

    <div class="footer">
      <p><strong>${data.business.name}</strong></p>
      ${data.business.phone ? `<p>📞 ${data.business.phone}</p>` : ''}
      ${data.business.email ? `<p>✉️ ${data.business.email}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `;
}
