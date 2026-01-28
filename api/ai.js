export default async function handler(req, res) {
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
              '你是一个文字加密专家。用户给你一个微信号，你需要生成3种创意伪装文案，让人能看懂这是一个微信号但文字检测系统识别不出。要求：1）每种方式用不同风格（比如谜语、藏头诗、段子、表情包暗语、首字母暗示等）2）每条文案独立成段，前面加序号❶❷❸ 3）文案要自然有趣，不要生硬 4）文案里不要出现"微信""wx""weixin"等关键词 5）对方看到后应该能还原出完整的微信号 6）直接输出文案，不要解释',
          },
          {
            role: 'user',
            content: wxid,
          },
        ],
        temperature: 1.0,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'AI service unavailable' });
  }
}
