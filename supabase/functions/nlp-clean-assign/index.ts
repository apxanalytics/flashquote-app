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

    const { description, categories } = await req.json();

    if (!description || !Array.isArray(categories)) {
      return new Response(
        JSON.stringify({ error: "Missing description or categories" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a contractor proposal assistant.
1) Rewrite to a concise, professional line-item (no prices, no quantities).
2) Choose best category from list.
3) Choose unit (sf|lf|ea|room|hr|job|sy|cy|point).
Return JSON:
{"description":"","categoryName":"","unit":"","confidence":0..1}`;

    const userPrompt = `Raw text: ${description}
Categories: ${categories.map((c: any) => `${c.name}(${c.unit})`).join(", ")}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorData}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "{}";

    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {};
    }

    const found = categories.find(
      (c: any) => c.name.toLowerCase() === String(parsed.categoryName || "").toLowerCase()
    );
    const allowed = ["sf", "lf", "ea", "room", "hr", "job", "sy", "cy", "point"];
    const unit = allowed.includes(parsed.unit) ? parsed.unit : (found?.unit || "ea");

    return new Response(
      JSON.stringify({
        description: parsed.description || description,
        categoryId: found?.id || null,
        unit,
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});