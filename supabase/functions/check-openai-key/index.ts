import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    return new Response(
      JSON.stringify({
        fq_has: !!fqKey,
        fq_looks_like_key: fqKey.startsWith('sk-'),
        fq_preview: fqKey.slice(0, 10),
        openai_has: !!openaiKey,
        openai_looks_like_key: openaiKey.startsWith('sk-'),
        openai_preview: openaiKey.slice(0, 10),
      }, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in check-openai-key function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
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