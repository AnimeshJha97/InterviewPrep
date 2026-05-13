# Research

## Agenda

P3Kit turns a resume into a personalized interview prep kit.

Core promise:
- Upload resume.
- Add target role/context.
- AI creates sections, questions, answers, follow-ups, and progress tracking.

Positioning:
- Not a generic question bank.
- Resume-aware interview prep.
- Built by Orvion Labs.

## MVP

- Google login.
- Onboarding profile.
- Resume upload and text extraction.
- AI-generated prep kit.
- Dashboard with section navigation.
- Question cards with answers and follow-ups.
- Completion tracking.
- User notes.
- Free-tier limit.

## Flow

1. User signs in.
2. User fills onboarding form.
3. User uploads resume.
4. API extracts resume text.
5. Prep kit is created in MongoDB.
6. Generation page starts AI generation.
7. AI returns candidate profile and sections/questions.
8. Kit is saved.
9. User lands on dashboard.
10. Progress and notes persist per user.

## AI Direction

Current default provider:
- OpenAI

Available fallback provider:
- Gemini

Removed:
- Groq

Important:
- Do not show static/local fallback kits as real output.
- If AI fails, show retry/error state.
- Long-term: generate paid kits in chunks/background jobs.

## Product Tiers

Free:
- One kit.
- Limited questions.
- Limited retargeting.

Paid:
- More questions.
- Detailed answers.
- Answer feedback.
- Retargeting.
- Later: mock interview mode.
