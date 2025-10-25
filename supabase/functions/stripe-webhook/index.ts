import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.11.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2024-10-28.acacia",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: "Missing signature or webhook secret" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log("Received Stripe webhook:", event.type);

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object, supabaseClient);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object, supabaseClient);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object, supabaseClient);
        break;

      case "payout.paid":
        await handlePayoutPaid(event.data.object, supabaseClient);
        break;

      case "payout.failed":
        await handlePayoutFailed(event.data.object, supabaseClient);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handlePaymentSuccess(paymentIntent: any, supabase: any) {
  const invoiceId = paymentIntent.metadata?.invoice_id;

  if (!invoiceId) {
    console.error("No invoice_id in payment intent metadata");
    return;
  }

  const amount = paymentIntent.amount / 100;
  const feeAmount = (paymentIntent.application_fee_amount || 0) / 100;
  const netAmount = amount - feeAmount;

  await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: paymentIntent.payment_method_types?.[0] || "card",
      amount_paid: amount,
      balance_due: 0,
      payment_metadata: {
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.latest_charge,
        payment_method: paymentIntent.payment_method_types?.[0],
      },
    })
    .eq("id", invoiceId);

  const { data: invoice } = await supabase
    .from("invoices")
    .select("user_id, invoice_number, customer_id")
    .eq("id", invoiceId)
    .single();

  if (invoice) {
    await supabase.from("payment_transactions").insert({
      user_id: invoice.user_id,
      invoice_id: invoiceId,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_charge_id: paymentIntent.latest_charge,
      amount,
      fee_amount: feeAmount,
      net_amount: netAmount,
      status: "succeeded",
      payment_method: paymentIntent.payment_method_types?.[0] || "card",
      metadata: {
        charges: paymentIntent.charges?.data || [],
      },
    });

    await supabase.from("activities").insert({
      user_id: invoice.user_id,
      entity_type: "invoice",
      entity_id: invoiceId,
      action: "payment_received",
      description: `Payment received: $${amount.toFixed(2)} for Invoice #${invoice.invoice_number}`,
    });

    await supabase.from("notifications").insert({
      user_id: invoice.user_id,
      type: "payment_received",
      title: "Payment Received!",
      message: `You received $${amount.toFixed(2)} for Invoice #${invoice.invoice_number}`,
      read: false,
      link: `/dashboard/invoices`,
    });
  }

  console.log(`Payment successful for invoice ${invoiceId}`);
}

async function handlePaymentFailed(paymentIntent: any, supabase: any) {
  const invoiceId = paymentIntent.metadata?.invoice_id;

  if (!invoiceId) return;

  const amount = paymentIntent.amount / 100;

  await supabase
    .from("invoices")
    .update({
      status: "overdue",
      payment_metadata: {
        last_payment_attempt: new Date().toISOString(),
        failure_reason: paymentIntent.last_payment_error?.message,
      },
    })
    .eq("id", invoiceId);

  const { data: invoice } = await supabase
    .from("invoices")
    .select("user_id")
    .eq("id", invoiceId)
    .single();

  if (invoice) {
    await supabase.from("payment_transactions").insert({
      user_id: invoice.user_id,
      invoice_id: invoiceId,
      stripe_payment_intent_id: paymentIntent.id,
      amount,
      fee_amount: 0,
      net_amount: 0,
      status: "failed",
      failure_reason: paymentIntent.last_payment_error?.message,
    });
  }

  console.log(`Payment failed for invoice ${invoiceId}`);
}

async function handleAccountUpdated(account: any, supabase: any) {
  const userId = account.metadata?.user_id;

  if (!userId) return;

  await supabase
    .from("contractor_profiles")
    .update({
      stripe_account_status: account.charges_enabled && account.payouts_enabled ? "active" : "restricted",
      stripe_charges_enabled: account.charges_enabled,
      stripe_payouts_enabled: account.payouts_enabled,
      stripe_onboarding_completed_at: account.details_submitted ? new Date().toISOString() : null,
    })
    .eq("stripe_account_id", account.id);

  console.log(`Account updated for user ${userId}`);
}

async function handlePayoutPaid(payout: any, supabase: any) {
  const { data: profile } = await supabase
    .from("contractor_profiles")
    .select("id")
    .eq("stripe_account_id", payout.destination)
    .single();

  if (!profile) return;

  await supabase.from("payout_records").insert({
    user_id: profile.id,
    stripe_payout_id: payout.id,
    amount: payout.amount / 100,
    currency: payout.currency,
    status: "paid",
    arrival_date: new Date(payout.arrival_date * 1000).toISOString().split("T")[0],
    description: payout.description,
  });

  console.log(`Payout paid: ${payout.id}`);
}

async function handlePayoutFailed(payout: any, supabase: any) {
  const { data: profile } = await supabase
    .from("contractor_profiles")
    .select("id")
    .eq("stripe_account_id", payout.destination)
    .single();

  if (!profile) return;

  await supabase.from("payout_records").insert({
    user_id: profile.id,
    stripe_payout_id: payout.id,
    amount: payout.amount / 100,
    currency: payout.currency,
    status: "failed",
    failure_message: payout.failure_message,
  });

  console.log(`Payout failed: ${payout.id}`);
}
