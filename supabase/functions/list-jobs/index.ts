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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    const u = new URL(req.url);
    const status = u.searchParams.get("status") ?? "all";

    let q = supa.from("jobs")
      .select("id,job_name,status,customer_id,created_at")
      .eq("user_id", user.id)
      .order("created_at",{ ascending:false });
    if (status !== "all") q = q.eq("status", status);

    const { data, error } = await q;
    if (error) return J({ error:`query: ${error.message}` }, 500);

    return J({ jobs: data ?? [] }, 200);
  } catch (e) {
    return J({ error:`unhandled: ${String(e)}` }, 500);
  }
});
