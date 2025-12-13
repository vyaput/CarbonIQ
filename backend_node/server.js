// FILE: server.js
// 1. IMPORT DAN INISIALISASI
import { GoogleGenAI } from "@google/genai";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // Diperlukan untuk membantu mencari file .env
import { marked } from 'marked';

// --- PERBAIKAN FATAL ERROR DI SINI ---
// Kita secara eksplisit memberi tahu dotenv untuk mencari file .env di direktori kerja saat ini (process.cwd())
// Kita juga menambahkan console.log untuk melihat apakah file .env berhasil dibaca.

const result = dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (result.error) {
  console.error("Gagal memuat file .env:", result.error);
  // Kita tetap melanjutkan agar pesan FATAL: bisa muncul jika kunci masih belum ada
} else {
  console.log("Variabel lingkungan dari .env berhasil dimuat.");
}
// --- AKHIR PERBAIKAN ---

const app = express();
const PORT = 3000;

// Mengambil Kunci API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error(
    "FATAL: GEMINI_API_KEY tidak ditemukan di .env. Pastikan Anda sudah mengisi Kunci API yang lengkap."
  );
  // Jika kunci tidak ditemukan, server berhenti di sini.
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: apiKey });

// PENTING: Untuk keperluan DEMO, kita menggunakan map untuk menyimpan sesi chat per pengguna (ID sesi).
const chatSessions = new Map();

// 2. KONFIGURASI MIDDLEWARE
// Izinkan frontend Anda (yang mungkin berjalan di port 5500) terhubung ke server ini (port 3000)
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"], // Sesuaikan dengan port local Anda
    methods: "POST",
  })
);
app.use(express.json());

// 3. ENDPOINT API UTAMA
// Endpoint ini menerima pesan dari chatbot.js
app.post("/api/chatbot", async (req, res) => {
  const userMessage = req.body.message;
  const sessionId = req.body.sessionId || "default-user";

  if (!userMessage) {
    return res.status(400).json({ error: "Pesan tidak ditemukan" });
  }

  try {
    // Cek sesi chat. Jika belum ada, buat sesi baru
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

    // Kirim pesan ke Gemini dan tunggu respons
    const result = await chat.sendMessage({ message: userMessage });

    // Kirim balasan kembali ke frontend
    res.json({ reply: marked.parse(result.text) });
  } catch (error) {
    console.error("Kesalahan Gemini API:", error);
    res
      .status(500)
      .json({ reply: "Maaf, terjadi kesalahan internal pada AI." });
  }
});

// 4. JALANKAN SERVER
app.listen(PORT, () => {
  console.log(`Server Backend Gemini berjalan di http://localhost:${PORT}`);
});
