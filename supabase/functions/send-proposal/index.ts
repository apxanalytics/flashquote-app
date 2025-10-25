import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendProposalRequest {
  proposalId?: string;
  jobId?: string;
  via?: "sms" | "email" | "both";
  smsTo?: string;
  emailTo?: string;
  message?: string;
  includePdf?: boolean;
  sendSms?: boolean;
  sendEmail?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_PHONE_NUMBER");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM") || "Proposals <proposals@yourdomain.com>";
    const appBase = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL") || "http://localhost:5173";

    const body: SendProposalRequest = await req.json();
    const {
      proposalId,
      jobId,
      via = "both",
      smsTo,
      emailTo,
      message,
      includePdf = true,
      sendSms,
      sendEmail,
    } = body;

    let proposal: any;
    let job: any;

    if (proposalId) {
      const { data: proposalData, error: pErr } = await supabase
        .from("proposals")
        .select("id, job_id, status, pdf_url")
        .eq("id", proposalId)
        .maybeSingle();

      if (pErr || !proposalData) {
        return new Response(
          JSON.stringify({ error: pErr?.message || "Proposal not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      proposal = proposalData;

      const { data: jobData, error: jErr } = await supabase
        .from("jobs")
        .select("id, title, customer_id, price")
        .eq("id", proposal.job_id)
        .maybeSingle();

      if (jErr || !jobData) {
        return new Response(
          JSON.stringify({ error: jErr?.message || "Job not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      job = jobData;
    } else if (jobId) {
      const { data: jobData, error: jErr } = await supabase
        .from("jobs")
        .select("id, title, customer_id, price")
        .eq("id", jobId)
        .maybeSingle();

      if (jErr || !jobData) {
        return new Response(
          JSON.stringify({ error: jErr?.message || "Job not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      job = jobData;

      const { data: proposalData } = await supabase
        .from("proposals")
        .select("id, job_id, status, pdf_url")
        .eq("job_id", jobId)
        .maybeSingle();

      proposal = proposalData;
    } else {
      return new Response(
        JSON.stringify({ error: "proposalId or jobId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("id, name, email, phone")
      .eq("id", job.customer_id)
      .maybeSingle();

    const { data: items } = await supabase
      .from("scope_items")
      .select("total")
      .eq("job_id", job.id);

    const subtotal = round2((items || []).reduce((s: number, it: any) => s + (Number(it.total) || 0), 0));

    const viewUrl = proposal
      ? `${appBase}/dashboard/proposals/${proposal.id}`
      : `${appBase}/proposal/${job.id}`;
    const pdfUrl = includePdf && proposal?.pdf_url ? proposal.pdf_url : null;
    const totalText = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(subtotal || job.price || 0);

    const finalSmsTo = smsTo || customer?.phone;
    const finalEmailTo = emailTo || customer?.email;

    const shouldSendSms = (via === "sms" || via === "both" || sendSms === true);
    const shouldSendEmail = (via === "email" || via === "both" || sendEmail === true);

    const results: any = { sent: [] };

    if (shouldSendSms) {
      if (!finalSmsTo) {
        return new Response(
          JSON.stringify({ error: "Missing smsTo and no customer phone on file" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!twilioSid || !twilioToken || !twilioFrom) {
        return new Response(
          JSON.stringify({ error: "Twilio credentials not configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const smsBody =
        (message?.trim() ? message.trim() + " " : "Your proposal is ready. ") +
        `View: ${viewUrl}` +
        (pdfUrl ? ` | PDF: ${pdfUrl}` : "") +
        ` | Total: ${totalText}`;

      try {
        await sendSMS(twilioSid, twilioToken, twilioFrom, finalSmsTo, smsBody);
        results.sms = { success: true };
        results.sent.push("sms");
      } catch (error: any) {
        console.error("SMS failed:", error);
        results.sms = { error: error.message };
      }
    }

    if (shouldSendEmail) {
      if (!finalEmailTo) {
        return new Response(
          JSON.stringify({ error: "Missing emailTo and no customer email on file" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!resendKey) {
        return new Response(
          JSON.stringify({ error: "Resend API key not configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const subject = job.title ? `Proposal: ${job.title}` : "Your Proposal";
      const html = renderEmailHTML({
        customerName: customer?.name || "",
        message: message || "",
        linkUrl: viewUrl,
        pdfUrl,
        totalText,
      });

      try {
        await sendEmail(resendKey, resendFrom, finalEmailTo, subject, html);
        results.email = { success: true };
        results.sent.push("email");
      } catch (error: any) {
        console.error("Email failed:", error);
        results.email = { error: error.message };
      }
    }

    if (proposal) {
      await supabase.from("proposals").update({
        status: proposal.status === "draft" ? "sent" : proposal.status,
        sent_via: via,
      }).eq("id", proposal.id);
    }

    if (job) {
      await supabase.from("jobs").update({
        status: "sent",
        sent_at: new Date().toISOString(),
      }).eq("id", job.id);
    }

    return new Response(
      JSON.stringify({ success: true, ok: true, via, viewUrl, pdfUrl, subtotal: subtotal || job.price, results }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending proposal:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function round2(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

async function sendSMS(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  body: string
): Promise<void> {
  const auth = btoa(`${accountSid}:${authToken}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams();
  params.append("From", from);
  params.append("To", to);
  params.append("Body", body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio error: ${errorText}`);
  }
}

async function sendEmail(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${errorText}`);
  }
}

function renderEmailHTML(opts: {
  customerName: string;
  message: string;
  linkUrl: string;
  pdfUrl: string | null;
  totalText: string;
}): string {
  const { customerName, message, linkUrl, pdfUrl, totalText } = opts;
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .container {
        background: #ffffff;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #00d4ff;
        color: #1a1a1a;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 10px 5px 10px 0;
      }
      .button:hover {
        background-color: #00bae5;
      }
      .total {
        font-size: 24px;
        font-weight: bold;
        color: #00d4ff;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p>Hi${customerName ? ` ${escapeHTML(customerName)}` : ""},</p>
      ${message ? `<p>${escapeHTML(message)}</p>` : `<p>Your proposal is ready for review.</p>`}
      <p>
        <a href="${escapeHTML(linkUrl)}" class="button" target="_blank">View Proposal</a>
        ${pdfUrl ? `<a href="${escapeHTML(pdfUrl)}" class="button" target="_blank">Download PDF</a>` : ""}
      </p>
      ${totalText ? `<p class="total">Total: ${escapeHTML(totalText)}</p>` : ""}
      <p>If you have any questions, please reply to this email.</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Thank you for your business!
      </p>
    </div>
  </body>
  </html>`;
}

function escapeHTML(s: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return s.replace(/[&<>"']/g, (m) => map[m]);
}
