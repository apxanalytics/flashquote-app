import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.73.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PricingCategory {
  id: string;
  name: string;
  unit: string;
  rate: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { transcript, categories } = await req.json();

    if (!transcript || !categories) {
      return new Response(
        JSON.stringify({ error: "Missing transcript or categories" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    const categoryList = (categories as PricingCategory[])
      .map((cat) => `- ${cat.name} (${cat.unit}, $${cat.rate}/unit)`)
      .join("\n");

    const prompt = `You are a construction estimator. Based on the job description below, create a detailed scope of work with line items.

Available pricing categories:
${categoryList}

Job description:
${transcript}

For each line item, provide:
1. A clear description of the work
2. The category ID (match to one of the available categories)
3. The unit type (sf, lf, ea, room, hr, job, sy, cy, point)
4. Estimated quantity
5. Unit price (use the rate from the matching category or estimate if not exact match)
6. Brief reasoning for the estimate

Respond ONLY with valid JSON in this format:
{
  "items": [
    {
      "description": "Paint living room walls",
      "categoryId": "uuid-here",
      "unit": "sf",
      "quantity": 400,
      "unitPrice": 2.50,
      "reasoning": "Standard living room size, average wall area"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional construction estimator. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse OpenAI response");
      }
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating scope:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate scope" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});