import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleGeminiRequest } from './src/server/geminiHandler.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Gemini server-side proxy
app.post('/api/gemini/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const result = await handleGeminiRequest(type, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve static assets from dist
app.use(express.static(path.resolve(__dirname, 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`EduCoach AI Server running on port ${PORT}`);
});
