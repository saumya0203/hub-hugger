import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BarChart3, Lightbulb, MessageSquare } from "lucide-react";
import EventsList from "@/components/EventsList";
import EventForm from "@/components/EventForm";
import FeedbackForm from "@/components/FeedbackForm";
import Analytics from "@/components/Analytics";
import EventSuggestions from "@/components/EventSuggestions";

const Index = () => {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            VocaLinc Event Hub
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover, Create & Share Community Events
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <EventsList />
              <EventForm />
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackForm />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="suggestions">
            <EventSuggestions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
