import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import mistraRoutes from './routes/mistra.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mongo connection
if (process.env.MONGO_URI) {
	mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || undefined })
		.then(()=> console.log('[MONGO] Connected'))
		.catch(err=> console.error('[MONGO] Connection error', err.message));
} else {
	console.warn('[MONGO] MONGO_URI not set – user persistence disabled');
}

// Log loaded Mistra config once (without exposing full key)
console.log('[BOOT] MISTRA_API_URL =', process.env.MISTRA_API_URL || '(not set)');
if (process.env.MISTRA_API_KEY) {
	console.log('[BOOT] MISTRA_API_KEY present (length:', process.env.MISTRA_API_KEY.length, ')');
} else {
	console.log('[BOOT] MISTRA_API_KEY missing');
}
if (process.env.MISTRA_FORMAT) console.log('[BOOT] MISTRA_FORMAT =', process.env.MISTRA_FORMAT);
if (process.env.MISTRA_DEBUG) console.log('[BOOT] MISTRA_DEBUG enabled');

// Basic request logging (can replace with morgan or pino later)
app.use((req, res, next) => {
	const start = Date.now();
	res.on('finish', () => {
		const ms = Date.now() - start;
		console.log(`[REQ] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${ms}ms`);
	});
	next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/mistra', mistraRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
