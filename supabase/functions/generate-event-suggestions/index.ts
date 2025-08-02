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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
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

    // Prepare context for Gemini
    const eventsContext = recentEvents && recentEvents.length > 0 
      ? recentEvents.map(event => `* ${event.title}: ${event.description}`).join('\n')
      : '* No recent events available';

    const prompt = `Based on these past community events:

${eventsContext}

Suggest 3 new creative event ideas for a residential community. For each event, also create a promotional message that managers can copy and share. Return a JSON array with this exact structure:
[
  {
    "title": "Event Title",
    "description": "Brief description of the event",
    "category": "Category like Technology, Safety, Training, etc.",
    "promotionalMessage": "Ready-to-share promotional text with emojis that managers can copy and paste to promote this event"
  }
]

Make the suggestions diverse, engaging, and suitable for a residential community. The promotional messages should be catchy and include relevant emojis.`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Gemini API error: ${response.status}`;
      
      if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please check your Gemini API usage limits and try again later.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Invalid Gemini API key. Please check your API key configuration.';
      }
      
      console.error('Gemini API Error Details:', errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Clean the response text to extract JSON
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    const suggestions = JSON.parse(jsonMatch[0]);

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