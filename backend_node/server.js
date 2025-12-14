import { GoogleGenAI } from "@google/genai";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { marked } from 'marked';

const result = dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (result.error) {
  console.error("Gagal memuat file .env:", result.error);
} else {
  console.log("Variabel lingkungan dari .env berhasil dimuat.");
}

const app = express();
const PORT = 3000;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error(
    "FATAL: GEMINI_API_KEY tidak ditemukan di .env. Pastikan Anda sudah mengisi Kunci API yang lengkap."
  );
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: apiKey });

const chatSessions = new Map();

app.use(
  cors({
    origin: ["http://localhost:5000", "http://127.0.0.1:5000"],
    methods: "POST",
  })
);
app.use(express.json());

app.post("/api/chatbot", async (req, res) => {
  const userMessage = req.body.message;
  const sessionId = req.body.sessionId || "default-user";

  if (!userMessage) {
    return res.status(400).json({ error: "Pesan tidak ditemukan" });
  }

  try {
    let chat = chatSessions.get(sessionId);
    if (!chat) {
      chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction:
            "Anda adalah Chatbot asisten ahli CarbonIQ. Fokuslah menjawab pertanyaan tentang emisi kendaraan, pengurangan jejak karbon, dan efisiensi energi. Jawab dengan bahasa Indonesia yang profesional.",
        },
      });
      chatSessions.set(sessionId, chat);
      console.log(`Sesi Chat baru dibuat untuk: ${sessionId}`);
    }
    const result = await chat.sendMessage({ message: userMessage });

    res.json({ reply: marked.parse(result.text) });
  } catch (error) {
    console.error("Kesalahan Gemini API:", error);
    res
      .status(500)
      .json({ reply: "Maaf, terjadi kesalahan internal pada AI." });
  }
});

app.listen(PORT, () => {
  console.log(`Server Backend Gemini berjalan di http://localhost:${PORT}`);
});
