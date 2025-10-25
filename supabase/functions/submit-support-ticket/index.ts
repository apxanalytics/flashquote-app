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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { subject, category, message, attachments } = await req.json();

    if (!subject || !category || !message) {
      return new Response(
        JSON.stringify({ error: "Subject, category, and message are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile } = await supabaseClient
      .from("contractor_profiles")
      .select("business_name, email, phone_number")
      .eq("id", user.id)
      .single();

    const { data: ticket, error: ticketError } = await supabaseClient
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject,
        category,
        message,
        attachments: attachments || [],
        status: "open",
        priority: category === "bug" ? "high" : "normal",
      })
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
      throw ticketError;
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "FlashQuote Support <support@flashquote.com>",
            to: "support@flashquote.com",
            subject: `[${category.toUpperCase()}] ${subject}`,
            html: `
              <h2>New Support Request</h2>
              <p><strong>From:</strong> ${profile?.business_name || "Unknown"} (${user.email})</p>
              <p><strong>User ID:</strong> ${user.id}</p>
              <p><strong>Phone:</strong> ${profile?.phone_number || "N/A"}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Ticket ID:</strong> ${ticket.id}</p>
              <hr>
              <h3>${subject}</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            `,
          }),
        });

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "FlashQuote Support <support@flashquote.com>",
            to: user.email,
            subject: "We received your support request",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Thank You for Contacting Support</h2>
                <p>Hi ${profile?.business_name || "there"},</p>
                <p>We've received your support request and will respond within 4 hours during business days (Mon-Fri, 9am-6pm CT).</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Subject:</strong> ${subject}</p>
                  <p><strong>Category:</strong> ${category}</p>
                  <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                </div>
                <p>In the meantime, check out our <a href="${Deno.env.get("APP_URL")}/help/faqs">FAQs</a> or <a href="${Deno.env.get("APP_URL")}/help/videos">video tutorials</a> for quick answers.</p>
                <p>Thanks for using ContractorAI!</p>
                <p style="color: #6b7280; font-size: 14px;">- The ContractorAI Team</p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    await supabaseClient.from("activities").insert({
      user_id: user.id,
      entity_type: "support",
      entity_id: ticket.id,
      action: "ticket_created",
      description: `Support ticket created: ${subject}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        ticket,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error submitting support ticket:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to submit support ticket",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
