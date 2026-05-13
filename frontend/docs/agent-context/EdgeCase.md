# Edge Cases

## User Input

- Form role differs from resume role.
- Target role is unrelated to resume.
- Years of experience mismatch.
- Interview type does not match resume skills.
- Job description is empty.
- Job description is too long.
- User uploads wrong resume.

## Resume Upload

- PDF has no selectable text.
- PDF parser fails.
- DOCX parser fails.
- File type/MIME is wrong.
- File too large.
- Resume text extracted but too weak.
- Upload succeeds but generation fails.

## AI Generation

- AI returns invalid JSON.
- AI returns nested JSON.
- AI omits `sections`.
- AI omits `candidateProfile`.
- AI returns empty questions.
- AI times out.
- AI provider rate limit.
- AI provider returns refusal/error.

Handling:
- Do not show static fallback kit.
- Save failed status.
- Show retry/profile CTA.
- Log requestId.

## Free Tier

- User tries multiple kits.
- User retries after failed generation.
- User changes target role too many times.
- User hits generation rate limit.

Handling:
- Failed/cancelled kits do not consume free kit.
- Limits controlled by env.

## Navigation

- Signed-in user opens home page.
- User has no kit yet.
- User exits generation screen.
- Browser back from Google auth.
- Refresh during generation.

Handling:
- Home remains accessible.
- Empty dashboard points to upload.
- Generation can be cancelled.

## Production

- MongoDB unavailable.
- Auth env missing.
- AI env missing.
- Vercel timeout.
- Activity logs grow too large.

Handling:
- Required env checks.
- Logs stored with 7-day TTL.
- Clear user-facing errors.
