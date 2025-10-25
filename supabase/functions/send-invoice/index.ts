import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { invoiceId, sendSms = true, sendEmail = true, includePaymentLink = true } = await req.json();

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: "Invoice ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        customer:customers(*),
        job:jobs(title),
        contractor:contractor_profiles(*),
        items:invoice_items(*)
      `)
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let paymentLink = invoice.stripe_payment_link;

    if (includePaymentLink && !paymentLink) {
      try {
        const linkResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/create-payment-link`, {
          method: "POST",
          headers: {
            "Authorization": req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoiceId }),
        });

        if (linkResponse.ok) {
          const linkData = await linkResponse.json();
          paymentLink = linkData.url;
        }
      } catch (error) {
        console.error("Failed to create payment link:", error);
      }
    }

    const appUrl = Deno.env.get("APP_URL") || "https://flashquote.com";
    const invoiceLink = paymentLink || `${appUrl}/invoice/${invoice.id}`;

    const results: any = { sent: [] };

    if (sendSms && invoice.customer?.phone) {
      const smsMessage = `Hi ${invoice.customer.name.split(" ")[0]}! Your invoice #${invoice.invoice_number} for $${invoice.total.toLocaleString()} is ready. ${paymentLink ? `Pay now: ${paymentLink}` : `View: ${invoiceLink}`}`;

      try {
        const smsResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-sms`, {
          method: "POST",
          headers: {
            "Authorization": req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: invoice.customer.phone,
            message: smsMessage,
            type: "invoice",
            customerId: invoice.customer_id,
            invoiceId: invoice.id,
          }),
        });

        const smsResult = await smsResponse.json();
        results.sms = smsResult;
        results.sent.push("sms");
      } catch (error) {
        console.error("SMS failed:", error);
        results.sms = { error: error.message };
      }
    }

    if (sendEmail && invoice.customer?.email) {
      const emailHtml = generateInvoiceEmail(invoice, invoiceLink);

      try {
        const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Authorization": req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: invoice.customer.email,
            from: `${invoice.contractor?.business_name || "FlashQuote"} <noreply@flashquote.com>`,
            subject: `Invoice #${invoice.invoice_number} from ${invoice.contractor?.business_name || "us"}`,
            html: emailHtml,
            type: "invoice",
            customerId: invoice.customer_id,
            invoiceId: invoice.id,
          }),
        });

        const emailResult = await emailResponse.json();
        results.email = emailResult;
        results.sent.push("email");
      } catch (error) {
        console.error("Email failed:", error);
        results.email = { error: error.message };
      }
    }

    await supabaseClient
      .from("invoices")
      .update({
        status: invoice.status === "draft" ? "sent" : invoice.status,
        sent_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    await supabaseClient.from("activities").insert({
      user_id: user.id,
      entity_type: "invoice",
      entity_id: invoiceId,
      action: "invoice_sent",
      description: `Invoice sent via ${results.sent.join(" & ")}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        results,
        paymentLink,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending invoice:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send invoice",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateInvoiceEmail(invoice: any, paymentLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: #2563eb; color: white; padding: 32px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .button { display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 24px 0; }
    .info-box { background: #f3f4f6; padding: 16px; margin: 24px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Invoice #${invoice.invoice_number}</h1>
    </div>
    <div class="content">
      <p>Hi ${invoice.customer?.name || "there"},</p>
      <p>${invoice.job?.title ? `Your ${invoice.job.title} project is complete!` : "Thank you for your business."} Here's your invoice.</p>
      <div class="info-box">
        <p><strong>Amount Due:</strong> $${invoice.total.toLocaleString()}</p>
        <p><strong>Due Date:</strong> ${invoice.due_date || "Upon receipt"}</p>
      </div>
      <p style="text-align: center;">
        <a href="${paymentLink}" class="button">Pay Invoice Online</a>
      </p>
      <p>Thank you for your business!</p>
      <p>Best regards,<br>${invoice.contractor?.business_name || "Your Contractor"}</p>
    </div>
  </div>
</body>
</html>
  `;
}
