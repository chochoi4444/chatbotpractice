# chatbotpractice

OpenRouter API를 사용하는 간단한 챗봇입니다. Vercel에 바로 배포할 수 있습니다.

## 구조

```
api/chat.js        # Vercel 서버리스 함수 (POST /api/chat → OpenRouter 호출)
public/index.html  # 채팅 UI
```

API 키는 서버리스 함수에서만 사용되므로 브라우저에 노출되지 않습니다.

## Vercel 환경변수

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API 키 |
| `OPENROUTER_MODEL` | | 사용할 모델 ID (기본값 `openai/gpt-4o-mini`) |

Vercel 대시보드 → Project → Settings → Environment Variables에서 설정한 뒤 재배포하세요.

## 로컬 실행

```bash
cp .env.example .env.local   # 키 입력
npx vercel dev
```
