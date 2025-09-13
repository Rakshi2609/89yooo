import { Router } from 'express';
import { callMistra } from '../utils/callMistra.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collegesPath = path.join(__dirname, '..', 'data', 'colleges.json');
const timelinePath = path.join(__dirname, '..', 'data', 'timeline.json');

router.post('/recommend', async (req, res) => {
  const { userProfile, quizAnswers } = req.body;
  // TODO: Production: schema validation, auth, caching.
  const prompt = `You are a career guidance AI. User profile: ${JSON.stringify(userProfile)}. Quiz answers: ${JSON.stringify(quizAnswers)}. Provide: recommended_streams, recommended_degrees (each with description, average_salary_range INR, key_job_roles, government_exams, growth_outlook), suggested_colleges (just names), next_steps (concise actionable list). Output JSON.`;

  try {
    let aiJson;
    if (process.env.MISTRA_API_KEY) {
      aiJson = await callMistra(prompt);
    } else {
      // Fallback mock
      aiJson = {
        recommended_streams: ["Engineering", "Computer Science"],
        recommended_degrees: [
          {
            name: "B.Tech Computer Engineering",
            description: "Focus on software systems, algorithms, and emerging tech.",
            average_salary_range: "4-12 LPA",
            key_job_roles: ["Software Developer", "Data Analyst"],
            government_exams: ["GATE", "ISRO Scientist"],
            growth_outlook: "High demand with AI & automation expansion."
          }
        ],
        suggested_colleges: ["IIT Sample", "Government Engineering College A"],
        next_steps: ["Strengthen math basics", "Practice logical reasoning", "Explore small coding projects"]
      };
    }
    res.json(aiJson);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  // TODO: Production: streaming responses, moderation, rate limiting.
  const prompt = `You are a friendly Indian career guidance chatbot. Question: ${message}. Give concise helpful answer.`;
  try {
    let aiJson;
    if (process.env.MISTRA_API_KEY) {
      aiJson = await callMistra(prompt);
    } else {
      aiJson = { reply: `Mock response about: ${message}` };
    }
    res.json(aiJson);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/colleges', (req, res) => {
  const district = req.query.district?.toLowerCase();
  const raw = JSON.parse(fs.readFileSync(collegesPath, 'utf8'));
  const filtered = district ? raw.filter(c => c.district.toLowerCase() === district) : raw;
  res.json(filtered);
});

router.get('/timeline', (req, res) => {
  const raw = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  res.json(raw);
});

export default router;
