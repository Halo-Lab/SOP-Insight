import { Request, Response } from "express";
import openai from "../config/openai.js";
import supabase from "../config/database.js";
import { AuthRequest, AnalyzeResult } from "../types/index.js";

interface ResponseWithFlush extends Response {
  flush?: () => void;
}

interface TranscriptAnalysisResult {
  transcript: string;
  result: string;
  tokens: number;
}

interface SopAnalysisResult {
  sop: string;
  analyses: TranscriptAnalysisResult[];
}

export const analyzeTranscripts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { transcripts, sops } = req.body as {
    transcripts: string[];
    sops: string[];
  };

  if (
    !Array.isArray(transcripts) ||
    transcripts.length === 0 ||
    !Array.isArray(sops) ||
    sops.length === 0
  ) {
    res
      .status(400)
      .json({ error: "At least one transcript and one SOP are required." });
    return;
  }

  try {
    const results: SopAnalysisResult[] = [];

    for (const sop of sops) {
      const sopResults: TranscriptAnalysisResult[] = [];

      for (const transcript of transcripts) {
        const prompt = `Analyze the following call transcript according to this SOP.\n\nSOP:\n${sop}\n\nTranscript:\n${transcript}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert SOP compliance analyst.",
            },
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || "OpenAI error" });
  }
};

export const analyzeTranscriptsStream = async (
  req: AuthRequest,
  res: ResponseWithFlush
): Promise<void> => {
  const { transcripts, sops, startFrom, history_id } = req.body as {
    transcripts: string[];
    sops: string[];
    startFrom?: { sopIndex: number; transcriptIndex: number };
    history_id?: string;
  };

  if (
    !Array.isArray(transcripts) ||
    transcripts.length === 0 ||
    !Array.isArray(sops) ||
    sops.length === 0
  ) {
    res
      .status(400)
      .json({ error: "At least one transcript and one SOP are required." });
    return;
  }

  if (startFrom) {
    if (
      startFrom.sopIndex < 0 ||
      startFrom.sopIndex >= sops.length ||
      startFrom.transcriptIndex < 0 ||
      startFrom.transcriptIndex >= transcripts.length
    ) {
      res.status(400).json({
        error: "Invalid startFrom indices provided.",
      });
      return;
    }
  }

  let previousResults: SopAnalysisResult[] = [];
  if (history_id && req.user) {
    try {
      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .eq("id", history_id)
        .eq("user_id", req.user.id)
        .single();

      if (error) throw error;
      if (data) {
        previousResults = JSON.parse(data.results as string);
      }
    } catch (error) {
      console.error("Error fetching previous analysis:", error);
    }
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    // Use previous results if available, otherwise initialize empty array
    const results: SopAnalysisResult[] =
      previousResults.length > 0 ? previousResults : [];

    if (previousResults.length === 0 && startFrom) {
      for (let sopIndex = 0; sopIndex <= startFrom.sopIndex; sopIndex++) {
        results.push({
          sop: sops[sopIndex],
          analyses: [],
        });
      }
    } else if (startFrom && history_id) {
      for (let sopIndex = 0; sopIndex < sops.length; sopIndex++) {
        if (!results[sopIndex]) {
          results.push({
            sop: sops[sopIndex],
            analyses: [],
          });
        }
      }
    }

    const startSopIndex = startFrom ? startFrom.sopIndex : 0;
    const startTranscriptIndex = startFrom ? startFrom.transcriptIndex : 0;

    for (let sopIndex = startSopIndex; sopIndex < sops.length; sopIndex++) {
      const sop = sops[sopIndex];

      // Initialize SOP result if it doesn't exist
      if (!results[sopIndex]) {
        results.push({
          sop: sop,
          analyses: [],
        });
      }

      const sopResults = results[sopIndex].analyses;

      for (
        let transcriptIndex =
          sopIndex === startSopIndex ? startTranscriptIndex : 0;
        transcriptIndex < transcripts.length;
        transcriptIndex++
      ) {
        const existingAnalysisIndex = sopResults.findIndex(
          (a) => a.transcript === transcripts[transcriptIndex]
        );

        const isContinuationPoint =
          sopIndex === startSopIndex &&
          transcriptIndex === startTranscriptIndex;

        if (existingAnalysisIndex !== -1 && !isContinuationPoint) {
          continue;
        }

        const transcript = transcripts[transcriptIndex];
        const prompt = `Analyze the following call transcript according to this SOP.\n\nSOP:\n${sop}\n\nTranscript:\n${transcript}`;

        try {
          // TESTING ONLY: Remove this error after testing the error handling functionality
          // Only throw error when not resuming (startFrom is not set)
          if ((transcriptIndex === 1 || sopIndex === 1) && !startFrom) {
            throw new Error(
              "Test error: Simulated failure during analysis for testing purposes"
            );
          }

          const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert SOP compliance analyst.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.2,
          });

          const resultText = completion.choices[0]?.message?.content || "";
          const tokens = completion.usage?.total_tokens || 0;

          sopResults.push({ transcript, result: resultText, tokens });

          const lastProcessedIndex = {
            sopIndex,
            transcriptIndex,
          };

          // Save intermediate results to database if user is authenticated
          if (req.user) {
            // Only save every few steps to avoid too many DB writes
            const totalAnalyses = results.reduce(
              (total, sop) => total + sop.analyses.length,
              0
            );
            if (
              totalAnalyses % 5 === 0 ||
              (sopIndex === sops.length - 1 &&
                transcriptIndex === transcripts.length - 1)
            ) {
              try {
                // If we're continuing an existing analysis, update rather than create
                let currentHistoryId = history_id;
                if (currentHistoryId) {
                  await supabase
                    .from("analysis_history")
                    .update({
                      results: JSON.stringify(results),
                      last_processed_index: JSON.stringify(lastProcessedIndex),
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", currentHistoryId)
                    .eq("user_id", req.user.id);
                } else {
                  const historyName = `In Progress Analysis ${new Date().toLocaleString()}`;
                  const { data } = await supabase
                    .from("analysis_history")
                    .insert([
                      {
                        name: historyName,
                        results: JSON.stringify(results),
                        user_id: req.user.id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        is_complete: false,
                        last_processed_index:
                          JSON.stringify(lastProcessedIndex),
                      },
                    ])
                    .select();

                  // Update history_id for future iterations
                  if (data && data[0]) {
                    currentHistoryId = data[0].id;
                  }
                }
              } catch (saveError) {
                console.error("Error saving intermediate results:", saveError);
                // Continue analysis even if saving fails
              }
            }
          }

          const dataToSend = JSON.stringify({
            results: [...results],
            lastProcessedIndex,
          });
          res.write(`data: ${dataToSend}\n\n`);
          if (res.flush) res.flush();
        } catch (error: any) {
          // On error, save the current state for the client to resume later
          if (req.user && history_id) {
            try {
              await supabase
                .from("analysis_history")
                .update({
                  results: JSON.stringify(results),
                  is_complete: false,
                  updated_at: new Date().toISOString(),
                  last_processed_index: JSON.stringify({
                    sopIndex,
                    transcriptIndex,
                  }),
                })
                .eq("id", history_id)
                .eq("user_id", req.user.id);
            } catch (saveError) {
              console.error(
                "Error saving analysis state during error:",
                saveError
              );
            }
          } else if (req.user) {
            // If no history_id exists yet, create a new entry
            try {
              const historyName = `⚠️ Analysis ${new Date().toLocaleString()}`;
              const { data } = await supabase
                .from("analysis_history")
                .insert([
                  {
                    name: historyName,
                    results: JSON.stringify(results),
                    user_id: req.user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_complete: false,
                    last_processed_index: JSON.stringify({
                      sopIndex,
                      transcriptIndex,
                    }),
                  },
                ])
                .select();

              // Include the new history id in the error response
              if (data && data[0]) {
                res.write(
                  `data: ${JSON.stringify({
                    error: `Error analyzing transcript ${
                      transcriptIndex + 1
                    } for SOP ${sopIndex + 1}: ${error.message}`,
                    partialResults: results,
                    lastProcessedIndex: {
                      sopIndex,
                      transcriptIndex,
                    },
                    historyId: data[0].id,
                  })}\n\n`
                );
                if (res.flush) res.flush();
                res.end();
                return;
              }
            } catch (saveError) {
              console.error("Error creating new history on error:", saveError);
            }
          }

          res.write(
            `data: ${JSON.stringify({
              error: `Error analyzing transcript ${
                transcriptIndex + 1
              } for SOP ${sopIndex + 1}: ${error.message}`,
              partialResults: results,
              lastProcessedIndex: {
                sopIndex,
                transcriptIndex,
              },
            })}\n\n`
          );
          if (res.flush) res.flush();
          res.end();
          return;
        }
      }
    }

    // Mark analysis as complete
    if (req.user && history_id) {
      try {
        await supabase
          .from("analysis_history")
          .update({
            is_complete: true,
            results: JSON.stringify(results), // Ensure final results are saved
          })
          .eq("id", history_id)
          .eq("user_id", req.user.id);
      } catch (saveError) {
        console.error("Error marking analysis as complete:", saveError);
      }
    }

    res.write(`data: ${JSON.stringify({ results, completed: true })}\n\n`);
    if (res.flush) res.flush();
    res.end();
  } catch (error: any) {
    res.write(
      `data: ${JSON.stringify({ error: error.message || "OpenAI error" })}\n\n`
    );
    if (res.flush) res.flush();
    res.end();
  }
};

export const saveAnalysisHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, results, is_complete } = req.body as {
    name?: string;
    results: SopAnalysisResult[];
    is_complete: boolean;
  };

  if (!results || !Array.isArray(results)) {
    res.status(400).json({ error: "Valid analysis results are required" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const historyName = name || new Date().toLocaleString();

    const { data, error } = await supabase
      .from("analysis_history")
      .insert([
        {
          name: historyName,
          results: JSON.stringify(results),
          user_id: req.user.id,
          created_at: new Date().toISOString(),
          is_complete: is_complete !== undefined ? is_complete : true,
        },
      ])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalysisHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalysisHistoryItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("analysis_history")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "Analysis history item not found" });
      return;
    }

    // Parse the stored JSON string back to an object
    const parsedData = {
      ...data,
      results: JSON.parse(data.results as string),
    };

    res.json(parsedData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAnalysisHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const { data: existingItem, error: checkError } = await supabase
      .from("analysis_history")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingItem) {
      res.status(404).json({ error: "Analysis history item not found" });
      return;
    }

    const { error } = await supabase
      .from("analysis_history")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAnalysisHistoryName = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body as { name: string };

  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const { data: existingItem, error: checkError } = await supabase
      .from("analysis_history")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingItem) {
      res.status(404).json({ error: "Analysis history item not found" });
      return;
    }

    const { data, error } = await supabase
      .from("analysis_history")
      .update({ name })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAnalysisHistoryIsComplete = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { is_complete } = req.body as { is_complete: boolean };

  if (is_complete === undefined) {
    res.status(400).json({ error: "is_complete field is required" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const { data: existingItem, error: checkError } = await supabase
      .from("analysis_history")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (checkError) throw checkError;
    if (!existingItem) {
      res.status(404).json({ error: "Analysis history item not found" });
      return;
    }

    const { data, error } = await supabase
      .from("analysis_history")
      .update({ is_complete })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
