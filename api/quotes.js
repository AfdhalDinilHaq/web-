import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Header agar browser tahu ini adalah data JSON
  res.setHeader('Content-Type', 'application/json');
  const { action, mood } = req.query;

  try {
    /* ACTION: AMBIL DATA (GET) */
    if (action === "get" && mood) {
      // Mengambil daftar quote dari list KV berdasarkan mood
      const quotes = await kv.lrange(`quotes:${mood}`, 0, -1);
      
      if (!quotes || quotes.length === 0) {
        return res.status(200).json({ text: "Quote belum tersedia." });
      }

      // Pilih satu quote secara acak dari daftar yang ada
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      
      // Jika data tersimpan sebagai objek, kirim objeknya. Jika string, bungkus ke objek.
      return res.status(200).json(typeof randomQuote === 'string' ? { text: randomQuote } : randomQuote);
    }

    /* ACTION: TAMBAH DATA (ADD) */
    if (action === "add" && req.method === 'POST') {
      const { mood: newMood, text } = req.body;
      
      if (!newMood || !text) {
        return res.status(400).json({ error: "Data tidak lengkap" });
      }

      // Menyimpan quote baru ke dalam list KV
      await kv.lpush(`quotes:${newMood}`, { text: text });
      return res.status(200).json({ status: "ok" });
    }

    return res.status(400).json({ error: "Action tidak valid" });
  } catch (error) {
    console.error("KV Error:", error);
    return res.status(500).json({ error: "Gagal menyambung ke Database" });
  }
}