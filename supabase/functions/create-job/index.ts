import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const URL  = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const J = (b:unknown,s=200)=> new Response(JSON.stringify(b),{status:s,headers:{"content-type":"application/json","Access-Control-Allow-Origin":"*"}});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
      },
    });
  }

  try {
    if (!URL || !ANON) return J({ error:"missing SUPABASE_URL/ANON in edge env" }, 500);

    const auth = req.headers.get("authorization") || "";
    const supa = createClient(URL, ANON, {
      global:{ headers: auth ? { Authorization: auth } : {} },
      auth:{ persistSession:false }
    });

    const { data:{ user }, error:uErr } = await supa.auth.getUser();
    if (uErr)  return J({ error:`getUser: ${uErr.message}` }, 401);
    if (!user) return J({ error:"Not authenticated" }, 401);

    const { job_name } = await req.json();
    if (!job_name?.trim()) return J({ error:"job_name required" }, 400);

    const { data, error } = await supa
      .from("jobs")
      .insert([{ user_id: user.id, job_name: job_name.trim(), status: "draft" }])
      .select("id")
      .single();

    if (error) return J({ error: error.message }, 500);
    return J({ id: data!.id }, 200);
  } catch (e) {
    return J({ error: `unhandled: ${String(e)}` }, 500);
  }
});
