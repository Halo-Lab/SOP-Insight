import openai from '../config/openai.js';
import supabase from '../config/database.js';

export const analyzeTranscripts = async (req, res) => {
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
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: "You are an expert SOP compliance analyst." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
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
};

export const analyzeTranscriptsStream = async (req, res) => {
  const { transcripts, sops } = req.body;
  if (!Array.isArray(transcripts) || transcripts.length === 0 || !Array.isArray(sops) || sops.length === 0) {
    return res.status(400).json({ error: 'At least one transcript and one SOP are required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const results = [];

    for (let sopIndex = 0; sopIndex < sops.length; sopIndex++) {
      const sop = sops[sopIndex];
      const sopResults = [];

      for (let transcriptIndex = 0; transcriptIndex < transcripts.length; transcriptIndex++) {
        const transcript = transcripts[transcriptIndex];
        const prompt = `Analyze the following call transcript according to this SOP.\n\nSOP:\n${sop}\n\nTranscript:\n${transcript}`;

        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
              { role: "system", content: "You are an expert SOP compliance analyst." },
              { role: "user", content: prompt },
            ],
            temperature: 0.2,
          });

          const resultText = completion.choices[0]?.message?.content || "";
          const tokens = completion.usage?.total_tokens || 0;

          sopResults.push({ transcript, result: resultText, tokens });

          if (transcriptIndex === 0) {
            results.push({ sop, analyses: [...sopResults] });
          } else {
            results[sopIndex].analyses = [...sopResults];
          }

          const dataToSend = JSON.stringify({ results: [...results] });
          res.write(`data: ${dataToSend}\n\n`);
          res.flush && res.flush();
        } catch (error) {
          res.write(`data: ${JSON.stringify({
            error: `Error analyzing transcript ${transcriptIndex + 1} for SOP ${sopIndex + 1}: ${error.message}`,
            partialResults: results
          })}\n\n`);
          res.flush && res.flush();
        }
      }
    }

    res.write(`data: ${JSON.stringify({ results, completed: true })}\n\n`);
    res.flush && res.flush();
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message || 'OpenAI error' })}\n\n`);
    res.flush && res.flush();
    res.end();
  }
};

export const saveAnalysisHistory = async (req, res) => {
  const { name, results } = req.body;

  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Valid analysis results are required' });
  }

  try {
    const historyName = name || new Date().toLocaleString();

    const { data, error } = await supabase
      .from('analysis_history')
      .insert([{
        name: historyName,
        results: JSON.stringify(results),
        user_id: req.user.id,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalysisHistory = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalysisHistoryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Analysis history item not found' });
    }

    data.results = JSON.parse(data.results);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAnalysisHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: existingItem, error: checkError } = await supabase
      .from('analysis_history')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingItem) {
      return res.status(404).json({ error: 'Analysis history item not found' });
    }

    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAnalysisHistoryName = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const { data: existingItem, error: checkError } = await supabase
      .from('analysis_history')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingItem) {
      return res.status(404).json({ error: 'Analysis history item not found' });
    }

    const { data, error } = await supabase
      .from('analysis_history')
      .update({ name })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 