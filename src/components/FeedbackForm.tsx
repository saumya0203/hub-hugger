import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare } from "lucide-react";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    event_id: "",
    rating: "",
    comment: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: feedbacks } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select(`
          *,
          events (title)
        `)
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("feedback").insert([{
        event_id: data.event_id,
        rating: parseInt(data.rating),
        comment: data.comment || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      setFormData({
        event_id: "",
        rating: "",
        comment: "",
      });
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedbackMutation.mutate(formData);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Submit Feedback
          </CardTitle>
          <CardDescription>
            Share your experience about community events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event">Select Event</Label>
              <Select
                value={formData.event_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, event_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={formData.rating}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rate the event (1-5)" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{rating}</span>
                        <div className="flex">{renderStars(rating)}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about the event..."
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={!formData.event_id || !formData.rating || submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>
            See what others are saying about our events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {feedbacks?.map((feedback) => (
              <div key={feedback.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{feedback.events?.title}</h4>
                  <div className="flex">{renderStars(feedback.rating)}</div>
                </div>
                {feedback.comment && (
                  <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(feedback.submitted_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackForm;