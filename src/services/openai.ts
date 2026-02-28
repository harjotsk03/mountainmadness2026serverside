const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface OpenAIResponse {
  choices?: { message?: { content?: string } }[];
}

export const callOpenAI = async (prompt: string) => {
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = (await res.json()) as OpenAIResponse;
  return data.choices?.[0]?.message?.content || "";
};
