import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:3000'}/email-confirmation`,
      }
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('Registration failed - no user data returned');
    }

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add /auth/me endpoint
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(req.headers['authorization'].split(' ')[1]);

    if (error) throw error;

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route' });
});

app.post('/analyze', authenticateToken, async (req, res) => {
  const { transcripts, sops } = req.body;
  if (!Array.isArray(transcripts) || transcripts.length === 0 || !Array.isArray(sops) || sops.length === 0) {
    return res.status(400).json({ error: 'At least one transcript and one SOP are required.' });
  }

  try {
    const results = [];
    for (const sop of sops) {
      const sopResults = [];
      for (const transcript of transcripts) {
        const prompt = `Analyze the following call transcript according to this SOP.\n\nSOP:\n${sop}\n\nTranscript:\n${transcript}`;
        const completion = await openai.chat.completions.create({
          // model: "gpt-4",
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: "You are an expert SOP compliance analyst." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          // max_tokens: 1000,
        });
        const resultText = completion.choices[0]?.message?.content || "";
        const tokens = completion.usage?.total_tokens || 0;
        sopResults.push({ transcript, result: resultText, tokens });
      }
      results.push({ sop, analyses: sopResults });
    }
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message || 'OpenAI error' });
  }
});

// SOP routes
app.post('/sop', authenticateToken, async (req, res) => {
  const { name, content } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }

  try {
    const { data, error } = await supabase
      .from('sops')
      .insert([{ name, content, user_id: req.user.id }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/sop', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sops')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/sop/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, content } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }

  try {
    // First check if SOP exists and belongs to user
    const { data: existingSop, error: checkError } = await supabase
      .from('sops')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingSop) {
      return res.status(404).json({ error: 'SOP not found' });
    }

    // Update SOP
    const { data, error } = await supabase
      .from('sops')
      .update({ name, content })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/sop/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // First check if SOP exists and belongs to user
    const { data: existingSop, error: checkError } = await supabase
      .from('sops')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingSop) {
      return res.status(404).json({ error: 'SOP not found' });
    }

    // Delete SOP
    const { error } = await supabase
      .from('sops')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 