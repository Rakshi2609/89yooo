import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // TODO: Production: validate email/password, hash compare, rate limiting.
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  // Fake login success always.
  return res.json({ token: 'fake-jwt', user: { email } });
});

export default router;
