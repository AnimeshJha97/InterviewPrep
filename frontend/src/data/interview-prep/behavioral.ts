export const behavioralGroup = {
  "id": "behavioral",
  "title": "Behavioral & HR",
  "icon": "💬",
  "color": "#EC4899",
  "textColor": "#ffffff",
  "estimatedHours": 3,
  "questions": [
    {
      "id": "bh1",
      "difficulty": "medium",
      "type": "common",
      "question": "What is your greatest strength? What is your greatest weakness?",
      "answer": "STRENGTHS — be specific, back with evidence:\n\nDon't say \"I'm a hard worker\" or \"I'm a team player.\" Everyone says this.\n\nSTRONG ANSWER (specific and evidenced):\n>> \"My strongest skill is connecting system design to real product outcomes. I don't just implement what's asked — I ask why we're building it and what constraints matter. At Veritas, that led me to design the approval workflow engine as a configurable state machine rather than hardcoded logic. Three months later when a large client needed 4-level approvals instead of 2, we handled it with configuration instead of code changes. That kind of thinking has saved significant rework across multiple projects.\"\n\nWEAKNESSES — be genuine, show self-awareness AND growth:\n\nRed flags: \"I'm a perfectionist\", \"I work too hard\" — these aren't real answers and interviewers see through them.\n\nSTRONG ANSWER:\n>> \"I've historically been reluctant to push back on timelines early enough. When I sense a deadline is unrealistic, I'd optimize and try to make it work rather than flagging the concern early. I've learned that this leads to rushed work or silent stress, and stakeholders would rather know early. I now give estimates with explicit assumptions — 'I can hit the deadline IF X and Y are ready by day 3' — so timeline risk is visible from the start.\"\n\nKEY FORMULA:\nReal weakness + specific impact it had + concrete action you now take to manage it.\nThe action is what shows self-awareness has turned into actual growth."
    },
    {
      "id": "bh2",
      "difficulty": "medium",
      "type": "common",
      "question": "What's your most significant technical achievement?",
      "answer": "STRUCTURE: Context -> Challenge -> Your specific actions -> Measurable result.\n\nEXAMPLE (from your Veritas work):\n\nCONTEXT:\n\"When I joined the Veritas overtime project, the initial brief seemed straightforward — a simple overtime submission and approval system for enterprise HR.\"\n\nCHALLENGE:\n\"As we dug deeper, we discovered the real scope: strict multi-tenant data isolation for compliance, integration with SAP SuccessFactors for employee sync across global timezones, and approval workflows that different enterprise clients needed to configure differently — some needed 2 levels, others 4, with conditional logic.\"\n\nYOUR ACTIONS:\n\"I designed the entire architecture from scratch:\n- Per-tenant database isolation to meet compliance requirements (not shared tables)\n- Configurable approval workflow engine — a state machine driven by client config, not hardcoded logic\n- Data sync pipeline with staggered cron jobs accounting for multi-timezone consistency\n- SAP BTP deployment with multi-instance load balancing for peak usage periods\nI also managed a team of 3 engineers and coordinated directly with enterprise clients throughout.\"\n\nRESULT:\n>> \"Successfully deployed to production handling organizations with 1000+ employees per tenant. The configurable workflow engine paid off — multiple clients had unique approval requirements we handled with configuration, not custom code, reducing onboarding time significantly.\"\n\nWHAT MAKES IT STRONG:\n- Scale and complexity of the problem\n- Why your approach was non-obvious (configurable engine vs. hardcoded)\n- Technical depth (not just \"I built a dashboard\")\n- Leadership dimension (team of 3, client coordination)\n- Concrete, reusable outcome"
    },
    {
      "id": "bh3",
      "difficulty": "medium",
      "type": "common",
      "question": "Where do you see yourself in 5 years?",
      "answer": "WHAT THEY'RE REALLY ASKING: Are you ambitious? Will you grow? Are you a flight risk in 6 months?\n\nANSWER FRAMEWORK:\n>> 1. Near-term (1-2 years): deepen technical expertise relevant to this role\n>> 2. Medium-term (3-5 years): broader ownership — technical direction, team, product influence\n3. Connect back to THIS company: why this role is the right step toward that\n\nEXAMPLE ANSWER:\n\"In the near term, I want to deepen my expertise in distributed systems and large-scale architecture — I've worked at enterprise SaaS scale but want to go deeper on the fundamentals that make systems truly reliable.\n\n>> Over the next 3-5 years, I see myself growing into a Staff or Principal Engineer role — someone who shapes technical direction across multiple teams, not just executes within one. I'm genuinely interested in the intersection of technical leadership and product thinking.\n\n>> I'm attracted to this role because [something specific and real about the company] — it feels like the right environment to grow in that direction.\"\n\nTIPS:\n- Don't say \"I want to start my own company\" — signals stepping stone mentality\n- Don't say \"I want your job\" unless it's clearly a mentorship culture\n- Be specific enough to sound genuine, flexible enough to stay open\n- Always end by connecting it back to why THIS role at THIS company"
    },
    {
      "id": "bh4",
      "difficulty": "medium",
      "type": "common",
      "question": "Why are you leaving your current job?",
      "answer": "RULE: Always frame as moving TOWARD something, never running FROM something — even if the reality is the latter.\n\nAVOID:\n- Complaining about your current company, manager, or team\n- Vague \"looking for new challenges\" that sounds scripted\n- Badmouthing former colleagues\n\nGOOD FRAMEWORKS:\n\nIf the project ended / team scaled down:\n>> \"The project I was leading shipped successfully and the team scaled down naturally. It felt like the right moment to find a new challenge.\"\n\nIf you want more growth:\n>> \"I've learned a lot at Veritas — built and shipped an enterprise SaaS platform end-to-end, grew into a technical lead role. I've hit a point where I want to work at larger scale to keep growing technically.\"\n\nIf the company is going through transitions:\n>> \"The company has been going through some changes. I've been heads-down on delivery, but I've started being intentional about where I invest the next few years.\"\n\nIf you want better compensation:\n>> \"I've grown significantly — from IC to leading a team and owning architecture. I want to find a role where the compensation reflects that contribution more accurately.\"\n\nALWAYS FOLLOW WITH THE PULL:\n>> Whatever you say about leaving, immediately follow with why you're interested in THIS company. That's what they actually care about."
    },
    {
      "id": "bh5",
      "difficulty": "medium",
      "type": "common",
      "question": "How do you handle working under pressure or tight deadlines?",
      "answer": "WHAT THEY'RE REALLY ASKING: Can you prioritize? Do you communicate when things go wrong? Can you maintain quality under pressure?\n\nWHAT YOU ACTUALLY DO:\n\n1. TRIAGE FIRST:\n>> Understand what ACTUALLY must be done vs. what was assumed.\nOften \"tight deadline\" tasks can be partially descoped without losing 80% of the value.\n\n2. COMMUNICATE EARLY AND SPECIFICALLY:\nThe worst thing you can do is go silent and miss the deadline without warning.\n>> \"I'm 30% through and I can see this will take longer than expected because of X. I can deliver Y by the deadline if we push Z to next sprint.\"\n\n3. PROTECT QUALITY ON THE CRITICAL PATH, relax elsewhere:\n>> Be explicit about what you're cutting corners on (and why it's acceptable) vs. what you will not compromise on (security, data integrity, core logic).\n\n4. PARALLELIZE WHERE POSSIBLE:\nUnblock junior devs on well-scoped parts while you handle the unknown/complex parts.\n\nEXAMPLE FROM YOUR WORK:\n>> \"During a peak sprint at Veritas, we had an enterprise client go-live that couldn't move. Two days before, we discovered the SAP sync was producing inconsistent data for employees with multiple roles. I immediately:\n1. Triaged — identified 3 blocking bugs vs. 2 edge cases acceptable to go-live with\n2. Communicated to the client proactively — go-live proceeds with known minor limitation, documented\n3. Fixed the 3 blockers with a junior dev handling test verification in parallel\n4. Deployed on time. The 2 edge cases were fixed in the first patch two days later.\"\n\nThat answer shows triage, communication, parallel execution, and a real outcome."
    },
    {
      "id": "bh6",
      "difficulty": "medium",
      "type": "common",
      "question": "What are your salary expectations?",
      "answer": ">> This is a negotiation, not a quiz. Your goal: give a range accurate to your worth without anchoring too low.\n\nSTRATEGY:\n\n1. RESEARCH FIRST:\n- Levels.fyi, Glassdoor, LinkedIn Salary, AmbitionBox (India)\n- Talk to peers in similar roles at similar companies\n- Know your BATNA — what other offers or options do you have?\n\n2. LET THEM GO FIRST IF POSSIBLE:\n>> \"I'm flexible and want to understand the full package first. What's the budget for this role?\"\nIf they press: \"What's the typical range for this level at your company?\"\n\n3. IF YOU MUST GIVE A NUMBER — anchor high with a range:\n>> The bottom of your range is what you'll likely receive. Make the bottom your actual target.\n\"Based on my research and experience, I'm targeting X to Y depending on the full compensation package.\"\n\n4. DON'T UNDERSELL YOUR SENIORITY:\n>> 4.5 years + tech lead + enterprise SaaS + multi-tenant at scale is NOT a mid-level profile. Price it accordingly.\n\n5. AFTER AN OFFER — negotiate, it's expected:\n>> \"Thank you for the offer. I'm excited about the role. Based on my experience and market rate for this level, I was hoping we could reach X. Is there flexibility?\"\n\n6. TOTAL COMPENSATION — look at everything:\nBase, variable/bonus, equity (ESOP/RSUs), health insurance, WFH stipend, learning budget, notice period buyout.\nLower base with significant equity at a growth-stage startup can be worth more than a higher base at a stable company."
    }
  ]
};
