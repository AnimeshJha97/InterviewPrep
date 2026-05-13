# Tasks

Update this before starting every task.

## Legend

Status:
- Todo
- Doing
- Done
- Blocked

Priority:
- P0 critical
- P1 high
- P2 normal
- P3 later

## Current

| Task | Status | Priority | Notes |
| --- | --- | --- | --- |
| Stabilize happy path | Doing | P0 | Upload -> AI -> dashboard must work |
| Reduce AI prompt payload | Done | P0 | Compress resume/form context without changing required output schema |
| OpenAI provider integration | Done | P0 | Default provider |
| Remove Groq | Done | P0 | Removed from code/env |
| Gemini optional provider | Done | P1 | Available with `AI_PROVIDER=gemini` |
| No local fallback kit | Done | P0 | AI failure shows retry/error |
| Create agent docs | Doing | P1 | This folder |

## Next

| Task | Status | Priority | Notes |
| --- | --- | --- | --- |
| Test OpenAI end-to-end | Todo | P0 | Real resume upload and generation |
| Improve generation retry UX | Todo | P1 | Show provider/requestId |
| Add background/chunked generation | Todo | P1 | Needed for paid 50+ questions |
| Add payment flow | Todo | P1 | Razorpay planned |
| Admin log dashboard | Todo | P2 | View failed generations |
| Security review | Todo | P1 | Before paid launch |

## Completed

- Marketing pages built.
- Shared header/footer/FAQ/pricing components.
- Brand renamed to P3Kit.
- Logo and favicon added.
- Auth return flow fixed.
- Resume parsing hardened.
- DB activity logs added.
- Rate limits added.
- Security headers added.
- Dashboard empty/error states added.
