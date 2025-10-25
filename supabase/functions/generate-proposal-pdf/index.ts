import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScopeItem {
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(n) || 0
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(n) || 0);
}

function round2(n: number) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function generatePdfHtml(data: {
  proposal: any;
  job: any;
  customer: any;
  items: ScopeItem[];
  summary: { subtotal: number };
  taxPct?: number;
  depositPct?: number;
}): string {
  const { proposal, job, customer, items, summary, taxPct = 0, depositPct = 0 } = data;
  const tax = round2(summary.subtotal * (taxPct / 100));
  const total = round2(summary.subtotal + tax);
  const deposit = round2(total * (depositPct / 100));

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 28px; font-size: 11pt; }
    .header-row { display: flex; justify-content: space-between; margin-bottom: 16px; }
    h1 { font-size: 18pt; margin: 0; }
    .muted { color: #666; }
    table { width: 100%; margin-top: 16px; border-collapse: collapse; }
    th, td { padding: 8px; text-align: right; border: 1px solid #ddd; }
    th { background-color: #f7f7f7; font-weight: bold; }
    .td-left { text-align: left; }
    .totals { margin-top: 16px; text-align: right; }
    .bold { font-weight: bold; }
  </style>
</head>
<body>
  <div class="header-row">
    <div>
      <h1>Proposal</h1>
      <p class="muted">#${proposal.id}</p>
    </div>
    <div>
      <p class="bold">${customer?.name || "Customer"}</p>
      ${customer?.address ? `<p>${customer.address}</p>` : ""}
      ${
        customer?.email || customer?.phone
          ? `<p>${[customer?.email, customer?.phone].filter(Boolean).join("  •  ")}</p>`
          : ""
      }
    </div>
  </div>

  <div>
    <p class="bold">Job</p>
    <p>${job?.title || job?.id}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th class="td-left">Description</th>
        <th>Qty</th>
        <th>Unit</th>
        <th>$/Unit</th>
        <th>Line Total</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (it) => `
        <tr>
          <td class="td-left">${it.description}</td>
          <td>${fmt(it.quantity)}</td>
          <td>${(it.unit || "").toUpperCase()}</td>
          <td>${money(it.unit_price)}</td>
          <td>${money(it.total)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <p>Subtotal: ${money(summary.subtotal)}</p>
    <p>Tax (${fmt(taxPct)}%): ${money(tax)}</p>
    <p class="bold">Total: ${money(total)}</p>
    ${depositPct ? `<p>Deposit (${fmt(depositPct)}%): ${money(deposit)}</p>` : ""}
  </div>

  <div style="margin-top: 18px;">
    <p class="muted">Terms: Prices are estimates based on stated scope. Change orders may apply.</p>
  </div>
</body>
</html>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
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

    const { proposalId } = await req.json();

    if (!proposalId) {
      return new Response(JSON.stringify({ error: "proposalId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: proposal, error: pErr } = await supabaseClient
      .from("proposals")
      .select("id, job_id, status, pdf_url")
      .eq("id", proposalId)
      .maybeSingle();

    if (pErr || !proposal) {
      return new Response(JSON.stringify({ error: "Proposal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: job, error: jErr } = await supabaseClient
      .from("jobs")
      .select("id, title, customer_id")
      .eq("id", proposal.job_id)
      .maybeSingle();

    if (jErr || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: customer } = await supabaseClient
      .from("customers")
      .select("id, name, email, phone, address")
      .eq("id", job.customer_id)
      .maybeSingle();

    const { data: items } = await supabaseClient
      .from("scope_items")
      .select("description, unit, quantity, unit_price, total")
      .eq("job_id", job.id);

    const subtotal = round2((items || []).reduce((s, it: any) => s + (Number(it.total) || 0), 0));

    const htmlContent = generatePdfHtml({
      proposal,
      job,
      customer,
      items: items || [],
      summary: { subtotal },
    });

    const encoder = new TextEncoder();
    const htmlBuffer = encoder.encode(htmlContent);

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const filePath = `proposals/${user.id}/${proposal.id}.html`;

    const { error: uploadError } = await supabaseClient.storage
      .from("pdf")
      .upload(filePath, htmlBuffer, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { publicUrl } } = supabaseClient.storage.from("pdf").getPublicUrl(filePath);

    await supabaseClient.from("proposals").update({ pdf_url: publicUrl }).eq("id", proposal.id);

    return new Response(
      JSON.stringify({ ok: true, pdfUrl: publicUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});