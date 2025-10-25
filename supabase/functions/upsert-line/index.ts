import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const UNIT_PATTERNS = [
  { unit: 'sqft', re: /\b(\d+(?:\.\d+)?)\s*(?:sq\s*\.?\s*ft|sqft|square\s*feet)\b/i },
  { unit: 'lf', re: /\b(\d+(?:\.\d+)?)\s*(?:lf|linear\s*feet?)\b/i },
  { unit: 'each', re: /\b(\d+(?:\.\d+)?)\s*(?:each|ea)\b/i },
  { unit: 'hour', re: /\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b/i },
  { unit: 'day', re: /\b(\d+(?:\.\d+)?)\s*(?:days?)\b/i },
];

function extractQtyUnit(text: string): { quantity: number; unit: string; conf: number } | null {
  for (const p of UNIT_PATTERNS) {
    const m = text.match(p.re);
    if (m) {
      return { quantity: Number(m[1]), unit: p.unit, conf: 0.9 };
    }
  }

  const m = text.match(/\b(\d+(?:\.\d+)?)\b/);
  return m ? { quantity: Number(m[1]), unit: 'each', conf: 0.5 } : null;
}

function findCategory(desc: string, catalog: any[]): { category: any; conf: number } | null {
  const d = desc.toLowerCase();

  for (const c of catalog) {
    if (d.includes(c.name.toLowerCase())) {
      return { category: c, conf: 0.95 };
    }

    if (c.aliases?.some((a: string) => d.includes(a.toLowerCase()))) {
      return { category: c, conf: 0.9 };
    }
  }

  return null;
}

async function polishDescription(text: string, apiKey?: string): Promise<string> {
  const base = text.trim().replace(/\s+/g, " ");
  if (!base) return "";

  const noDup = base.replace(/\b(\w+)(\s+\1\b)+/gi, "$1");

  const exp = noDup
    .replace(/\bliv(?:in|rm)\b/gi, "living room")
    .replace(/\brm\b/gi, "room")
    .replace(/\begg ?shell\b/gi, "eggshell")
    .replace(/\b2 coats?\b/gi, "two coats");

  if (!apiKey) {
    console.error("AI Polish: missing OPENAI_API_KEY on server");
    return exp.charAt(0).toUpperCase() + exp.slice(1);
  }

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        messages: [
          { role: "system", content: "Rewrite a contractor line item to be concise, professional, and correctly spelled. Preserve quantities and units. Output one sentence only." },
          { role: "user", content: exp }
        ],
      }),
    });

    if (!resp.ok) {
      console.error("AI Polish error", await resp.text());
      return exp.charAt(0).toUpperCase() + exp.slice(1);
    }

    const json = await resp.json();
    return (json.choices?.[0]?.message?.content || exp).trim();
  } catch (error: any) {
    console.error("AI Polish exception", error.message);
    return exp.charAt(0).toUpperCase() + exp.slice(1);
  }
}

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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
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

    const body = await req.json();
    const {
      job_id,
      item_id,
      description,
      category_id,
      unit,
      quantity,
      unit_price,
      finalize,
      taxable,
      taxable_amount
    } = body;

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: "job_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let price = unit_price;
    let unitOut = unit;
    let qtyOut = quantity;
    let detectedCategoryId = category_id;
    let aiConfidence = 0.0;

    const isUpdate = !!item_id;

    if (!isUpdate && description && (price === undefined || price === null || !unitOut || !qtyOut)) {
      const { data: book } = await supabase
        .from("pricing_categories")
        .select("id, name, unit, default_price, pricing_aliases(alias)");

      const catalog = (book || []).map((r: any) => ({
        id: r.id,
        name: (r.name || "").toLowerCase(),
        unit: r.unit,
        price: Number(r.default_price || 0),
        aliases: (Array.isArray(r.pricing_aliases)
          ? r.pricing_aliases.map((a: any) => a.alias)
          : []).filter(Boolean),
      }));

      const catMatch = findCategory(description, catalog);
      const qtyMatch = extractQtyUnit(description);

      if (catMatch) {
        detectedCategoryId = detectedCategoryId ?? catMatch.category.id;
        price = price ?? catMatch.category.price;
        unitOut = unitOut ?? catMatch.category.unit;
        aiConfidence = catMatch.conf;
      }

      if (qtyMatch) {
        qtyOut = qtyOut ?? qtyMatch.quantity;
        unitOut = unitOut ?? qtyMatch.unit;
        aiConfidence = Math.max(aiConfidence, qtyMatch.conf);
      }

      if (price && qtyOut) {
        aiConfidence = Math.min(0.9, aiConfidence);
      } else if (price || qtyOut) {
        aiConfidence = Math.min(0.6, aiConfidence);
      }
    }

    if ((price === undefined || price === null) && detectedCategoryId) {
      const { data: cat } = await supabase
        .from("pricing_categories")
        .select("default_price, unit")
        .eq("id", detectedCategoryId)
        .maybeSingle();

      if (cat) {
        price = cat.default_price ?? 0;
        unitOut = unitOut ?? cat.unit;
      } else {
        price = 0;
      }
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");

    const payloadInsert: any = {
      job_id,
      unit: unitOut ?? "each",
      quantity: qtyOut ?? 1,
      unit_price: Number(price ?? 0),
      ai_confidence: aiConfidence,
    };

    if (detectedCategoryId) {
      payloadInsert.category_id = detectedCategoryId;
    }

    const payloadUpdate: any = {};
    if (unit !== undefined) payloadUpdate.unit = unit;
    if (quantity !== undefined) payloadUpdate.quantity = quantity;
    if (price !== undefined) payloadUpdate.unit_price = Number(price);
    if (detectedCategoryId) payloadUpdate.category_id = detectedCategoryId;
    if (typeof finalize === "boolean") payloadUpdate.finalized = finalize;
    if (typeof taxable === "boolean") payloadUpdate.taxable = taxable;
    if (taxable_amount !== undefined) {
      payloadUpdate.taxable_amount = taxable_amount === null ? null : Number(taxable_amount);
    }
    if (typeof description === "string") {
      const clean = await polishDescription(description, apiKey);
      payloadUpdate.description_raw = description;
      payloadUpdate.description_clean = clean;
      payloadInsert.description_raw = description;
      payloadInsert.description_clean = clean;
    }

    if (isUpdate) {
      const { error } = await supabase
        .from("scope_items")
        .update(payloadUpdate)
        .eq("id", item_id);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: true, id: item_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const { data: maxNo } = await supabase
        .from("scope_items")
        .select("line_no")
        .eq("job_id", job_id)
        .order("line_no", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextNo = (maxNo?.line_no ?? 0) + 1;
      payloadInsert.line_no = nextNo;

      const { data, error } = await supabase
        .from("scope_items")
        .insert([payloadInsert])
        .select("id")
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: true, id: data!.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
