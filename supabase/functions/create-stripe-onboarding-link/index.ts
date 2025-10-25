import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.11.0";
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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-10-28.acacia",
    });

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

    const { data: profile } = await supabaseClient
      .from("contractor_profiles")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: "Stripe account not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { returnUrl, refreshUrl } = await req.json();

    const accountLink = await stripe.accountLinks.create({
      account: profile.stripe_account_id,
      refresh_url: refreshUrl || `${Deno.env.get("APP_URL")}/dashboard/settings?stripe=refresh`,
      return_url: returnUrl || `${Deno.env.get("APP_URL")}/dashboard/settings?stripe=success`,
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({
        url: accountLink.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating onboarding link:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create onboarding link",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
