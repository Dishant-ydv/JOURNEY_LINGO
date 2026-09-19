import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  getFallbackConversation,
  getFallbackRoleplay,
  getFallbackPronunciation,
  getFallbackTranslation,
} from "./src/data/fallbackData.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Multi-model cascade: Try gemini-3.8-flash, fall back to gemini-3.1-flash-lite, then gemini-flash-latest
async function callGeminiWithCascade(
  ai: GoogleGenAI,
  prompt: string,
  jsonMime = true,
  temperature = 0.7
): Promise<string> {
  const models = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          ...(jsonMime ? { responseMimeType: "application/json" } : {}),
          temperature,
        },
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const isUnavailable =
        err?.status === "UNAVAILABLE" ||
        err?.status === 503 ||
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("RESOURCE_EXHAUSTED");

      if (isUnavailable) {
        console.warn(`[Gemini Cascade] ${model} high demand / 503 spike. Trying backup model...`);
      } else {
        console.warn(`[Gemini Cascade] ${model} unavailable: ${err?.message || err}`);
      }
    }
  }
  throw lastError || new Error("All Gemini models temporarily unavailable");
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Conversation Endpoint (Topic & Free Dialogue)
app.post("/api/ai/conversation", async (req, res) => {
  const {
    topic = "Travel Plans",
    targetLanguage = "Japanese",
    nativeLanguage = "English",
    userMessage = "",
    history = [],
  } = req.body;

  try {
    const ai = getGeminiClient();

    if (ai) {
      const formattedHistory = history
        .map(
          (m: { sender: string; text: string }) =>
            `${m.sender === "user" ? "Learner" : "AI Tutor"}: ${m.text}`
        )
        .join("\n");

      const prompt = `You are an encouraging, authentic native language tutor in ${targetLanguage} for a language learner whose native language is ${nativeLanguage}.
Current topic: "${topic}".
Conversation so far:
${formattedHistory}
Learner said: "${userMessage}"

Respond in JSON with the following schema:
{
  "reply": "Your response in ${targetLanguage}",
  "romanization": "Pronunciation transcription (e.g. Romaji for Japanese, Pinyin for Chinese, etc.)",
  "translation": "English translation of your reply",
  "feedback": "1 concise constructive sentence for the learner on their grammar or vocabulary, or encouragement if good",
  "mistakes": [
    { "original": "incorrect part if any", "correction": "better phrasing", "explanation": "why" }
  ],
  "suggestedReplies": ["short helpful suggestion 1 for user to say next in target language", "short helpful suggestion 2"]
}`;

      try {
        const responseText = await callGeminiWithCascade(ai, prompt, true, 0.7);
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (geminiError: any) {
        console.warn("[Gemini Conversation Fallback Activated]:", geminiError?.message || geminiError);
      }
    }
  } catch (error: any) {
    console.warn("AI Conversation notice:", error?.message || error);
  }

  // High-quality contextual fallback (200 OK guarantees smooth UX)
  return res.json(getFallbackConversation(targetLanguage, topic, userMessage));
});

// AI Roleplay Endpoint (Airport, Hotel, Restaurant, Metro, Shopping)
app.post("/api/ai/roleplay", async (req, res) => {
  const {
    scenario = "Hotel Check-in",
    location = "Sakura Hotel, Tokyo",
    role = "Hotel Receptionist",
    userMessage = "",
    history = [],
    targetLanguage = "Japanese",
    isEndTurn = false,
  } = req.body;

  try {
    const ai = getGeminiClient();

    if (ai) {
      const formattedHistory = history
        .map(
          (m: { sender: string; text: string }) =>
            `${m.sender === "user" ? "Guest/Traveler" : role}: ${m.text}`
        )
        .join("\n");

      const prompt = `You are roleplaying as "${role}" at "${location}" in "${scenario}".
Language to speak: ${targetLanguage}.
Goal: Give a realistic, polite real-world customer interaction for a traveler.
History:
${formattedHistory}
Traveler said: "${userMessage}"
${isEndTurn ? "The user wants to end or conclude the roleplay scenario. Provide overall performance scores." : ""}

Respond in JSON schema:
{
  "reply": "Your in-character line in ${targetLanguage}",
  "romanization": "Reading guide / romaji",
  "translation": "English translation",
  "performance": {
    "fluency": 85,
    "vocabulary": 88,
    "grammar": 84,
    "overall": 86,
    "feedback": "Encouraging evaluation of the traveler's phrasing and etiquette."
  },
  "isCompleted": ${Boolean(isEndTurn)},
  "suggestedResponses": [
    "Useful line in target language option 1",
    "Useful line in target language option 2"
  ]
}`;

      try {
        const responseText = await callGeminiWithCascade(ai, prompt, true, 0.6);
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (geminiError: any) {
        console.warn("[Gemini Roleplay Fallback Activated]:", geminiError?.message || geminiError);
      }
    }
  } catch (error: any) {
    console.warn("AI Roleplay notice:", error?.message || error);
  }

  // Realistic fallback response (200 OK)
  return res.json(getFallbackRoleplay(scenario, role, location, targetLanguage, isEndTurn));
});

// AI Pronunciation & Audio Evaluation
app.post("/api/ai/evaluate-pronunciation", async (req, res) => {
  const { targetPhrase = "", userTranscript = "", audioConfidence = 0.9 } = req.body;

  try {
    const ai = getGeminiClient();

    if (ai && userTranscript) {
      const prompt = `Compare the learner's spoken input transcript: "${userTranscript}" with target phrase: "${targetPhrase}".
Evaluate pronunciation accuracy, phonetics, and provide targeted feedback.
Respond in JSON format:
{
  "score": 88,
  "accuracy": 89,
  "intonation": "Good natural pitch rise on the question particle",
  "phoneticFeedback": "Clear vowel pronunciation. Pay close attention to geminate consonants (double consonants).",
  "passed": true
}`;
      try {
        const text = await callGeminiWithCascade(ai, prompt, true, 0.2);
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (geminiError: any) {
        console.warn("[Gemini Pronunciation Fallback Activated]:", geminiError?.message || geminiError);
      }
    }
  } catch (err: any) {
    console.warn("Pronunciation evaluation notice:", err?.message || err);
  }

  return res.json(getFallbackPronunciation(targetPhrase, userTranscript));
});

// Dynamic AI Translation & Sentence Generator Endpoint
app.post("/api/ai/translate-and-learn", async (req, res) => {
  try {
    const {
      text = "",
      inputLanguage = "Hindi",
      targetLanguage = "Japanese",
      nativeLanguage = "Hindi",
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are an expert polyglot language tutor.
The user wants to learn: "${targetLanguage}".
The user provides input in their own language (${inputLanguage} / ${nativeLanguage}): "${text}".

Task:
1. Translate this accurately into natural, authentic ${targetLanguage}.
2. Provide easy-to-read pronunciation (romaji/phonetics).
3. Provide an explanation and breakdown in both Hindi and English.
4. Give a practical cultural travel tip.
5. Provide 2-3 similar related useful phrases in ${targetLanguage}.

Return strictly JSON with schema:
{
  "originalText": "${text}",
  "translatedText": "Target translation in ${targetLanguage}",
  "pronunciation": "Pronunciation / reading guide",
  "meaningHindi": "Hindi meaning",
  "meaningEnglish": "English meaning",
  "grammarTip": "Short grammar or word breakdown explanation",
  "culturalTip": "Helpful travel or etiquette tip",
  "relatedPhrases": [
    { "text": "phrase 1 in ${targetLanguage}", "reading": "reading 1", "meaning": "meaning 1" },
    { "text": "phrase 2 in ${targetLanguage}", "reading": "reading 2", "meaning": "meaning 2" }
  ]
}`;

      try {
        const textResponse = await callGeminiWithCascade(ai, prompt, true, 0.3);
        const parsed = JSON.parse(textResponse);
        return res.json(parsed);
      } catch (geminiError: any) {
        console.warn("[Gemini Translate Fallback Activated]:", geminiError?.message || geminiError);
      }
    }
  } catch (error: any) {
    console.warn("AI Translation notice:", error?.message || error);
  }

  // Structured fallback dictionary for common travel inputs
  const text = req.body?.text || "";
  const targetLanguage = req.body?.targetLanguage || "Japanese";
  return res.json(getFallbackTranslation(text, targetLanguage));
});

// Dynamic AI Lesson Generation Endpoint (Generates 100% real dynamic curriculum)
app.post("/api/ai/generate-lesson", async (req, res) => {
  const {
    targetLanguage = "Japanese",
    nativeLanguage = "English",
    moduleType = "airport",
    topicTitle = "",
    userLevel = "Beginner",
    customPrompt = "",
  } = req.body;

  const ai = getGeminiClient();
  if (ai) {
    const prompt = `You are a world-class language curriculum designer and foreign language native tutor for travelers.
Generate a comprehensive, engaging, authentic foreign language lesson JSON for a traveler.

Target Language: ${targetLanguage}
Learner's Reference Languages: English AND Hindi
Module Category / Topic: ${topicTitle || moduleType}
Learner Level: ${userLevel}
Special Context: ${customPrompt || "Travel scenario with real everyday dialogues, high frequency vocabulary, grammar rule, interactive practice questions, and quiz."}

IMPORTANT CRITICAL REQUIREMENTS:
1. Every dialogue line and example MUST have:
   - "japanese": The actual sentence in ${targetLanguage} (e.g. Spanish, French, German, Korean, Italian, Japanese, Arabic, etc. - in actual native script/characters)
   - "romaji": The pronunciation guide / phonetics / romanization
   - "english": Accurate English translation
   - "hindi": Accurate Hindi translation in Devanagari script (e.g. "नमस्ते", "कृपया मुझे बिल दीजिए")
2. Vocabulary items MUST include 5 to 6 practical travel words with:
   - "id": unique string
   - "word": Word in ${targetLanguage}
   - "reading": Phonetic reading
   - "meaning": English meaning
   - "hindiMeaning": Hindi meaning
   - "partOfSpeech": noun/verb/adjective/phrase
   - "exampleSentence": Example in ${targetLanguage}
   - "exampleReading": Phonetics of example
   - "exampleMeaning": English of example
   - "exampleHindi": Hindi of example
   - "tip": Useful cultural or usage tip
3. Grammar breakdown MUST have a relevant pattern used in this scenario with clear explanation in English and Hindi, structure formula, and 3 example sentences.
4. Practice activities MUST have:
   - "fillInTheBlank": sentence with "___", missingWord, options array (4 choices with the correct one included)
   - "matchPairs": 4 pairs of { "left": "${targetLanguage} phrase", "right": "English meaning" }
   - "dragDropWords": 4 to 5 words from a target sentence
5. Mini quiz MUST have 3 to 4 realistic travel comprehension questions with prompt (English), japanesePrompt (in ${targetLanguage}), hindiPrompt, options (4 items), correctAnswer (exact string matching one option), and explanation.
6. Scene intro: title, subtitle, description, highlights (array of 3-4 strings).

Return ONLY a valid JSON object with the following schema:
{
  "id": "ai-lesson-${Date.now()}",
  "title": "string (Catchy module title)",
  "location": "string (Realistic specific landmark or place name)",
  "step": 1,
  "sceneIntro": {
    "title": "string",
    "subtitle": "string",
    "description": "string",
    "highlights": ["highlight 1", "highlight 2", "highlight 3"]
  },
  "dialogue": [
    {
      "id": "dlg-1",
      "speaker": "Local Agent / Staff",
      "avatar": "✈️",
      "role": "agent",
      "japanese": "Sentence in ${targetLanguage}",
      "romaji": "Pronunciation reading",
      "english": "English translation",
      "hindi": "Hindi translation"
    },
    {
      "id": "dlg-2",
      "speaker": "Traveler",
      "avatar": "🧑‍🦱",
      "role": "user",
      "japanese": "Sentence in ${targetLanguage}",
      "romaji": "Pronunciation reading",
      "english": "English translation",
      "hindi": "Hindi translation"
    },
    {
      "id": "dlg-3",
      "speaker": "Local Agent",
      "avatar": "✈️",
      "role": "agent",
      "japanese": "Sentence in ${targetLanguage}",
      "romaji": "Pronunciation reading",
      "english": "English translation",
      "hindi": "Hindi translation"
    },
    {
      "id": "dlg-4",
      "speaker": "Traveler",
      "avatar": "🧑‍🦱",
      "role": "user",
      "japanese": "Sentence in ${targetLanguage}",
      "romaji": "Pronunciation reading",
      "english": "English translation",
      "hindi": "Hindi translation"
    }
  ],
  "vocabulary": [
    {
      "id": "voc-1",
      "word": "string in ${targetLanguage}",
      "reading": "string phonetics",
      "meaning": "string in English",
      "hindiMeaning": "string in Hindi",
      "partOfSpeech": "phrase/noun/verb",
      "exampleSentence": "string in ${targetLanguage}",
      "exampleReading": "string",
      "exampleMeaning": "string",
      "exampleHindi": "string",
      "tip": "string"
    }
  ],
  "grammar": {
    "title": "string",
    "pattern": "string",
    "explanation": "string in English",
    "hindiExplanation": "string in Hindi",
    "structure": "string formula",
    "examples": [
      {
        "japanese": "Sentence in ${targetLanguage}",
        "romaji": "Pronunciation",
        "english": "English",
        "hindi": "Hindi"
      }
    ]
  },
  "practiceActivities": {
    "fillInTheBlank": {
      "sentence": "string with ___",
      "missingWord": "string",
      "options": ["correct", "wrong1", "wrong2", "wrong3"]
    },
    "matchPairs": [
      { "left": "${targetLanguage} phrase 1", "right": "Meaning 1" },
      { "left": "${targetLanguage} phrase 2", "right": "Meaning 2" },
      { "left": "${targetLanguage} phrase 3", "right": "Meaning 3" },
      { "left": "${targetLanguage} phrase 4", "right": "Meaning 4" }
    ],
    "dragDropWords": ["word1", "word2", "word3", "word4"]
  },
  "miniQuiz": [
    {
      "id": "q-1",
      "type": "mcq",
      "prompt": "Question in English",
      "japanesePrompt": "Question or sentence in ${targetLanguage}",
      "hindiPrompt": "Question in Hindi",
      "options": ["option 0", "option 1", "option 2", "option 3"],
      "correctAnswer": "exact matching string of the correct option",
      "explanation": "Detailed explanation of why this answer is correct in this travel situation"
    }
  ],
  "summary": {
    "newWordsCount": 6,
    "grammarPointsCount": 1,
    "activitiesCompleted": 3,
    "xpReward": 60
  }
}`;

    try {
      const responseText = await callGeminiWithCascade(ai, prompt, true, 0.7);
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, lesson: parsed, generatedBy: "gemini" });
    } catch (err: any) {
      console.warn("Gemini dynamic lesson generation notice:", err?.message || err);
    }
  }

  return res.json({
    success: false,
    message: "Using initial seed curriculum",
    lesson: null,
  });
});

// Dynamic AI Roleplay Scenario Generation Endpoint
app.post("/api/ai/generate-scenario", async (req, res) => {
  const { targetLanguage = "Japanese", topic = "Hotel Check-in", location = "Tokyo" } = req.body;
  const ai = getGeminiClient();
  if (ai) {
    const prompt = `Generate a realistic foreign language roleplay scenario JSON for learning ${targetLanguage}.
Topic: ${topic}
Location: ${location}
Include:
- title
- aiRole
- aiAvatar
- brief
- goal
- initialMessage in ${targetLanguage}
- initialRomaji (pronunciation guide)
- initialTranslation (in English)
- suggestedPrompts: array of 3 possible user responses in ${targetLanguage} with English translation in parentheses.

Return ONLY valid JSON matching this schema:
{
  "id": "scenario-${Date.now()}",
  "title": "string",
  "location": "string",
  "aiRole": "string",
  "aiAvatar": "emoji",
  "brief": "string",
  "goal": "string",
  "initialMessage": "string in ${targetLanguage}",
  "initialRomaji": "string",
  "initialTranslation": "string",
  "suggestedPrompts": ["phrase 1 (translation)", "phrase 2 (translation)", "phrase 3 (translation)"]
}`;
    try {
      const responseText = await callGeminiWithCascade(ai, prompt, true, 0.7);
      return res.json({ success: true, scenario: JSON.parse(responseText) });
    } catch (err) {
      console.warn("Scenario generation notice:", err);
    }
  }
  return res.json({ success: false, scenario: null });
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JourneyLingo server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
