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

    const { invoiceId } = await req.json();

    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        customer:customers(*),
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

    const lineItems = invoice.items && invoice.items.length > 0
      ? invoice.items.map((item: any) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.description,
            },
            unit_amount: Math.round(item.unit_price * 100),
          },
          quantity: item.quantity,
        }))
      : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Invoice #${invoice.invoice_number}`,
                description: `Payment for ${invoice.customer?.name || "customer"}`,
              },
              unit_amount: Math.round((invoice.balance_due || invoice.total) * 100),
            },
            quantity: 1,
          },
        ];

    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${Deno.env.get("APP_URL")}/invoice/${invoiceId}/success`,
        },
      },
      metadata: {
        invoice_id: invoiceId,
        invoice_number: invoice.invoice_number,
        customer_id: invoice.customer_id,
      },
    });

    await supabaseClient
      .from("invoices")
      .update({
        stripe_payment_link: paymentLink.url,
      })
      .eq("id", invoiceId);

    return new Response(
      JSON.stringify({
        url: paymentLink.url,
        id: paymentLink.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating payment link:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create payment link",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
