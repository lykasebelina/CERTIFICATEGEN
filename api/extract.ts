// api/extract.ts (Final version with the crucial route adjustment)

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // safe on server
});

// 🟢 CRITICAL FIX: The primary route for /api/extract must be defined as /
app.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });
    const response = await client.responses.create({
      model: "gpt-5.1",
      input: `
     You are an expert academic certificate writer.
Extract and generate all certificate fields from this user prompt:
"${prompt}"
// ... (rest of the prompt rules) ...
      `
    });
    const json = response.output_text.trim();
    const parsed = JSON.parse(json);
    parsed.openingPhrase = "This";
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI extraction failed" });
  }
});

// API endpoint: POST /rephrase (These can remain /rephrase IF you call them via /api/extract/rephrase)
app.post("/rephrase", async (req, res) => {
  // ... (rephrase logic) ...
});

// ⭐️ NEW AI ENDPOINT: POST /extract-date ⭐️
app.post("/extract-date", async (req, res) => {
  // ... (extract-date logic) ...
});

// 🟢 CRITICAL FIX FOR VERCEL: Export the app instance.
export default app;