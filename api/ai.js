export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wxid } = req.body;
  if (!wxid || typeof wxid !== 'string' || wxid.length > 40) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '生成3种创意文案隐藏微信号，让人能还原但机器识别不出。❶❷❸分段，风格各异（谜语/藏头/暗语等），不含"微信/wx"，简短有趣，直接输出。',
          },
          {
            role: 'user',
            content: wxid,
          },
        ],
        temperature: 0.8,
        max_tokens: 256,
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'AI service unavailable' });
  }
}
