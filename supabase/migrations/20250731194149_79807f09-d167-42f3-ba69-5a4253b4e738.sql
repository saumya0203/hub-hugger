-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for events (public read, admin write)
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (true);

-- Create policies for feedback (public read and write)
CREATE POLICY "Feedback is viewable by everyone" 
ON public.feedback 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can submit feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (true);

-- Insert sample events
INSERT INTO public.events (title, location, date, time, description) VALUES
('Yoga Session', 'Community Garden', '2025-02-15', '07:00:00', 'Start your day with a relaxing yoga session in our beautiful community garden. All levels welcome!'),
('Movie Night', 'Community Hall', '2025-02-20', '19:30:00', 'Join us for a family-friendly movie night with popcorn and refreshments. This month featuring a classic adventure film.'),
('Tree Plantation Drive', 'Green Space Area', '2025-02-25', '09:00:00', 'Help make our community greener! Bring your family and join us in planting trees around the residential area.'),
('Kids Talent Show', 'Main Auditorium', '2025-03-01', '16:00:00', 'Showcase your children''s talents! A fun evening where kids can perform singing, dancing, magic tricks, and more.');

-- Insert sample feedback
INSERT INTO public.feedback (event_id, rating, comment) VALUES
((SELECT id FROM public.events WHERE title = 'Yoga Session'), 5, 'Amazing instructor and peaceful atmosphere!'),
((SELECT id FROM public.events WHERE title = 'Yoga Session'), 4, 'Great way to start the morning, would love more sessions.'),
((SELECT id FROM public.events WHERE title = 'Movie Night'), 5, 'Perfect family event, kids loved it!'),
((SELECT id FROM public.events WHERE title = 'Movie Night'), 4, 'Good movie choice and great snacks.'),
((SELECT id FROM public.events WHERE title = 'Tree Plantation Drive'), 5, 'Important initiative for our environment!'),
((SELECT id FROM public.events WHERE title = 'Kids Talent Show'), 3, 'Kids enjoyed it but could use better sound system.');