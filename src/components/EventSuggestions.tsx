import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EventSuggestions = () => {
  const [apiKey, setApiKey] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{title: string, description: string}>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: recentEvents } = useQuery({
    queryKey: ["recent-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("title, description")
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  const generateSuggestions = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to generate suggestions.",
        variant: "destructive",
      });
      return;
    }

    if (!recentEvents || recentEvents.length === 0) {
      toast({
        title: "No Events Found",
        description: "Create some events first to get AI-powered suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const eventsContext = recentEvents
        .map(event => `${event.title}: ${event.description}`)
        .join('\n');

      const prompt = `Based on these past community events:

${eventsContext}

Suggest 3 new creative event ideas for a residential community. For each suggestion, provide:
- A catchy title (max 50 characters)
- A detailed description (max 200 characters)

Format your response as JSON array:
[
  {"title": "Event Title", "description": "Event description"},
  {"title": "Event Title", "description": "Event description"},
  {"title": "Event Title", "description": "Event description"}
]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a community event planning assistant. Generate creative, family-friendly event ideas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsedSuggestions = JSON.parse(content);
        setSuggestions(parsedSuggestions);
        toast({
          title: "Suggestions Generated",
          description: "AI has created new event ideas for your community!",
        });
      } catch (parseError) {
        throw new Error("Failed to parse AI response");
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate suggestions. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6" />
          AI Event Suggestions
        </h2>
        <p className="text-muted-foreground">
          Get creative event ideas powered by AI based on your community's activity
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Enter your OpenAI API key to generate personalized event suggestions. Your key is not stored and only used for this session.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Ideas</CardTitle>
          <CardDescription>
            AI will analyze your recent events to suggest new community activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={generateSuggestions}
            disabled={isGenerating || !apiKey.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI-Generated Event Ideas</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                    {suggestion.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {suggestion.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {recentEvents && recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Events (AI Context)</CardTitle>
            <CardDescription>
              These events will be used to generate personalized suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEvents.map((event, index) => (
                <div key={index} className="border-l-2 border-primary pl-4 py-2">
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventSuggestions;