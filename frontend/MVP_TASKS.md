# AI Interview Prep Kit Builder MVP Tasks

## Completed

- [x] Audit current `frontend` project and define MVP implementation order
- [x] Install foundation dependencies: `next-auth`, `mongoose`, `zod`
- [x] Set up foundation: env shape, MongoDB connection, Auth.js, user model, base app shell
- [x] Implement onboarding flow and persist user interview profile
- [x] Implement resume upload and extraction flow
- [x] Implement AI candidate profile generation and kit assembly
- [x] Implement AI candidate profile generation
- [x] Implement section generation
- [x] Implement question generation
- [x] Add generation status screen and pipeline states
- [x] Connect generated kits to dashboard
- [x] Persist question completion and user notes
- [x] Add free usage gating
- [x] Replace heuristic kit generation with real Gemini resume analysis and dynamic question generation
- [x] Remove silent fallback for production kit generation and store Gemini generation metadata
- [x] Improve generation status copy/animation for personalized-kit creation flow
- [x] Fix dashboard sign-out overlap with filter controls
- [x] Add generation cancel flow and stop runaway polling/redirect loops
- [x] Remove static interview-kit fallback and add empty/retry states for failed or missing AI kits
- [x] Relax and normalize Gemini schema handling for free-tier personalized generation
- [x] Make free/paid question limits and free-tier retarget limit configurable through environment variables
- [x] Detect and surface onboarding-vs-resume conflicts for production edge cases
- [x] Add marketing site pages: Home, Features, How It Works, Pricing, About, FAQ, Contact, Terms, Privacy
- [x] Consolidate shared marketing header, footer, FAQ, and pricing data for consistency
- [x] Fix Google auth return flow so users return to the same marketing page after complete/cancel
- [x] Restore scroll reveal animations and refresh-to-top behavior
- [x] Improve PDF parsing with fallback extraction for complex resumes
- [x] Add Gemini output hardening for invalid JSON, missing fields, oversized arrays, and schema serving limits
- [x] Add production-safe structured console logs with required and temporary log categories
- [x] Add database-backed activity logs with 7-day TTL retention
- [x] Add DB-backed rate limits for onboarding, resume uploads, and kit generation
- [x] Add baseline security headers and production auth env fail-fast checks

## Pending

- [ ] Add payment integration
- [ ] Add admin dashboard for activity logs, failed generations, and retry workflows
- [ ] Add alerting for repeated generation failures, parser failures, and rate-limit spikes
- [ ] Add formal security review before public paid launch
- [ ] Add automated abuse tests for upload, generation, and auth flows

## Notes

- `src/components/interview_prep.jsx` remains the frozen visual/content reference.
- New product work should happen in modular app routes, models, API routes, and DB-backed flows.
- See [PRODUCT_EDGE_CASES.md](D:\Projects\InterviewPrep\frontend\PRODUCT_EDGE_CASES.md) for current public-launch edge-case handling.
- Activity logs are controlled by `P3KIT_DB_REQUIRED_LOGS` and `P3KIT_DB_TEMP_LOGS`; MongoDB TTL deletes them after one week.
