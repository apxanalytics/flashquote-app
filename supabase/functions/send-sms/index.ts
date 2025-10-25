import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SMS_COST = 0.0075;

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
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    const { to, message, type, customerId, jobId, invoiceId } = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Phone number and message are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      return new Response(
        JSON.stringify({ error: "Twilio credentials not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleanPhone = to.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhoneNumber,
        Body: message,
      }),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioData);
      throw new Error(twilioData.message || "Failed to send SMS");
    }

    if (userId) {
      await supabaseClient.from("communications").insert({
        user_id: userId,
        customer_id: customerId || null,
        job_id: jobId || null,
        invoice_id: invoiceId || null,
        type: type || "notification",
        channel: "sms",
        recipient: formattedPhone,
        message,
        status: "sent",
        external_id: twilioData.sid,
        cost: SMS_COST,
        metadata: {
          twilio_status: twilioData.status,
          num_segments: twilioData.num_segments,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        sid: twilioData.sid,
        status: twilioData.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending SMS:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send SMS",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
