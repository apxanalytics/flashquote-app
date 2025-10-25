import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const fqKey = (Deno.env.get('FQ_OPENAI_KEY') || '').trim();
    const openaiKey = (Deno.env.get('OPENAI_API_KEY') || '').trim();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        fq_openai: {
          has: !!fqKey,
          looks_like_key: fqKey.startsWith('sk-'),
          preview: fqKey.slice(0, 10),
        },
        openai: {
          has: !!openaiKey,
          looks_like_key: openaiKey.startsWith('sk-'),
          preview: openaiKey.slice(0, 10),
        },
      },
    };

    return new Response(
      JSON.stringify(health, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Health check failed', message: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
