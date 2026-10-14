// Vercel Serverless Function: POST /api/chat
// OpenRouter 또는 Vercel AI Gateway(OpenAI 호환 API)를 호출해 챗봇 응답을 돌려줍니다.
// 필요한 환경변수: OPENROUTER_API_KEY 또는 AI_GATEWAY_API_KEY (필수), OPENROUTER_MODEL (선택)
// 키가 vck_ 로 시작하면 Vercel AI Gateway, 그 외에는 OpenRouter로 요청합니다.

const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const SYSTEM_PROMPT = '당신은 친절하고 간결하게 답변하는 한국어 AI 어시스턴트입니다.';
const MAX_HISTORY = 20;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = (process.env.OPENROUTER_API_KEY || process.env.AI_GATEWAY_API_KEY || '').trim();
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: '서버에 OPENROUTER_API_KEY(또는 AI_GATEWAY_API_KEY) 환경변수가 설정되지 않았습니다.' });
  }
  const endpoint = apiKey.startsWith('vck_') ? AI_GATEWAY_URL : OPENROUTER_URL;

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const messages = Array.isArray(body?.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'messages 배열이 필요합니다.' });
  }

  // 클라이언트가 보낸 대화 기록 중 user/assistant 메시지만 최근 N개 사용
  const history = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `https://${req.headers.host || 'localhost'}`,
        'X-Title': 'Chatbot Practice',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || `AI API 요청 실패 (${response.status})`;
      return res.status(response.status).json({ error: message });
    }

    const reply = data?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ reply, model: data?.model });
  } catch (err) {
    return res.status(502).json({ error: `AI API 호출 중 오류: ${err.message}` });
  }
};

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
