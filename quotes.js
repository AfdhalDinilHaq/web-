import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { action, mood } = req.query;

  if (action === 'get') {
    const quotes = await kv.lrange(`quotes:${mood}`, 0, -1);
    const randomQuote = quotes.length > 0 
      ? quotes[Math.floor(Math.random() * quotes.length)] 
      : { text: "Quote belum tersedia." };
    return res.status(200).json(randomQuote);
  }

  if (action === 'add' && req.method === 'POST') {
    const { mood, text } = req.body;
    await kv.lpush(`quotes:${mood}`, { text });
    return res.status(200).json({ status: 'ok' });
  }
}
