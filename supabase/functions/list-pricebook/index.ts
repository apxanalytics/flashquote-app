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

    // Get all pricing categories with their aliases for this user
    const { data: cats, error } = await supa
      .from("pricing_categories")
      .select("id, name, unit, default_price, pricing_aliases(alias)")
      .eq("user_id", user.id)
      .order("name");

    if (error) return J({ error:`query: ${error.message}` }, 500);

    // Flatten aliases
    const byId: any = {};
    (cats || []).forEach((r: any) => {
      if (!byId[r.id]) {
        byId[r.id] = {
          id: r.id,
          name: r.name,
          unit: r.unit || "each",
          default_price: r.default_price || 0,
          aliases: [] as string[],
        };
      }
      if (r.pricing_aliases && Array.isArray(r.pricing_aliases)) {
        r.pricing_aliases.forEach((a: any) => {
          if (a.alias && !byId[r.id].aliases.includes(a.alias)) {
            byId[r.id].aliases.push(a.alias);
          }
        });
      } else if (r.pricing_aliases?.alias) {
        if (!byId[r.id].aliases.includes(r.pricing_aliases.alias)) {
          byId[r.id].aliases.push(r.pricing_aliases.alias);
        }
      }
    });

    return J({ items: Object.values(byId) }, 200);
  } catch (e) {
    return J({ error:`unhandled: ${String(e)}` }, 500);
  }
});
