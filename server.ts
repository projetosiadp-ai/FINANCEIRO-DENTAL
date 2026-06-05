import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// JSON parsing middleware
app.use(express.json());

// Lazy-initialize Gemini AI client securely using the server-side environment variable
let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("Warning: GEMINI_API_KEY is not set. Fallback client-side heuristic score will be active.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Autonomous AI Prioritizer Action Endpoint
app.post("/api/prioritize", async (req, res) => {
  const { dataVencimento, valorAtual, motivo } = req.body;

  console.log(`[Prioritize] Incoming record evaluation requested: Vencimento=${dataVencimento}, Valor=${valorAtual}, Motivo=${motivo}`);

  // Formulate stable fallback scoring heuristically in case Gemini key is missing or calls rate-limit
  let heuristicScore = 20; // Default base

  const today = "2026-06-05";
  const tomorrow = "2026-06-06";

  if (dataVencimento) {
    if (dataVencimento === today || dataVencimento === tomorrow) {
      heuristicScore += 50;
    }
  }

  const val = Number(valorAtual) || 0;
  if (val > 250) {
    heuristicScore += 30;
  } else if (val > 100) {
    heuristicScore += 18;
  } else if (val > 0) {
    heuristicScore += 8;
  }

  heuristicScore = Math.min(heuristicScore, 100);

  const ai = getAi();
  if (!ai) {
    return res.json({ score: heuristicScore, source: "heuristic" });
  }

  try {
    const prompt = `Você é um motor de análise financeira. Avalie o seguinte registro: [Data de Vencimento: ${dataVencimento || "Não especificado"}, Valor Atual: R$ ${valorAtual !== undefined ? valorAtual : "Não especificado"}, Motivo: ${motivo || "Não especificado"}]. Gere um 'Score de Prioridade' de 0 a 100 baseado na urgência. Regras: 1) Vencimentos para amanhã ou hoje recebem pontuação máxima (+50). 2) Valores monetários altos aumentam a prioridade (+30). 3) Retorne ÚNICA E EXCLUSIVAMENTE o número inteiro final calculado. Não escreva nenhuma palavra ou pontuação além do número.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const textOutput = response.text ? response.text.trim() : "";
    console.log(`[Prioritize] Gemini Model Output: "${textOutput}"`);

    const matchedNumber = textOutput.match(/\d+/);
    if (matchedNumber) {
      const score = Number(matchedNumber[0]);
      if (score >= 0 && score <= 100) {
        return res.json({ score, source: "gemini" });
      }
    }

    console.warn(`[Prioritize] Match failed on AI output format. Emitting calculated heuristic value ${heuristicScore}`);
    return res.json({ score: heuristicScore, source: "heuristic_mismatch" });
  } catch (error: any) {
    console.error("[Prioritize] Gemini execution error, using safe fallback:", error);
    return res.json({ score: heuristicScore, source: "heuristic_fallback" });
  }
});

// Vite Middleware Bootstrap Function
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DentalPlus server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
