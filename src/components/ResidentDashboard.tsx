import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ResidentDashboard() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const queryClient = useQueryClient();

  // Fetch events for feedback form
  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      const { data, error } = await supabase
        .from("feedback")
        .insert([feedbackData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Feedback submitted successfully!");
      setSelectedEvent("");
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (error) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent || rating === 0) {
      toast.error("Please select an event and rating");
      return;
    }

    submitFeedbackMutation.mutate({
      event_id: selectedEvent,
      rating,
      comment: comment.trim() || null
    });
  };

  const renderStars = (currentRating: number, onStarClick: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onStarClick(star)}
            className={`w-8 h-8 ${
              star <= currentRating
                ? "text-yellow-400"
                : "text-gray-500"
            } hover:text-yellow-300 transition-colors`}
          >
            <Star className={`w-6 h-6 ${star <= currentRating ? "fill-current" : ""}`} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Event Feedback
          </CardTitle>
          <CardDescription className="text-gray-400">
            Share your thoughts about community events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitFeedback} className="space-y-6">
            {/* Event Selection */}
            <div>
              <label className="text-gray-300 block mb-2">Select Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Choose an event to review" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {events?.map((event) => (
                    <SelectItem 
                      key={event.id} 
                      value={event.id}
                      className="text-white hover:bg-gray-600"
                    >
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-gray-300 block mb-3">Overall Rating</label>
              <div className="flex items-center gap-4">
                {renderStars(rating, setRating)}
                <span className="text-gray-400 text-sm">
                  {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="text-gray-300 block mb-2">Comments & Suggestions</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your feedback about recent events, suggest improvements, or propose new event ideas..."
                className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                rows={5}
              />
            </div>

            <Button
              type="submit"
              disabled={submitFeedbackMutation.isPending || !selectedEvent || rating === 0}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}