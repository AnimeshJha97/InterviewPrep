# PrepWise Production Edge Cases

## Implemented Handling

1. Form current role does not match resume role
- Example: form says `UI Designer`, resume looks like `Frontend Developer`
- Handling:
  - Gemini infers `resumeCurrentRole` from the resume
  - dashboard shows a warning banner
  - kit still generates, but warns the user to review profile or upload the correct resume

2. Target role is very different from the uploaded resume
- Example: target role `Product Designer`, resume is a developer resume
- Handling:
  - kit still generates for the target role
  - questions stay anchored to actual resume evidence
  - dashboard warns that the target role is a stretch from the uploaded resume

3. Years of experience in form and resume do not match
- Example: form says `2`, resume appears closer to `6`
- Handling:
  - Gemini infers years from the resume
  - if mismatch is `>= 2 years`, dashboard shows a warning
  - user is prompted to update profile or resume so difficulty calibration stays accurate

4. Interview type has weak support in the resume
- Example: interview type `backend`, but resume mostly contains UI/frontend signals
- Handling:
  - dashboard shows an informational warning
  - generation still proceeds, but warns the user about lower evidence

5. Resume extraction has weak signal
- Example: sparse resume, image-heavy PDF, little project detail
- Handling:
  - warning shown if extracted skills/projects are too weak
  - user is asked to upload a more detailed resume

6. Free-tier question cap
- Handling:
  - total questions and visible questions are env-driven
  - current free tier defaults to `10`

7. Free-tier retarget limit
- Handling:
  - target role / JD changes are counted
  - free-tier limit is env-driven
  - once limit is hit, API blocks additional retargeting

8. Failed or cancelled generation
- Handling:
  - no static fallback question bank is shown
  - dashboard shows retry / upload-resume CTA

9. Infinite generation loop / trapped status screen
- Handling:
  - duplicate start requests blocked
  - polling capped
  - cancel endpoint stops generation
  - `Back to form` and `Exit` now break out cleanly

10. Failed free-tier generation should not consume the only free kit
- Handling:
  - failed/cancelled kits do not count against free-tier kit creation

## Still Recommended Before Paid Public Launch

1. Add structured retry logic for malformed Gemini JSON
2. Add parse-quality score and reject very low-quality resume extraction before generation
3. Add admin logs for generation failures and warning frequency
4. Add user-facing “why this warning matters” help text
5. Add billing-aware hard gating for paid-only detailed answer modes
