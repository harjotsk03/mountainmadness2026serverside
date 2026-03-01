import path from "path";
import * as dotenv from "dotenv";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Load .env from project root (cwd when you run npm run dev)
dotenv.config({ path: path.join(process.cwd(), ".env") });
// Fallback: from server file location (e.g. src/server.ts -> project root)
dotenv.config({ path: path.join(__dirname, "..", ".env") });


import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { supabase } from "./services/supabase";

const ai = new GoogleGenAI({});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Hackathon backend running 🚀"));

interface CalendarEvent {
  people?: string;
  created_at?: string;
  description?: string;
  summary?: string;
  start?: string;
  end?: string;
  location?: string;
  event_id?: string;
}

interface Suggestion {
  suggestion: string;
  explanation: string;
  potential_savings: string;
  confidence: string;
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
}

app.post("/webhook/calendar", async (req, res) => {
  const event: CalendarEvent = req.body;

  console.log("--- New Calendar Event ---");
  console.log(JSON.stringify(event, null, 2));

  console.log(event.people);
  console.log(event.description);
  console.log(event.summary);
  console.log(event.start);
  console.log(event.end);
  console.log(event.location);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
    You are a helpful assistant that can help me with my calendar events.
    The user has these boards, and who is on each board: [
  {
    "user_id": "d662c9c9-0522-43a2-9352-970f867e17bd",
    "name": "Md Kashfi Pranta",
    "email": "kashfiorrashid@gmail.com",
    "board_id": "d4b6deb0-76f5-42b5-b821-17bdcc258a54",
    "board_name": "Friends Board",
    "type": "friend",
    "role": "member"
  },
  {
    "user_id": "c6e7e6ea-6ab5-46ce-a37a-d131fb5669e0",
    "name": "Harjot Singh",
    "email": "harjotsk03@gmail.com",
    "board_id": "d4b6deb0-76f5-42b5-b821-17bdcc258a54",
    "board_name": "Friends Board",
    "type": "friend",
    "role": "admin"
  },
  {
    "user_id": "c6e7e6ea-6ab5-46ce-a37a-d131fb5669e0",
    "name": "Harjot Singh",
    "email": "harjotsk03@gmail.com",
    "board_id": "e46a8937-1fac-4de1-9405-732b676a1bda",
    "board_name": "Personal Board",
    "type": "personal",
    "role": "admin"
  },
  {
    "user_id": "64c04903-e4e0-40fc-814a-08f49229a3ad",
    "name": "Gurleen Gill",
    "email": "gurleeng000@gmail.com",
    "board_id": "b4bcd468-c162-4b4e-b7a3-f89eb546ea93",
    "board_name": "Spouse Board",
    "type": "personal",
    "role": "member"
  },
  {
    "user_id": "c6e7e6ea-6ab5-46ce-a37a-d131fb5669e0",
    "name": "Harjot Singh",
    "email": "harjotsk03@gmail.com",
    "board_id": "b4bcd468-c162-4b4e-b7a3-f89eb546ea93",
    "board_name": "Spouse Board",
    "type": "personal",
    "role": "admin"
  },
  {
    "user_id": "d9b7449e-ccc7-4a0f-9c9c-8510fa60d728",
    "name": "Carlos Rodriguez",
    "email": "carlos.rodriguez@rbc.ca",
    "board_id": "b2416bb1-5577-42bd-b7fd-5ead732f1a40",
    "board_name": "Work Board",
    "type": "work",
    "role": "member"
  },
  {
    "user_id": "5a4640a8-68aa-4740-ab7b-b81b315ffd43",
    "name": "Linh Nguyen",
    "email": "linh.nguyen@rbc.ca",
    "board_id": "b2416bb1-5577-42bd-b7fd-5ead732f1a40",
    "board_name": "Work Board",
    "type": "work",
    "role": "member"
  },
  {
    "user_id": "1b859680-dcc9-4cf9-8fb6-cd814ea48774",
    "name": "Amara Okafor",
    "email": "amara.okafor@rbc.ca",
    "board_id": "b2416bb1-5577-42bd-b7fd-5ead732f1a40",
    "board_name": "Work Board",
    "type": "work",
    "role": "member"
  },
  {
    "user_id": "b4636ce3-cad0-4ce2-806c-ea606a26cf91",
    "name": "Aisha Patel",
    "email": "aisha.patel@rbc.ca",
    "board_id": "b2416bb1-5577-42bd-b7fd-5ead732f1a40",
    "board_name": "Work Board",
    "type": "work",
    "role": "member"
  },
  {
    "user_id": "c6e7e6ea-6ab5-46ce-a37a-d131fb5669e0",
    "name": "Harjot Singh",
    "email": "harjotsk03@gmail.com",
    "board_id": "b2416bb1-5577-42bd-b7fd-5ead732f1a40",
    "board_name": "Work Board",
    "type": "work",
    "role": "admin"
  }
],
    each board has a name and type. Using the JSON data of our newest event, determine which board it belongs to.
    I have the following event:
    ${JSON.stringify(event, null, 2)}
    Please return a JSON object with the following fields:
    - board_id: the id of the board the event belongs to
    - title: the title of the event
    - description: the description of the event
    - calendar_source: the source of the event (e.g. "Google Calendar", "Outlook", "iCal", "Yahoo Calendar", "Other")
    - start_time: the start time of the event
    - end_time: the end time of the event
    - location: the location of the event
    - event_type: the type of the event (bill, subscription, coffee, movie, dining, entertainment, concert, gym, fuel)
    `,
  });
  const raw = response.text ?? "";
  const jsonStr = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  let parsed: {
    board_id?: string;
    title?: string;
    description?: string;
    calendar_source?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    event_type?: string;
  };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    console.error("Failed to parse AI response as JSON:", raw);
    return res.status(500).json({ error: "Invalid AI response" });
  }
  if (!parsed.title || !parsed.start_time || !parsed.board_id) {
    return res.status(400).json({
      error: "AI response missing required fields: title, start_time, board_id",
    });
  }

  const { data: row, error } = await supabase
    .from("events")
    .insert({
      user_id: "c6e7e6ea-6ab5-46ce-a37a-d131fb5669e0",
      title: parsed.title.slice(0, 100),
      description: parsed.description ?? null,
      calendar_source: "google",
      start_time: parsed.start_time,
      end_time: parsed.end_time ?? null,
      location: parsed.location?.slice(0, 100) ?? null,
      event_type: parsed.event_type ?? "other",
      board_id: parsed.board_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }
  console.log("Created event:", row?.id);

  const eventType = parsed.event_type ?? "other";

  const { data: sameTypeEvents } = await supabase
    .from("events")
    .select("*")
    .eq("board_id", parsed.board_id)
    .eq("event_type", eventType);

  const eventIds = (sameTypeEvents ?? []).map((e: { id: string }) => e.id);
  let transactions: unknown[] = [];
  if (eventIds.length > 0) {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .in("event_id", eventIds);
    transactions = txData ?? [];
  }

  console.log("Same type events:", sameTypeEvents);
  console.log("Transactions:", transactions);

  const predictionResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
You are given historical events of type "${eventType}" on a board, their linked transactions (actual amounts spent), and a NEW event of the same type.
Based on the historical amounts for this event type, predict the likely cost for the NEW event.

Historical events and their transactions:
${JSON.stringify({ events: sameTypeEvents, transactions }, null, 2)}

New event (predict for this one):
${JSON.stringify(row, null, 2)}

Return ONLY a JSON object with exactly two numeric fields:
- predicted_amount: estimated cost in dollars (number, e.g. 25.50)
- predicted_confidence: your confidence in this estimate from 0 to 1 (number, e.g. 0.85)
No other text or markdown. Example: {"predicted_amount": 32.00, "predicted_confidence": 0.8}
`,
  });

  const predRaw = predictionResponse.text ?? "";
  const predStr = predRaw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  let predicted_amount: number | null = null;
  let predicted_confidence: number | null = null;
  try {
    const pred = JSON.parse(predStr) as {
      predicted_amount?: number;
      predicted_confidence?: number;
    };
    if (typeof pred.predicted_amount === "number")
      predicted_amount = pred.predicted_amount;
    if (typeof pred.predicted_confidence === "number")
      predicted_confidence = pred.predicted_confidence;
  } catch {
    console.warn("Could not parse prediction response:", predRaw);
  }

  if (predicted_amount !== null || predicted_confidence !== null) {
    await supabase
      .from("events")
      .update({
        ...(predicted_amount !== null && { predicted_amount }),
        ...(predicted_confidence !== null && { predicted_confidence }),
      })
      .eq("id", row.id);
  }

  const { data: updatedRow } = await supabase
    .from("events")
    .select("*")
    .eq("id", row.id)
    .single();

  console.log("Updated event:", updatedRow);

  const { error: suggestionError } = await supabase
    .from("get_suggestions")
    .insert({
      board_id: parsed.board_id,
      most_recent_event_id: row.id,
      is_resolved: false,
    });
  if (suggestionError)
    console.error("get_suggestions insert error:", suggestionError);

  res.status(200).json({ received: true, event: updatedRow ?? row });
});

async function processSuggestion(row: {
  id: number;
  board_id: string;
  most_recent_event_id: string;
}) {
  try {
    console.log(
      "[suggestions cron] Processing:",
      row.id,
      row.board_id,
      row.most_recent_event_id,
    );

    const { error: markError } = await supabase
      .from("get_suggestions")
      .update({ is_resolved: true })
      .eq("id", row.id);
    if (markError) {
      console.error(
        "[suggestions cron] Failed to mark row resolved:",
        markError,
      );
      return;
    }

    const newEvent = await supabase
      .from("events")
      .select("*")
      .eq("id", row.most_recent_event_id)
      .single();
    console.log("New event:", newEvent);

    const { data: board } = await supabase
      .from("boards")
      .select("*")
      .eq("id", row.board_id)
      .single();
    const twoWeeksAgo = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("board_id", row.board_id)
      .gte("start_time", twoWeeksAgo);
    if (eventsError)
      console.error("[suggestions cron] Events query error:", eventsError);
    const eventIds = (events ?? []).map((e: { id: string }) => e.id);
    let transactions: unknown[] = [];
    if (eventIds.length > 0) {
      const res = await supabase
        .from("transactions")
        .select("*")
        .in("event_id", eventIds);
      if (res.error)
        console.error(
          "[suggestions cron] Transactions query error:",
          res.error,
        );
      transactions = res.data ?? [];
    }

    console.log("Board:", board);
    console.log("Events:", events ?? []);
    console.log("Transactions:", transactions ?? []);

    const openaiResponse = await openai.responses.create({
      model: "o3",
      input: `
You are a helpful assistant that can help me with my suggestions.
I have the following board, events, and transactions:
${JSON.stringify({ board, events, transactions, newEvent }, null, 2)}
Please return suggestions for this new event, the suggestion should be detailed and specific, and what exactly the user should do to save money given that event.
  `,
      reasoning: {
        effort: "high",
      },
      text: {
        format: {
          type: "json_schema",
          name: "suggestions_response",
          strict: true,
          schema: {
            type: "object" as const,
            properties: {
              suggestions: {
                type: "array" as const,
                items: {
                  type: "object" as const,
                  properties: {
                    suggestion: { type: "string" as const },
                    explanation: { type: "string" as const },
                    potential_savings: { type: "number" as const },
                    confidence: { type: "number" as const },
                  },
                  required: [
                    "suggestion",
                    "explanation",
                    "potential_savings",
                    "confidence",
                  ] as const,
                  additionalProperties: false,
                },
              },
            },
            required: ["suggestions"] as const,
            additionalProperties: false,
          },
        },
      },
    });

    console.log(openaiResponse);

    const parsed: SuggestionsResponse = JSON.parse(openaiResponse.output_text);

    const { data: userBoards } = await supabase
      .from("user_boards")
      .select("id")
      .eq("board_id", row.board_id);
    const memberCount = userBoards?.length ?? 0;
    const votes = Math.max(0, memberCount - 1);

    if (parsed.suggestions.length) {
      console.log("Parsed suggestions:", parsed.suggestions);
      const rowsToInsert = parsed.suggestions.map((s: Suggestion) => ({
        suggestion: s.suggestion,
        explanation: s.explanation,
        potential_savings: s.potential_savings,
        confidence: s.confidence,
        board_id: row.board_id,
        event_id: row.most_recent_event_id,
        votes,
        is_completed: false,
        confetti_shown: false,
      }));
      const { error: insertError } = await supabase
        .from("suggestions")
        .insert(rowsToInsert);
      if (insertError)
        console.error(
          "[suggestions cron] Suggestions insert error:",
          insertError,
        );
    }
    console.log("[suggestions cron] Processed id:", row.id);
  } catch (err) {
    console.error("[suggestions cron] Error:", err);
  }
}

const SUGGESTIONS_POLL_MS = 1000;
setInterval(async () => {
  const { data: rows } = await supabase
    .from("get_suggestions")
    .select("id, board_id, most_recent_event_id")
    .eq("is_resolved", false)
    .order("created_at", { ascending: true })
    .limit(1);
  if (rows?.length) await processSuggestion(rows[0]);
}, SUGGESTIONS_POLL_MS);

// app.post("/coachchat", async (req, res) => {
//   const { message, board_id } = req.body;
//   const [{ data: board }, { data: events }] = await Promise.all([
//     supabase.from("boards").select("*").eq("id", board_id).single(),
//     supabase.from("events").select("*").eq("board_id", board_id),
//   ]);

//   if (!board) return res.status(400).json({ error: "Board not found" });
//   if (!events) return res.status(400).json({ error: "Events not found" });

//   const { data: transactions } = await supabase
//     .from("transactions")
//     .select("*")
//     .in(
//       "event_id",
//       events.map((e: { id: string }) => e.id),
//     );
//   if (!transactions) {
//     return res.status(400).json({ error: "Transactions not found" });
//   }
//   const conversation = `
//   Board:
//   ${JSON.stringify(board, null, 2)}
//   Events:
//   ${JSON.stringify(events, null, 2)}
//   Transactions:
//   ${JSON.stringify(transactions, null, 2)}
//   `;
//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content: `You are going to be given data about a board, the events, and transactions within that board, and you are going to respond to the user's message. They will ask about some financial advice, and you are going to give them the advice. Use data and info to back up and justify your advice. Give no more than 3 suggestions, but make them detailed and specific, and what exactly the user should do to save money given that event. Todays date is ${new Date().toISOString().split("T")[0]} so you should use that date to make your suggestions. Also limit your response to 300 words.`,
//       },
//       {
//         role: "system",
//         content: `Here is the data about the board, events, and transactions:
// ${conversation}`,
//       },
//       { role: "user", content: message },
//     ],
//   });

//   let responseText = response.choices[0].message.content;

//   const elevenlabs = new ElevenLabsClient();
//   const audio = await elevenlabs.textToSpeech.convert("l4Coq6695JDX9xtLqXDE", {
//     text: responseText ?? "",
//     modelId: "eleven_turbo_v2_5",
//     outputFormat: "mp3_44100_128",
//   });
//   const reader = audio.getReader();
//   const chunks: Uint8Array[] = [];
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     if (value) chunks.push(value);
//   }
//   const audioBuffer = Buffer.concat(chunks);
//   const audioBase64 = audioBuffer.toString("base64");

//   res.json({
//     response: response.choices[0].message.content,
//     audioBase64,
//     audioContentType: "audio/mpeg",
//   });
// });

app.post("/coachchat", async (req, res) => {
  const { message, board_id } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const [{ data: board }, { data: events }] = await Promise.all([
    supabase.from("boards").select("*").eq("id", board_id).single(),
    supabase.from("events").select("*").eq("board_id", board_id),
  ]);

  if (!board) {
    res.write(
      `data: ${JSON.stringify({ type: "error", error: "Board not found" })}\n\n`,
    );
    return res.end();
  }
  if (!events) {
    res.write(
      `data: ${JSON.stringify({ type: "error", error: "Events not found" })}\n\n`,
    );
    return res.end();
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .in(
      "event_id",
      events.map((e: { id: string }) => e.id),
    );

  if (!transactions) {
    res.write(
      `data: ${JSON.stringify({ type: "error", error: "Transactions not found" })}\n\n`,
    );
    return res.end();
  }

  const conversation = `
  Board:\n${JSON.stringify(board, null, 2)}
  Events:\n${JSON.stringify(events, null, 2)}
  Transactions:\n${JSON.stringify(transactions, null, 2)}`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `You are going to be given data about a board, the events, and transactions within that board, and you are going to respond to the user's message. They will ask about some financial advice, and you are going to give them the advice. Use data and info to back up and justify your advice. Give no more than 3 suggestions, but make them detailed and specific, and what exactly the user should do to save money given that event. Todays date is ${new Date().toISOString().split("T")[0]} so you should use that date to make your suggestions. Also limit your response to 300 words.`,
      },
      { role: "system", content: `Here is the data:\n${conversation}` },
      { role: "user", content: message },
    ],
  });

  // === THIS IS THE NEW PART ===
  // Sentence queue shared between LLM streamer and audio processor
  let fullText = "";
  let sentenceBuffer = "";
  const sentences: string[] = [];
  let llmDone = false;

  // Audio processor — runs in parallel, picks up sentences as they appear
  const audioProcessor = (async () => {
    let idx = 0;
    while (true) {
      if (idx < sentences.length) {
        const sentence = sentences[idx];
        idx++;
        try {
          const audioStream = await elevenLabs.textToSpeech.convert(
            "l4Coq6695JDX9xtLqXDE",
            {
              text: sentence,
              modelId: "eleven_turbo_v2_5",
              outputFormat: "mp3_22050_32",
            },
          );
          const reader = audioStream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              const b64 = Buffer.from(value).toString("base64");
              res.write(
                `data: ${JSON.stringify({ type: "audio", chunk: b64 })}\n\n`,
              );
            }
          }
        } catch (e) {
          console.error("ElevenLabs error:", e);
        }
      } else if (llmDone) {
        break;
      } else {
        // No sentence ready yet — wait a bit and check again
        await new Promise((r) => setTimeout(r, 50));
      }
    }
  })();

  // LLM streamer — sends text to client AND splits into sentences
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    if (delta) {
      fullText += delta;
      sentenceBuffer += delta;
      res.write(
        `data: ${JSON.stringify({ type: "text", content: delta })}\n\n`,
      );

      // Check if we have a complete sentence
      const match = sentenceBuffer.match(/(.+?[.!?\n])\s*/);
      if (match) {
        const completeSentence = match[1].trim();
        sentenceBuffer = sentenceBuffer.slice(match[0].length);
        if (completeSentence.length > 0) {
          sentences.push(completeSentence); // audio processor picks this up
        }
      }
    }
  }

  // Flush leftover text as final sentence
  if (sentenceBuffer.trim().length > 0) {
    sentences.push(sentenceBuffer.trim());
  }
  llmDone = true;

  // Wait for audio processor to finish all sentences
  await audioProcessor;

  res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
  res.end();
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);