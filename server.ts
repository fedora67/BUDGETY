import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Telegram notifications
  app.post("/api/notify", async (req, res) => {
    const { message } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({ error: "Telegram bot token not configured" });
    }

    try {
      // In a real scenario, you'd need the chat ID. 
      // Assuming we send it to a hardcoded chat or need to pass it in.
      // For this user, I'll send it if the bot was already talked to by the user
      // or if the chatID is known. I'll just assume they need to send it.
      // Actually, Telegram Bot API requires chat_id. 
      // I'll just explain to the user in the frontend that it's required.
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: req.body.chatId,
        text: message
      });
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Failed to send Telegram message", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
