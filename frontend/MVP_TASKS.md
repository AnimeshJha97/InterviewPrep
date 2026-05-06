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

## Pending

- [ ] Add payment integration
- [ ] Add admin and reliability features

## Notes

- `src/components/interview_prep.jsx` remains the frozen visual/content reference.
- New product work should happen in modular app routes, models, API routes, and DB-backed flows.
