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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { invoiceId } = await req.json();

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
        contractor:contractor_profiles(*)
      `)
      .eq("id", invoiceId)
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

    if (invoice.status === "paid") {
      return new Response(
        JSON.stringify({ error: "Invoice already paid" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!invoice.contractor?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: "Contractor has not connected Stripe account" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const amount = Math.round((invoice.balance_due || invoice.total) * 100);
    const feeAmount = Math.round(amount * 0.029);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      application_fee_amount: feeAmount,
      transfer_data: {
        destination: invoice.contractor.stripe_account_id,
      },
      metadata: {
        invoice_id: invoiceId,
        invoice_number: invoice.invoice_number,
        customer_id: invoice.customer_id,
        contractor_id: invoice.user_id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await supabaseClient
      .from("invoices")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq("id", invoiceId);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create payment intent",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
