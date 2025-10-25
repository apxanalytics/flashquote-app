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

    const { id, name, unit, default_price, aliases } = await req.json();

    if (!name?.trim()) {
      return J({ error: "name required" }, 400);
    }

    let catId = id;

    if (catId) {
      // Update existing category (must be owned by user)
      const { error } = await supa
        .from("pricing_categories")
        .update({
          name: name.trim(),
          unit: unit || "each",
          default_price: Number(default_price || 0),
        })
        .eq("id", catId)
        .eq("user_id", user.id);

      if (error) return J({ error: `update: ${error.message}` }, 500);
    } else {
      // Insert new category
      const { data, error } = await supa
        .from("pricing_categories")
        .insert([{
          user_id: user.id,
          name: name.trim(),
          unit: unit || "each",
          default_price: Number(default_price || 0),
        }])
        .select("id")
        .maybeSingle();

      if (error || !data) {
        return J({ error: error?.message || "Failed to create category" }, 500);
      }
      catId = data.id;
    }

    // Reset aliases for this category (user-owned only)
    await supa.from("pricing_aliases").delete().eq("category_id", catId).eq("user_id", user.id);

    // Insert new aliases
    const aliasList = (aliases || [])
      .map((a: string) => ({
        category_id: catId,
        user_id: user.id,
        alias: a.trim().toLowerCase(),
      }))
      .filter((x: any) => x.alias);

    if (aliasList.length > 0) {
      const { error: aliasError } = await supa
        .from("pricing_aliases")
        .insert(aliasList);

      if (aliasError) {
        console.error("Alias insert error:", aliasError);
      }
    }

    return J({ ok: true, id: catId }, 200);
  } catch (e) {
    return J({ error:`unhandled: ${String(e)}` }, 500);
  }
});
