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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const jobId = url.searchParams.get("id");

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "job id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: job, error: jErr } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (jErr) {
      return new Response(
        JSON.stringify({ error: jErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: items, error: iErr } = await supabase
      .from("scope_items")
      .select("*")
      .eq("job_id", jobId)
      .order("line_no", { ascending: true })
      .order("id", { ascending: true });

    if (iErr) {
      return new Response(
        JSON.stringify({ error: iErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: photos, error: pErr } = await supabase
      .from("media_photos")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: true });

    if (pErr) {
      return new Response(
        JSON.stringify({ error: pErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: settings } = await supabase
      .from("user_settings")
      .select("tax_rate")
      .eq("user_id", user.id)
      .maybeSingle();

    const rate = Number(job.tax_override_rate ?? settings?.tax_rate ?? 0);

    const baseSubtotal = (items || []).reduce((sum: number, it: any) => {
      return sum + Number(it.total || 0);
    }, 0);

    const taxableSubtotal = job.tax_exempt
      ? 0
      : (items || []).reduce((sum: number, it: any) => {
          if (it.taxable === false) return sum;
          const ta = it.taxable_amount == null ? Number(it.total || 0) : Number(it.taxable_amount || 0);
          return sum + ta;
        }, 0);

    const taxAmount = Number((taxableSubtotal * (rate / 100)).toFixed(2));
    const total = Number((baseSubtotal + taxAmount).toFixed(2));

    const anyNonTaxable = (items || []).some((it: any) =>
      it.taxable === false || Number(it.taxable_amount || 0) === 0
    );
    const allTaxable = !job.tax_exempt && !anyNonTaxable;

    return new Response(
      JSON.stringify({
        job,
        scope_items: items || [],
        media_photos: photos || [],
        subtotal: baseSubtotal,
        tax: {
          rate_percent: rate,
          taxable_subtotal: Number(taxableSubtotal.toFixed(2)),
          amount: taxAmount,
          job_tax_exempt: !!job.tax_exempt,
          anyNonTaxable,
          allTaxable,
        },
        total
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});