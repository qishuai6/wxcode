const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.main = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    body = JSON.parse(raw);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const { wxid } = body;
  if (!wxid || typeof wxid !== 'string' || wxid.length > 40) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid input' }),
    };
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
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'AI service unavailable' }),
    };
  }
};
