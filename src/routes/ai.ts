import { Router } from "express";
import { callOpenAI } from "../services/openai";

const router = Router();

// Example route: call OpenAI
router.post("/openai", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const response = await callOpenAI(prompt);
    res.json({ response });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
