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
    const { message, context, history, transcript, userSettings, parseMode } = await req.json();

    if (!message && !transcript) {
      return new Response(
        JSON.stringify({ error: 'Message or transcript is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const openaiApiKey = (Deno.env.get('FQ_OPENAI_KEY') || Deno.env.get('OPENAI_API_KEY') || '').trim();
    if (!openaiApiKey.startsWith('sk-')) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured',
          response: "I'm unable to process complex questions right now. Try asking me to create a job, check status, or view invoices.",
          quickReplies: ['Create new job', 'Check overdue invoices', 'List customers']
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (parseMode && transcript && userSettings) {
      return await parseJobTranscript(transcript, userSettings, openaiApiKey, corsHeaders);
    }

    const systemPrompt = `You are a helpful AI assistant for ContractorAI, a contractor management app.

User context:
- Business name: ${context.businessName}
- Active jobs: ${context.activeJobsCount}
- Pending invoices: ${context.pendingInvoicesCount}
- Overdue invoices: ${context.overdueInvoicesCount}
- Current page: ${context.currentPage}

You can help users with:
1. Creating proposals and jobs
2. Managing invoices and payments
3. Tracking customer status
4. Understanding app features
5. Troubleshooting

Guidelines:
- Be concise (2-3 sentences max)
- Be friendly and action-oriented
- Suggest specific next steps
- Don't make up features that don't exist
- If you can't help, direct them to support or the help center

Important: Keep responses under 150 words.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-5).map((h: any) => ({
        role: h.role,
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error');
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    const quickReplies = generateQuickReplies(message, context);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        quickReplies,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    return new Response(
      JSON.stringify({ 
        response: "I'm having trouble right now. Try asking me to create a job, check invoices, or list customers.",
        quickReplies: ['Create new job', 'Check overdue invoices', 'List customers', 'View help center']
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function generateQuickReplies(message: string, context: any): string[] {
  const msg = message.toLowerCase();
  
  if (msg.includes('job') || msg.includes('proposal')) {
    return ['Create new job', 'View all jobs', 'How do proposals work?'];
  }
  
  if (msg.includes('invoice') || msg.includes('payment')) {
    return ['Create invoice', 'Check overdue invoices', 'How do I get paid faster?'];
  }
  
  if (msg.includes('customer')) {
    return ['List all customers', 'Add new customer', 'Find a customer'];
  }
  
  if (context.overdueInvoicesCount > 0) {
    return ['Check overdue invoices', 'Send payment reminders', 'Create new job'];
  }
  
  return ['Create new job', 'Check overdue invoices', 'List customers', 'View help center'];
}

async function parseJobTranscript(
  transcript: string,
  userSettings: { hourlyRate: number; materialMarkup: number; trade: string },
  openaiApiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const systemPrompt = `You are an expert contractor assistant. Parse contractor voice descriptions into structured proposal data.

Extract:
1. Job type and title
2. Room/area and measurements (convert descriptions to square feet when possible)
3. Scope of work (detailed bullet points)
4. Materials needed (itemized list with estimated quantities and prices)
5. Estimated labor hours
6. Timeline in days

User's business settings:
- Hourly rate: $${userSettings.hourlyRate}
- Material markup: ${userSettings.materialMarkup}%
- Trade: ${userSettings.trade}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.

JSON structure:
{
  "jobTitle": "string",
  "roomType": "string",
  "measurements": {
    "length": number,
    "width": number,
    "height": number,
    "totalSqFt": number
  },
  "scopeOfWork": ["string"],
  "materials": [
    {
      "item": "string",
      "quantity": number,
      "unit": "string",
      "unitPrice": number,
      "total": number
    }
  ],
  "laborHours": number,
  "laborCost": number,
  "materialsCost": number,
  "totalCost": number,
  "durationDays": number,
  "notes": "string"
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Parse this contractor description:\n\n"${transcript}"`
      }
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to parse transcript');
    }

    const openaiData = await openaiResponse.json();
    let result = openaiData.choices[0].message.content.trim();

    let proposalData;
    try {
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        proposalData = JSON.parse(jsonMatch[1]);
      } else {
        proposalData = JSON.parse(result);
      }
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', result);
      throw new Error('Invalid response format from AI');
    }

    if (!proposalData.laborCost) {
      proposalData.laborCost = proposalData.laborHours * userSettings.hourlyRate;
    }
    if (!proposalData.totalCost) {
      proposalData.totalCost = proposalData.laborCost + proposalData.materialsCost;
    }

    return new Response(
      JSON.stringify({
        proposalData,
        success: true
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error parsing transcript:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to parse job description',
        message: error.message
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
}