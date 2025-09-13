import { Router } from 'express';
import { callMistra, extractJsonBlock } from '../utils/callMistra.js';
import { generateShortMockReply } from '../utils/mockReply.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRequired } from '../middleware/auth.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collegesPath = path.join(__dirname, '..', 'data', 'colleges.json');
const timelinePath = path.join(__dirname, '..', 'data', 'timeline.json');

router.post('/recommend', authRequired, async (req, res) => {
  const { userProfile = {}, quizAnswers = {} } = req.body || {};
  // TODO: Production: explicit schema validation.
  const email = req.user?.email;
  const instruction = `You are a career guidance AI for Indian students. Respond ONLY in minified JSON with keys: recommended_streams[], recommended_degrees[{name,description,average_salary_range,key_job_roles[],government_exams[],growth_outlook}], suggested_colleges[], next_steps[]. No markdown, no commentary.`;
  const identityLine = email ? `User Email: ${email}\n` : '';
  const prompt = `${instruction}\n${identityLine}User Profile: ${JSON.stringify(userProfile)}\nQuiz Answers: ${JSON.stringify(quizAnswers)}\nReturn JSON now:`;
  if (process.env.MISTRA_DEBUG) console.log('[MISTRA][PROMPT][recommend]', prompt.slice(0,400));
  try {
    let output;
    if (process.env.MISTRA_API_KEY) {
      const apiResp = await callMistra(prompt);
      if (apiResp.text) {
        // LLM returned raw text
        output = extractJsonBlock(apiResp.text) || { raw: apiResp.text };
      } else if (typeof apiResp === 'object') {
        output = apiResp; // already JSON
      } else {
        output = { raw: apiResp };
      }
    } else {
      output = {
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
    res.json(output);
  } catch (e) {
    console.error('Recommend error:', e);
    if (/ENOTFOUND|DNS lookup failed/i.test(e.message)) {
      // Fallback to mock silently so UI continues
      return res.json({
        recommended_streams: ["Engineering"],
        recommended_degrees: [
          {
            name: "B.Tech Computer Engineering",
            description: "(Fallback) DNS issue; using mock data.",
            average_salary_range: "4-12 LPA",
            key_job_roles: ["Software Developer"],
            government_exams: ["GATE"],
            growth_outlook: "High demand."
          }
        ],
        suggested_colleges: ["Government Engineering College A"],
        next_steps: ["Fix DNS for MISTRA_API_URL", "Re-run recommendations"]
      });
    }
    res.status(500).json({ error: e.message });
  }
});

router.post('/chat', async (req, res) => {
  const { message = '' } = req.body || {};
  if (!message.trim()) return res.status(400).json({ error: 'Message required' });
  const maxWords = Number(process.env.MISTRA_CHAT_MAX_WORDS || 45); // relaxed limit default 45
  const system = `You are a friendly Indian career & education guidance assistant. Keep answers helpful, positive, concrete. Stay under roughly ${maxWords} words, but be natural. Accept broader life / motivation / productivity questions if they connect to learning, growth, or career planning. If totally unrelated (e.g. pure food recipe), give a brief friendly note and then gently invite a career-related follow-up.`;
  const prompt = `${system}\nUser: ${message}\nAssistant:`;
  if (process.env.MISTRA_DEBUG) console.log('[MISTRA][PROMPT][chat]', prompt.slice(0,400));
  try {
    let reply;
    if (process.env.MISTRA_API_KEY) {
      const apiResp = await callMistra(prompt);
      if (apiResp.text) reply = apiResp.text.trim();
      else if (apiResp.reply) reply = String(apiResp.reply).trim();
      else reply = JSON.stringify(apiResp).slice(0,180);
      // Enforce short length client-side too
      if (reply.split(/\s+/).length > maxWords) {
        reply = reply.split(/\s+/).slice(0,maxWords).join(' ') + '…';
      }
    } else {
      reply = generateShortMockReply(message);
    }
    res.json({ reply });
  } catch (e) {
    console.error('Chat error:', e);
    if (/ENOTFOUND|DNS lookup failed/i.test(e.message)) {
  return res.json({ reply: generateShortMockReply(message, maxWords) + ' (fallback)' });
    }
    res.status(500).json({ error: e.message });
  }
});

// Simple connectivity / format debug endpoint
router.get('/debug', async (req, res) => {
  if (!process.env.MISTRA_API_KEY) return res.json({ status: 'no-key', note: 'Add MISTRA_API_KEY to enable real calls' });
  try {
    const probe = await callMistra('Return the single word OK');
    res.json({ status: 'ok', raw: probe });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
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
