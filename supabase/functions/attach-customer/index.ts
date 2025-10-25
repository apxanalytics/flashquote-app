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
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { job_id, customer_id } = await req.json();

    if (!job_id || !customer_id) {
      return new Response(
        JSON.stringify({ error: "job_id and customer_id are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify customer exists and belongs to user
    const { data: customer, error: customerError } = await supabaseClient
      .from("customers")
      .select("id")
      .eq("id", customer_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerError || !customer) {
      return new Response(
        JSON.stringify({ error: "Customer not found" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify job exists and belongs to user
    const { data: job, error: jobError } = await supabaseClient
      .from("jobs")
      .select("id")
      .eq("id", job_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Attach customer to job
    const { error: updateError } = await supabaseClient
      .from("jobs")
      .update({ customer_id })
      .eq("id", job_id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error attaching customer:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in attach-customer function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to attach customer",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
