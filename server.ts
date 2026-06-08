import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialize GoogleGenAI client to avoid crashes on startup if secret key is not set yet.
let aiInstance: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured yet. Set it in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

/**
 * Robust content generation wrapper that automatically falls back to 'gemini-3.1-flash-lite'
 * if the primary model is busy (e.g., encountering a 503 error). Includes subtle delay retry.
 */
async function generateWithFallback(
  ai: GoogleGenAI,
  contents: any,
  config: any,
  primaryModel: string = "gemini-3.5-flash"
) {
  const models = [primaryModel, "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[Gemini SDK] Trying content generation using model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      if (response && response.text) {
        console.log(`[Gemini SDK] Success using model: ${model}`);
        return response;
      }
      throw new Error(`Empty response text returned from model: ${model}`);
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini SDK] Model '${model}' failed. Self-repair routing activated. Details:`, err.message || err);
      // Brief sleep before trying next model to let high spikes dissipate
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError || new Error("All model configuration candidates failed.");
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes first
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, profileState, projectsList, skillsList, experienceList } = req.body;

    const ai = getAIClient();

    // Dynamically build a detailed contextual system instruction based on live profile state!
    const name = profileState?.name || "Rimon Ahmed";
    const title = profileState?.title || "System Support Co-Ordinator / Web Administrator";
    const bio = profileState?.bio || "Highly organized and tech-savvy professional with professional experience in system administration, WordPress management, video editing, and graphic design.";
    const email = profileState?.email || "dev.rimonahmed@gmail.com";
    const location = profileState?.location || "Dhaka, Bangladesh";
    const github = profileState?.github || "";
    const linkedin = profileState?.linkedin || "";
    const portfolio = profileState?.portfolio || "";

    const projectsText = Array.isArray(projectsList)
      ? projectsList.map(p => `- ${p.title} (${p.category}): ${p.description}. Key Tools: ${Array.isArray(p.tools) ? p.tools.join(", ") : p.tools}`).join("\n")
      : "Default Projects";

    const skillsText = Array.isArray(skillsList)
      ? skillsList.map(c => `* ${c.name}: ${Array.isArray(c.skills) ? c.skills.join(", ") : c.skills}`).join("\n")
      : "Default Skills";

    const experienceText = Array.isArray(experienceList)
      ? experienceList.map(e => `- ${e.role} at ${e.org} (${e.date}): ${Array.isArray(e.points) ? e.points.join(". ") : e.points}`).join("\n")
      : "Default Experiences";

    const systemInstruction = `You are Raphael, an elite, high-fidelity Systems Assistant AI representing ${name} (Web Administrator & System Support Specialist).
You are integrated on his interactive cyber-defense style portfolio website to answer questions from potential recruiters, clients, and website visitors.

Your tone should be: Professional, sharp, systems-minded, helpful, yet incredibly precise. Speak as his intelligent digital core agent named Raphael. Use bullet points and clear typography.

--- RIMON AHMED'S COMPREHENSIVE DOSSIER ---
NAME: ${name}
TITLE: ${title}
EMAIL: ${email}
LOCATION: ${location}
BIO: ${bio}
PORTFOLIO: ${portfolio}
WEBSITE LINKS:
- Github: ${github}
- LinkedIn: ${linkedin}

KEY TECHNICAL CAPABILITIES & SKILLS:
${skillsText}

PORTFOLIO SAVED PROJECTS:
${projectsText}

PROFESSIONAL EXPERIENCE:
${experienceText}

--- OPERATIONAL GUIDELINES ---
1. Base your knowledge strictly on ${name}'s provided dossier. If asked about something not detailed in his profile (e.g., highly personal things or random topics), adapt and bridge beautifully back to his engineering, systems installation, technical administration, and database design.
2. Keep responses relatively concise, structured, and easy to read. Provide direct answers. Include your name, Raphael, if appropriate.
3. If users ask about hiring him or contacting him, advise them to send an inquiry via the "Contact/Direct Transmission Link" form directly on the page, or email him directly at ${email}.
4. Respond in clean Markdown format with elegant spacing.`;

    // Construct unified history representation format
    const contents: any[] = [];
    if (history && history.length > 0) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      });
    }
    // Append current prompt
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await generateWithFallback(ai, contents, {
      systemInstruction,
      temperature: 0.7,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response." });
  }
});

// Admin reply generation helper route to eliminate client-side key-exposure
app.post("/api/gemini/draft", async (req, res) => {
  try {
    const { messageContext, senderName, senderEmail, subject } = req.body;
    const ai = getAIClient();

    const prompt = `Formulate an elegant, professional, systems-minded response email draft.
Sender Info:
Name: ${senderName}
Email: ${senderEmail}
Subject: ${subject || "Inquiry"}
Original Inbound Message: "${messageContext}"

Draft a stellar response email directly from me (Rimon Ahmed, Systems Specialist) acknowledging their query, highlighting specific alignment with web projects, and coordinating subsequent steps. Keep it highly polished, professional, and friendly.`;

    const response = await generateWithFallback(
      ai,
      prompt,
      {
        systemInstruction: "You are an elite, professional assistant drafting a responsive email reply. Keep the formatting clean and personal.",
        temperature: 0.7,
      }
    );

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Draft API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate email draft reply." });
  }
});

// Vite middleware development / static production setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio Server running on http://localhost:${PORT}`);
  });
}

setupVite();
