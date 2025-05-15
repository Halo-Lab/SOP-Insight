CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    results JSONB NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analysis history" 
    ON public.analysis_history 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis history" 
    ON public.analysis_history 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis history" 
    ON public.analysis_history 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis history" 
    ON public.analysis_history 
    FOR DELETE 
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS analysis_history_user_id_idx ON public.analysis_history(user_id);

CREATE INDEX IF NOT EXISTS analysis_history_created_at_idx ON public.analysis_history(created_at DESC); 