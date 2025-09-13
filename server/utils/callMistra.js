import fetch from 'node-fetch';

export async function callMistra(prompt) {
  // TODO: Production: add retries, timeout, proper error logging.
  const url = process.env.MISTRA_API_URL;
  if (!url) throw new Error('MISTRA_API_URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRA_API_KEY || 'NO_KEY'}`
    },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Mistra API error: ' + text);
  }
  return res.json();
}
