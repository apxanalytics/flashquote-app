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
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const contextPrompt = formData.get('contextPrompt') as string || 'Transcribe this contractor describing a home remodeling job:';

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let rawKey = (Deno.env.get('FQ_OPENAI_KEY') || Deno.env.get('OPENAI_API_KEY') || '').trim();

    if (!rawKey.startsWith('sk-')) {
      console.error('[ERROR] No valid OpenAI key found');
      return new Response(
        JSON.stringify({
          error: 'bad_key',
          details: 'Set FQ_OPENAI_KEY or OPENAI_API_KEY in Supabase Edge Function secrets and redeploy.',
          hasKey: !!rawKey,
          startsWithSk: rawKey.startsWith('sk-'),
          preview: rawKey.slice(0, 10),
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const openaiApiKey = rawKey;

    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'en');
    whisperFormData.append('response_format', 'json');
    if (contextPrompt) {
      whisperFormData.append('prompt', contextPrompt);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ text: result.text }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in whisper-transcribe function:', error);
    return new Response(
      JSON.stringify({
        error: 'Transcription failed',
        message: error.message,
      }),
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
