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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const jobId = String(form.get("jobId") || "");

    if (!file || !jobId) {
      return new Response(
        JSON.stringify({ error: "Missing file or jobId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const arrayBuf = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    const ext = (file.type?.split("/")[1] || "jpg").replace("+", "");
    const path = `jobs/${jobId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("photos")
      .upload(path, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (upErr) {
      return new Response(
        JSON.stringify({ error: upErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);

    return new Response(
      JSON.stringify({ url: pub.publicUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Upload failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});