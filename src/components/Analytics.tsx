import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Star, Calendar } from "lucide-react";

const Analytics = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      // Get event-wise average rating and feedback count
      const { data: feedbackStats, error } = await supabase
        .from("feedback")
        .select(`
          rating,
          events (title)
        `);
      
      if (error) throw error;

      // Process data for charts
      const eventStats = feedbackStats.reduce((acc: any, feedback) => {
        const eventTitle = feedback.events?.title || "Unknown";
        if (!acc[eventTitle]) {
          acc[eventTitle] = {
            title: eventTitle,
            totalRating: 0,
            count: 0,
            ratings: []
          };
        }
        acc[eventTitle].totalRating += feedback.rating;
        acc[eventTitle].count += 1;
        acc[eventTitle].ratings.push(feedback.rating);
        return acc;
      }, {});

      const chartData = Object.values(eventStats).map((event: any) => ({
        name: event.title,
        avgRating: Number((event.totalRating / event.count).toFixed(1)),
        feedbackCount: event.count,
      }));

      // Rating distribution for pie chart
      const ratingDistribution = feedbackStats.reduce((acc: any, feedback) => {
        const rating = feedback.rating;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {});

      const pieData = Object.entries(ratingDistribution).map(([rating, count]) => ({
        name: `${rating} Stars`,
        value: count as number,
        rating: parseInt(rating),
      }));

      const totalEvents = new Set(feedbackStats.map(f => f.events?.title)).size;
      const totalFeedbacks = feedbackStats.length;
      const avgOverallRating = feedbackStats.reduce((sum, f) => sum + f.rating, 0) / feedbackStats.length;

      return {
        chartData,
        pieData,
        totalEvents,
        totalFeedbacks,
        avgOverallRating: Number(avgOverallRating.toFixed(1)),
      };
    },
  });

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Event Analytics</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalFeedbacks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.avgOverallRating || 0}/5</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.totalEvents ? 
                Math.round((analyticsData.totalFeedbacks / analyticsData.totalEvents) * 100) / 100 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Avg feedback per event</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Ratings</CardTitle>
            <CardDescription>Average rating per event</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="avgRating" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>How ratings are distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.pieData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData?.pieData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.rating - 1]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;