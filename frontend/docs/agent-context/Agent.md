# Agent Guide

## Read First

- `Research.md`
- `Summary.md`
- `Tasks.md`
- `EdgeCase.md`

## Product

P3Kit is a resume-aware AI interview prep app.

User flow:
1. Login.
2. Onboarding.
3. Resume upload.
4. AI generation.
5. Dashboard practice.

## Rules

- Keep chat short.
- Update `Tasks.md` before starting a task.
- Do not edit `src/components/interview_prep.jsx` unless asked.
- Do not show static fallback questions as generated AI output.
- If AI fails, save failure and show retry.
- Protect user secrets.

## Important Files

- Brand: `src/data/brand.ts`
- Auth: `src/lib/auth.ts`
- DB: `src/lib/db.ts`
- Resume parser: `src/lib/resume-parser.ts`
- AI generator: `src/lib/interview-kit/generate-prep-kit-ai.ts`
- Dashboard mapper: `src/lib/interview-kit/to-dashboard-data.ts`
- User model: `src/models/User.ts`
- Kit model: `src/models/PrepKit.ts`
- Activity logs: `src/models/ActivityLog.ts`
- Rate limits: `src/models/RateLimit.ts`

## API Routes

- `src/app/api/onboarding`
- `src/app/api/resume/upload`
- `src/app/api/kit/[kitId]`
- `src/app/api/kit/[kitId]/generate`
- `src/app/api/kit/[kitId]/cancel`
- `src/app/api/kit/[kitId]/questions/[questionId]/progress`
- `src/app/api/kit/[kitId]/questions/[questionId]/notes`

## Env

Current default:
- `AI_PROVIDER=openai`
- `OPENAI_MODEL=gpt-4.1-mini`

Optional:
- `AI_PROVIDER=gemini`
- `GEMINI_MODEL=gemini-2.5-flash`

Do not commit real secrets.

## Test

Run:

```bash
npx tsc --noEmit
```

If build fails on Windows `.next` lock, stop dev server or delete `.next`.
