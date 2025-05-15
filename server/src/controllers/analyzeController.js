import openai from '../config/openai.js';

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