import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent events from database
    const { data: recentEvents, error } = await supabase
      .from('events')
      .select('title, description')
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Prepare context for OpenAI
    const eventsContext = recentEvents && recentEvents.length > 0 
      ? recentEvents.map(event => `* ${event.title}: ${event.description}`).join('\n')
      : '* No recent events available';

    const prompt = `Based on these past community events:

${eventsContext}

Suggest 3 new creative event ideas for a residential community. Return a JSON array with this exact structure:
[
  {
    "title": "Event Title",
    "description": "Brief description of the event",
    "category": "Category like Technology, Safety, Training, etc."
  }
]

Make the suggestions diverse, engaging, and suitable for a residential community.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates creative community event suggestions. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestions = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-event-suggestions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});