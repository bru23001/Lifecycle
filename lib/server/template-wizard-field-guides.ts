import type { FieldHelpContent } from "@/types/template-wizard.types";

/**
 * Per-template, per-field rich help content surfaced in the wizard's
 * Field Help popover (the small `?` next to each field label).
 *
 * Keyed by templateId, then by the field's `name`.
 *
 * Each entry should answer four things in plain English:
 *  - purpose       — Why this field exists / what the reviewer is looking for
 *  - expectedInput — What to write (format, length, who/what to include)
 *  - exampleValue  — A concrete GOOD answer
 *  - avoidExample  — A concrete BAD answer + brief reason
 *
 * Keep entries short. The popover is small. If you need a full guideline,
 * put it in the template's section description instead.
 */
export const TEMPLATE_FIELD_GUIDES: Record<
  string,
  Record<string, FieldHelpContent>
> = {
  "A-0": {
    ideaTitle: {
      purpose:
        "A short, recognizable name reviewers can scan in a list. Not a description.",
      expectedInput:
        "3–10 words. Include the audience or domain if useful. Avoid acronyms a stranger wouldn't get.",
      exampleValue: "Heavy equipment rental billing portal",
      avoidExample:
        "“New project” — too vague; reviewers can't tell ideas apart.",
    },
    ideaSponsor: {
      purpose:
        "Who is asking for this and will speak for it in G1 review. Reviewers may follow up with this person.",
      expectedInput:
        "Full name + role. If shared, name the primary sponsor first.",
      exampleValue: "Jamie Nguyen — Product Owner, North region",
      avoidExample: "“Operations team” — not a named accountable person.",
    },
    dateSubmitted: {
      purpose: "When this artifact entered the lifecycle. Used in audit trail.",
      expectedInput: "Today's date (or the day you finalize the form).",
      exampleValue: "2026-05-15",
      validationRule: "Format: YYYY-MM-DD.",
    },
    shortIdeaSummary: {
      purpose:
        "The 30-second pitch. A reviewer skims this first to decide if the rest is worth reading.",
      expectedInput:
        "2–5 sentences: WHAT you want to build/change, WHO it is for, OUTCOME you expect.",
      exampleValue:
        "Replace the spreadsheet-based invoicing for heavy equipment rentals with a self-serve customer portal. Used by AR clerks and rental customers. Expected to cut invoice cycle from 10 days to 2 and reduce billing disputes.",
      avoidExample:
        "“Build a new portal for billing.” — no audience, no outcome.",
    },
    problemOrOpportunity: {
      purpose:
        "Convinces reviewers that something real is broken or missing — not just a feature wish.",
      expectedInput:
        "Plain language: what's wrong today, who feels it, and what happens if nothing changes.",
      exampleValue:
        "AR clerks manually consolidate rental tickets across 3 systems each Friday. Invoices average 10 days late and disputes are 18% of revenue. Customers escalate weekly.",
      avoidExample:
        "“Billing is slow.” — no scope, no evidence, no impact.",
    },
    targetUsersOrBeneficiaries: {
      purpose:
        "Who actually uses or is affected. Helps later phases scope research, training, and rollout.",
      expectedInput:
        "List every role/group involved. Don't forget supporting roles (support, finance, legal).",
      exampleValue:
        "Dispatchers, fleet managers, AR clerks, rental customers, internal Finance reviewers.",
      avoidExample: "“Everyone.” — gives later phases nothing to plan against.",
    },
    currentSituation: {
      purpose:
        "Establishes the baseline so reviewers can judge whether change is worth it.",
      expectedInput:
        "Today's workflow: tools used (ERP, spreadsheets, email), the steps, the handoffs, where time/errors pile up.",
      exampleValue:
        "Tickets logged in legacy ERP → exported to Excel weekly → AR clerk reconciles against contract terms → invoices emailed as PDF. Errors are corrected by hand in a second pass.",
      avoidExample:
        "“We do it manually.” — doesn't tell the reviewer what or where.",
    },
    expectedBenefit: {
      purpose:
        "Why this is worth doing. Used at G1 to justify spending the next phase's effort.",
      expectedInput:
        "Concrete, named benefits. Use numbers if you have any baseline; estimates are fine if labeled.",
      exampleValue:
        "Cut invoice cycle from 10 days to 2 (est.); reduce billing disputes by ~50%; free 1 FTE/week from manual reconciliation.",
      avoidExample:
        "“Save time and money.” — no number, no baseline, not measurable.",
    },
    possibleSoftwareSolution: {
      purpose:
        "Direction, not design. Helps later phases scope without locking in architecture.",
      expectedInput:
        "High-level only: kind of software (portal/app/integration/batch job), who interacts with it, what it replaces.",
      exampleValue:
        "Customer-facing web portal for rental invoices + internal AR dashboard, integrated with the existing ERP via nightly batch.",
      avoidExample:
        "“React + Postgres + Stripe + Kubernetes…” — that's design, not direction.",
    },
    urgencyOrTiming: {
      purpose:
        "Drives sequencing across the portfolio. Reviewers compare urgency across competing ideas.",
      expectedInput:
        "Pick the closest match. Use Time-Critical only when there is a hard external deadline.",
      exampleValue: "High",
      avoidExample:
        "Picking Time-Critical without a deadline — devalues the signal for everyone.",
    },
    urgencyOrTimingRationale: {
      purpose: "Lets reviewers sanity-check your urgency choice above.",
      expectedInput:
        "Cite the driver: a date, a contract, a regulator, a launch, a season. Or explicitly say timing is unclear.",
      exampleValue:
        "Rental peak season starts Aug 1; getting the portal live by July avoids another quarter of manual reconciliation.",
      avoidExample: "“ASAP.” — not a reason; reviewers can't compare it.",
    },
    knownConstraints: {
      purpose:
        "Hard limits already on the table. Catches infeasible ideas before they consume planning effort.",
      expectedInput:
        "Real, known limits: budget cap, fixed go-live, required tech, regulatory boundaries, headcount.",
      exampleValue:
        "Must integrate with existing SAP ERP; no new vendor contracts in FY26; go-live no later than 2026-09-30.",
      avoidExample: "“None” — almost always wrong; think again.",
    },
    knownRisksOrConcerns: {
      purpose:
        "What you already worry about. Reviewers expect a thoughtful list, not a clean slate.",
      expectedInput:
        "Bullet 2–6 concrete risks/unknowns. Adoption, integration, compliance, vendor lock-in, staffing.",
      exampleValue:
        "Adoption risk with rental customers used to phone calls; SAP integration unknowns; PCI scope if we hold card data.",
      avoidExample: "“No major risks.” — reads as not having thought about it.",
    },
    similarExistingSolutions: {
      purpose:
        "Forces a quick build-vs-buy/reuse check before later phases assume custom build.",
      expectedInput:
        "What exists today (internal tools, vendor products, competitors) and WHY they don't fit.",
      exampleValue:
        "Vendor X has a rental billing module but no SAP connector; internal Excel macro covers ~30% but breaks on multi-day rentals.",
      avoidExample:
        "“Nothing exists.” — almost never true; describe what you considered.",
    },
    initialComplexityEstimate: {
      purpose:
        "Rough size signal. Reviewers use it to compare effort across the portfolio.",
      expectedInput:
        "Pick the closest match. If you genuinely cannot estimate, choose Unknown and explain below.",
      exampleValue: "Medium",
      avoidExample:
        "Defaulting to Low for everything — undermines portfolio planning.",
    },
    initialComplexityRationale: {
      purpose: "Justifies your size pick so reviewers can challenge or accept it.",
      expectedInput:
        "Name the drivers: teams touched, integrations, data sensitivity, regulation, geography, unknowns.",
      exampleValue:
        "Touches AR, Ops, and IT; SAP integration; customer-facing UI; PCI-adjacent data; one new vendor.",
      avoidExample: "“It's complex.” — not actionable.",
    },
    recommendation: {
      purpose:
        "Your recommended next lifecycle action. Reviewers will accept, modify, or reject this.",
      expectedInput:
        "Pick the option that matches your conviction. Accept only if the idea is clear enough to start A-0.1 Problem Definition.",
      exampleValue: "Accept for Problem Definition",
      avoidExample:
        "“Accept” when the problem is still vague — wastes a phase.",
    },
    recommendationRationale: {
      purpose:
        "Helps reviewers agree with (or push back on) your recommendation.",
      expectedInput:
        "Say WHY this recommendation fits now — what is proven, what is missing, what you would do next.",
      exampleValue:
        "Problem and audience are well known; benefits are quantifiable; main unknown is SAP integration cost — a Problem Definition phase will resolve it.",
      avoidExample: "“Looks good to me.” — gives reviewers nothing.",
    },
    approvalStatus: {
      purpose: "Reflects the real state of THIS document, not the idea overall.",
      expectedInput:
        "Draft while writing; Submitted when ready for review; Approved only after reviewer accepts for G1.",
      exampleValue: "Submitted",
      avoidExample:
        "Marking Approved before a reviewer signs off — breaks the audit trail.",
    },
    approvalNotes: {
      purpose:
        "Captures the decision detail so others can see WHY it was approved, returned, deferred, or rejected.",
      expectedInput:
        "For your chosen status: what was approved, what must change (if Returned), or why Deferred/Rejected.",
      exampleValue:
        "Returned: tighten Expected Benefit numbers and add named sponsor for Finance.",
      avoidExample: "“OK” — fine in chat, not fine for governance.",
    },
    reviewerName: {
      purpose:
        "Names the person accountable for the G1 decision on this idea. Required for audit.",
      expectedInput:
        "Full name of the actual reviewer, not a team or alias.",
      exampleValue: "Jordan Okonkwo",
      avoidExample: "“Governance team” — not a named individual.",
    },
    reviewerRole: {
      purpose:
        "Confirms the reviewer has standing to make the G1 call (portfolio, engineering, governance, etc.).",
      expectedInput:
        "Their role in the decision — not their job title in HR.",
      exampleValue: "Portfolio Owner",
      avoidExample: "“Manager” — too generic to anchor accountability.",
    },
    reviewDate: {
      purpose: "Locks the date the decision was made — used in audit and SLA tracking.",
      expectedInput: "Date the reviewer recorded the decision above.",
      exampleValue: "2026-05-22",
      validationRule: "Format: YYYY-MM-DD.",
    },
  },

  "A-0.1": {
    problemTitle: {
      purpose:
        "A short, recognizable label for the problem — distinct from the A-0 idea title. Reviewers scan this in lists.",
      expectedInput: "3–10 words. State the problem, not the solution.",
      exampleValue: "Manual lifecycle governance causes document drift",
      avoidExample:
        "“Build a governance portal” — that’s a solution, not a problem.",
    },
    relatedIdeaId: {
      purpose:
        "Traces this problem back to the approved A-0 idea. Required for G2 audit linkage.",
      expectedInput:
        "The A-0 artifact local ID (e.g. IDEA-0001) or the artifact code from the project library.",
      exampleValue: "IDEA-0001",
      avoidExample: "Leaving blank or writing a free-text description.",
    },
    sourceIdeaTitle: {
      purpose:
        "Human-readable confirmation that this problem maps to the right A-0 idea.",
      expectedInput: "Copy the exact title from the A-0 Idea Capture form.",
      exampleValue: "Heavy equipment rental billing portal",
      avoidExample: "A paraphrase — must match the A-0 title exactly.",
    },
    preparedBy: {
      purpose:
        "Names the author of this problem definition. Reviewers may follow up with this person.",
      expectedInput: "Full name + role.",
      exampleValue: "Riya Patel — Business Analyst, Ops",
      avoidExample: "“Ops team” — not a named person.",
    },
    preparedDate: {
      purpose: "Anchors when this document was prepared (audit trail).",
      expectedInput: "The date you finalize this form.",
      exampleValue: "2026-05-15",
      validationRule: "Format: YYYY-MM-DD.",
    },
    problemStatement: {
      purpose:
        "The clearest 2–4 sentence description of the problem. This is THE single most important field — reviewers re-read it before G2.",
      expectedInput:
        "Describe WHAT is wrong, WHO feels it, WHY it matters. No solutions. No technology.",
      exampleValue:
        "AR clerks spend ~10 hours/week reconciling rental tickets across SAP, an Excel macro, and email. Invoices ship 10 days late on average and 18% trigger disputes, which erodes margin and customer trust.",
      avoidExample:
        "“We need a new billing system.” — that’s a solution and gives reviewers nothing to evaluate.",
    },
    affectedUsers: {
      purpose:
        "Identifies who the problem hurts. Drives later phases’ research, persona, and rollout scope.",
      expectedInput:
        "List every group + a short note on how each one is affected.",
      exampleValue:
        "AR clerks (manual reconciliation), Fleet managers (late invoice visibility), Rental customers (disputes), Finance (slow close).",
      avoidExample: "“Everyone in the company.” — too broad to plan against.",
    },
    userPainPoints: {
      purpose:
        "Concrete symptoms felt in daily work. Helps reviewers feel the problem, not just read about it.",
      expectedInput:
        "Bullet specific pains — time lost, errors made, frustrations, escalations.",
      exampleValue:
        "Friday close runs until 9pm; AR has to re-key 30+ tickets; clerks keep a paper crib sheet of contract exceptions; customers escalate weekly.",
      avoidExample: "“It’s slow and annoying.” — not specific.",
    },
    frequencyOfProblem: {
      purpose:
        "Tells reviewers how often the problem hits — pivotal for cost-of-inaction math.",
      expectedInput:
        "Concrete cadence (per day/week/release/cycle). Add a count if known.",
      exampleValue: "Every week (Fri close); ~120 invoice corrections/month.",
      avoidExample: "“Often.” — reviewers can’t compare it to other problems.",
    },
    severityLevel: {
      purpose:
        "Quick portfolio-level signal. Reviewers compare severity across competing problems.",
      expectedInput:
        "Pick the closest match. Reserve Critical for safety/compliance/revenue-stopping issues.",
      exampleValue: "High",
      avoidExample:
        "Defaulting to Critical on everything — devalues the signal for true critical items.",
    },
    severityRationale: {
      purpose: "Justifies your severity pick so reviewers can challenge or accept it.",
      expectedInput:
        "Cite the impact: revenue, customers, compliance, safety, or operational risk.",
      exampleValue:
        "High because ~$200k/quarter in late-pay interest is forfeited and customer NPS drops 8 pts in disputed cycles.",
      avoidExample: "“It’s really bad.” — no impact basis.",
    },
    currentSolutionOrWorkaround: {
      purpose:
        "Establishes the as-is baseline. Reviewers need this to judge whether change is worth the cost.",
      expectedInput:
        "Describe today’s tools, manual steps, meetings, spreadsheets, hand-offs — even if informal.",
      exampleValue:
        "Excel macro pulls SAP exports nightly; AR clerk reconciles vs. contract PDF; invoice PDFs emailed manually; corrections re-keyed in SAP.",
      avoidExample: "“There is no current process.” — almost never true; describe what people actually do.",
    },
    whyCurrentSolutionIsInsufficient: {
      purpose:
        "Closes the loop: shows reviewers WHY doing nothing is not acceptable.",
      expectedInput:
        "Concrete gaps, repeated failures, missing evidence, cost or risk drivers.",
      exampleValue:
        "Macro breaks on multi-day rentals; no audit trail when corrections happen; AR backlog grew 22% QoQ; reconciliation is single-person dependency.",
      avoidExample: "“It’s outdated.” — not evidence of insufficiency.",
    },
    businessImpact: {
      purpose:
        "Effect on revenue, customers, margin, strategy. Drives later business-case math.",
      expectedInput:
        "Financial, strategic, or customer impact. Numbers where possible; estimates clearly labeled.",
      exampleValue:
        "~$800k/yr revenue exposure from disputes; risk of losing 2 major fleet accounts in renewal Q3.",
      avoidExample: "“Bad for business.” — generic, not actionable.",
    },
    operationalImpact: {
      purpose: "Effect on day-to-day delivery work and team capacity.",
      expectedInput:
        "Wasted time, duplication, bottlenecks, manual rework, dependencies.",
      exampleValue:
        "1.0 FTE/week consumed by reconciliation; finance close delayed 2 days; ops can’t plan fleet utilization until Wed.",
      avoidExample: "“Wastes time.” — quantify if you can.",
    },
    complianceOrRiskImpact: {
      purpose:
        "Surfaces governance, audit, security, privacy, or regulatory exposure. Critical for G2 review.",
      expectedInput:
        "Specific risks: audit gaps, traceability gaps, security/privacy, regulatory deadlines.",
      exampleValue:
        "No audit trail for invoice corrections (SOX exposure); rental customer PII processed outside approved store.",
      avoidExample: "“None.” — re-check; almost every operational problem has some risk exposure.",
    },
    expectedImprovement: {
      purpose:
        "Defines what ‘better’ looks like. Used in later phases as the benchmark for solution success.",
      expectedInput:
        "The desired future state. Pair each improvement with a signal you could measure.",
      exampleValue:
        "Invoice cycle 2 days (from 10); disputes <5% (from 18%); reconciliation 0.2 FTE (from 1.0).",
      avoidExample: "“Faster, fewer errors.” — not measurable.",
    },
    validationSourceType: {
      purpose:
        "Required for G2: signals you didn’t define the problem alone in a vacuum.",
      expectedInput:
        "Pick the closest match. Use Other only when none of the listed types fit, and name it in the source field.",
      exampleValue: "User Interview",
      avoidExample:
        "Picking Other without explanation in the source field below.",
    },
    independentValidationSource: {
      purpose:
        "Names the specific source so reviewers can trust the validation (or contact them).",
      expectedInput:
        "Who/what validated this problem: name + role + when, or report title + date.",
      exampleValue:
        "Interview with Sara Chen (AR Lead, North region) on 2026-05-08; Support ticket trend report Q1 2026.",
      avoidExample: "“Customer feedback.” — not specific enough.",
    },
    validationSummary: {
      purpose: "Captures what the source actually confirmed, in their own framing.",
      expectedInput:
        "2–4 sentences summarizing the source’s findings — what they confirmed about scope, severity, or frequency.",
      exampleValue:
        "Sara confirmed the 10-day average and stated dispute rate is now 18%, up from 12% last year. Said the main breakage is multi-day rentals and weekend pickups.",
      avoidExample: "“They agreed with us.” — say what they confirmed.",
    },
    supportingEvidence: {
      purpose:
        "Linked artifacts reviewers can inspect. Strengthens the problem definition under audit.",
      expectedInput:
        "List artifacts: screenshots, tickets, dashboards, metrics, quotes, recordings. Reference them by ID/name.",
      exampleValue:
        "Screenshot: Q1-AR-backlog.png; Ticket #4421 ‘weekly reconciliation pain’; Metric: AR-DSO dashboard Apr 2026.",
      avoidExample: "“Plenty of evidence.” — name it.",
    },
    assumptions: {
      purpose:
        "Surfaces what you believe but haven’t confirmed. Later phases will test these.",
      expectedInput:
        "List 2–6 assumptions about users, business, technical, or timing. Be honest.",
      exampleValue:
        "Customers will accept a self-serve portal; SAP exposes the needed invoice API; AR team has capacity to onboard a new tool in Q3.",
      avoidExample: "“No assumptions.” — there always are; surface them now.",
    },
    exclusionsOrNonGoals: {
      purpose:
        "Prevents scope creep by stating what this problem definition deliberately doesn’t cover.",
      expectedInput:
        "List adjacent problems, features, or scope items intentionally NOT included.",
      exampleValue:
        "Out of scope: revenue recognition changes; new ERP migration; mobile UX for field crews.",
      avoidExample: "“Nothing excluded.” — be deliberate; reviewers will ask.",
    },
    recommendedNextAction: {
      purpose:
        "Your recommendation for the G2 decision. Reviewers will accept, modify, or reject this.",
      expectedInput:
        "Pick the option matching your conviction. Proceed only when the problem is well-validated.",
      exampleValue: "Proceed to Evaluation and Selection",
      avoidExample: "Picking Proceed when validation is thin.",
    },
    recommendationRationale: {
      purpose: "Helps reviewers agree with (or push back on) your recommendation.",
      expectedInput:
        "Say WHY this recommendation fits now — what is proven, what is missing, what you would do next.",
      exampleValue:
        "Problem is well-validated by AR Lead and support data. Severity is high. Solution direction is open — selection phase will compare 2–3 paths.",
      avoidExample: "“Sounds right.” — gives reviewers nothing.",
    },
    approvalStatus: {
      purpose:
        "Reflects the real state of THIS document, not the problem itself.",
      expectedInput:
        "Draft while writing; Submitted when ready; Approved only after reviewer accepts for G2.",
      exampleValue: "Submitted",
      avoidExample:
        "Marking Approved before a reviewer signs off — breaks the audit trail.",
    },
    approvalNotes: {
      purpose:
        "Captures decision detail so others can see WHY it was approved, returned, deferred, or rejected.",
      expectedInput:
        "For your chosen status: what was approved, what must change (if Returned), or why Deferred/Rejected.",
      exampleValue:
        "Returned: add at least one independent validation source beyond the AR Lead.",
      avoidExample: "“OK.” — fine in chat, not in governance.",
    },
    reviewerName: {
      purpose:
        "Names the person accountable for the G2 decision on this problem. Required for audit.",
      expectedInput: "Full name of the actual reviewer.",
      exampleValue: "Jordan Okonkwo",
      avoidExample: "“Governance team.” — not a named individual.",
    },
    reviewerRole: {
      purpose:
        "Confirms the reviewer has standing to make the G2 call.",
      expectedInput: "Their role in the decision — not their HR title.",
      exampleValue: "Portfolio Owner",
      avoidExample: "“Manager.” — too generic.",
    },
    reviewDate: {
      purpose:
        "Locks the date of the G2 decision — used in audit and SLA tracking.",
      expectedInput: "Date the reviewer recorded the decision above.",
      exampleValue: "2026-05-22",
      validationRule: "Format: YYYY-MM-DD.",
    },
    additionalNotes: {
      purpose:
        "Optional context that doesn’t fit elsewhere — open questions, dependencies, caveats.",
      expectedInput:
        "Free text. Use only if you actually have something useful to add.",
      exampleValue:
        "Open question: should we wait for the SAP S/4 upgrade in Q4 before scoping integration?",
      avoidExample:
        "Filler like “See above.” — leave empty if there’s nothing to add.",
    },
  },

  "A-3.1": {
    scorecardName: {
      purpose: "Recognizable name for this scorecard run. Reviewers scan in lists.",
      expectedInput: "Short label tying scorecard to the initiative + period.",
      exampleValue: "HEOBE Selection Scorecard – Q3 2026",
      avoidExample: "“Scorecard 1” — meaningless in archives.",
    },
    candidateInitiative: {
      purpose: "The initiative being scored. Anchors what the scorecard evaluates.",
      expectedInput: "Initiative name + (optional) tracking ID.",
      exampleValue: "Heavy Equipment Operator Billing Engine (IDEA-0001)",
      avoidExample: "“New billing thing.” — be specific.",
    },
    owner: {
      purpose: "Single accountable owner for the scorecard outcome.",
      expectedInput: "Full name + role.",
      exampleValue: "Jamie Nguyen — Product Owner, North region",
      avoidExample: "A team name; pick one person.",
    },
    preparedBy: {
      purpose: "Author of the scoring. May differ from the owner.",
      expectedInput: "Full name + role.",
      exampleValue: "Riya Patel — Business Analyst",
      avoidExample: "Initials only — hard to trace later.",
    },
    reviewDate: {
      purpose: "When the scorecard was finalized for governance review.",
      expectedInput: "Today’s date or the date you finalize the form.",
      exampleValue: "2026-05-22",
      validationRule: "Format: YYYY-MM-DD.",
    },
    decisionBodyReviewer: {
      purpose: "Authority that will approve/reject. Drives where this scorecard gets routed.",
      expectedInput: "Group or named role (e.g. Portfolio Council, CTO).",
      exampleValue: "Portfolio Council (Chair: Jordan Okonkwo)",
      avoidExample: "“Leadership.” — too vague.",
    },
    relatedProblemDefinition: {
      purpose: "Traces this selection back to the approved A-0.1 problem.",
      expectedInput: "A-0.1 artifact ID + title (or N/A with justification).",
      exampleValue: "PROB-0001 — Manual lifecycle governance causes document drift",
      avoidExample: "Free-text problem description — link the artifact.",
    },
    relatedBusinessFieldReport: {
      purpose: "Traces this selection to A-4 evidence (or a documented waiver).",
      expectedInput: "A-4 artifact ID + title, OR a waiver reference if A-4 is skipped.",
      exampleValue: "BFR-0001 — North America rental market 2026",
      avoidExample: "Leaving blank — at least record a waiver reason.",
    },
    existingProductId: {
      purpose:
        "If this fits an existing product line (PRD-XXX), link it. Otherwise this is a NEW product candidate.",
      expectedInput: "PRD-XXX format, or N/A if this is a new product.",
      exampleValue: "PRD-042",
      avoidExample: "Made-up IDs — use registered PRD codes only.",
    },
    candidateNewProduct: {
      purpose: "Signals whether selection creates a new product (PRD).",
      expectedInput: "Yes if no existing PRD-XXX fits; Unknown only if unclear.",
      exampleValue: "Yes",
      avoidExample: "Defaulting to Unknown to avoid commitment.",
    },
    candidatePclCode: {
      purpose: "Product Classification (PCL-L.D.E.C) signals criticality & governance load.",
      expectedInput: "PCL-L.D.E.C format. See PRCS standard. N/A if not yet known.",
      exampleValue: "PCL-3.1.3.2 (App+Platform / SaaS / API+Webhooks / High)",
      avoidExample: "Random digits — must match the PRCS spec.",
    },
    likelyDomainTags: {
      purpose: "Drives discoverability and portfolio analytics.",
      expectedInput: "Comma-separated domain tags from PRCS controlled vocab.",
      exampleValue: "Finance, Operations, Commerce",
      avoidExample: "Free invented tags — use controlled vocabulary.",
    },
    workTypeTags: {
      purpose: "Used for cross-cutting or pre-product work (per PRCS Layer-2).",
      expectedInput: "Work Type Tag codes (WA, AP, IN, MN...) or N/A.",
      exampleValue: "AP-RS, IN",
      avoidExample: "Mixing PCL codes with work type tags — different namespaces.",
    },

    strategicAlignmentWeight: {
      purpose: "Weight applied to Strategic alignment score (sum of weights = 100).",
      expectedInput: "Number (0–100). Document weighting model in the rationale.",
      exampleValue: "20",
      avoidExample: "Negative or >100 values.",
    },
    strategicAlignmentScore: {
      purpose: "How well the initiative supports stated strategy (1=poor, 5=strong fit).",
      expectedInput: "Integer 1–5.",
      exampleValue: "4",
      avoidExample: "Defaulting all criteria to 3.",
    },
    strategicAlignmentWeightedScore: {
      purpose: "Weight × Score. Drives the total scorecard ranking.",
      expectedInput: "Number (Weight ÷ 100 × Score). Compute or paste your formula result.",
      exampleValue: "0.80",
      avoidExample: "Leaving blank — total ranking won’t compute.",
    },
    strategicAlignmentEvidence: {
      purpose: "Justifies the score. Reviewers will challenge unsupported high scores.",
      expectedInput: "Cite specific strategy doc, OKR, or executive statement.",
      exampleValue: "FY26 OKR ‘increase rental revenue per asset’ — directly supported.",
      avoidExample: "“It aligns.” — name what it aligns to.",
    },

    customerUserValueWeight: {
      purpose: "Weight applied to Customer/user value score.",
      expectedInput: "Number (0–100).",
      exampleValue: "20",
    },
    customerUserValueScore: {
      purpose: "How much real value end users get (1=marginal, 5=transformative).",
      expectedInput: "Integer 1–5.",
      exampleValue: "5",
    },
    customerUserValueWeightedScore: {
      purpose: "Weight × Score for customer/user value.",
      expectedInput: "Number.",
      exampleValue: "1.00",
    },
    customerUserValueEvidence: {
      purpose: "User/customer evidence: interviews, NPS, ticket data.",
      expectedInput: "Cite specific user voice or data.",
      exampleValue: "12 of 14 AR clerks interviewed cite this as #1 daily pain.",
      avoidExample: "“Users will love it.” — show evidence.",
    },

    businessValueWeight: {
      purpose: "Weight applied to Business value score.",
      expectedInput: "Number (0–100).",
      exampleValue: "15",
    },
    businessValueScore: {
      purpose: "Revenue, margin, cost-saving, or strategic enabler (1=marginal, 5=major).",
      expectedInput: "Integer 1–5.",
      exampleValue: "4",
    },
    businessValueWeightedScore: {
      purpose: "Weight × Score for business value.",
      expectedInput: "Number.",
      exampleValue: "0.60",
    },
    businessValueEvidence: {
      purpose: "Financial or strategic basis for the score.",
      expectedInput: "Estimated revenue impact, cost-save, or strategic enabler with basis.",
      exampleValue: "~$800k/yr AR write-down avoidance; basis: FY25 dispute cost report.",
      avoidExample: "Untethered numbers — show the basis.",
    },

    marketOpportunityStrengthWeight: {
      purpose: "Weight applied to Market/opportunity score.",
      expectedInput: "Number (0–100).",
      exampleValue: "10",
    },
    marketOpportunityStrengthScore: {
      purpose: "Size and reachability of the opportunity (1=narrow, 5=large+reachable).",
      expectedInput: "Integer 1–5.",
      exampleValue: "3",
    },
    marketOpportunityStrengthWeightedScore: {
      purpose: "Weight × Score for market/opportunity.",
      expectedInput: "Number.",
      exampleValue: "0.30",
    },
    marketOpportunityStrengthEvidence: {
      purpose: "Market data justifying the score (A-4 business field report is ideal source).",
      expectedInput: "TAM/SAM/SOM, competitor coverage, or segment growth signal.",
      exampleValue: "BFR-0001 §5: NA rental market $4.2B; segment growth 6% YoY.",
      avoidExample: "“Big market.” — say how big and source it.",
    },

    feasibilitySignalWeight: {
      purpose: "Weight applied to Feasibility score.",
      expectedInput: "Number (0–100).",
      exampleValue: "10",
    },
    feasibilitySignalScore: {
      purpose: "Confidence we can deliver this (1=high risk, 5=clear path).",
      expectedInput: "Integer 1–5.",
      exampleValue: "3",
    },
    feasibilitySignalWeightedScore: {
      purpose: "Weight × Score for feasibility.",
      expectedInput: "Number.",
      exampleValue: "0.30",
    },
    feasibilitySignalEvidence: {
      purpose: "Tech, team, data, and dependency feasibility signal.",
      expectedInput: "Known integrations, team skill match, data availability, vendor maturity.",
      exampleValue: "SAP integration has documented APIs; team has 2 SAP-experienced devs.",
      avoidExample: "“Should be fine.” — show your basis.",
    },

    riskUncertaintyWeight: {
      purpose: "Weight applied to Risk/uncertainty score.",
      expectedInput: "Number (0–100).",
      exampleValue: "10",
    },
    riskUncertaintyScore: {
      purpose: "Risk level (1=high risk/uncertainty, 5=low risk).",
      expectedInput: "Integer 1–5. Higher = LESS risk.",
      exampleValue: "3",
      avoidExample: "Confusing direction — remember higher score = lower risk.",
    },
    riskUncertaintyWeightedScore: {
      purpose: "Weight × Score for risk.",
      expectedInput: "Number.",
      exampleValue: "0.30",
    },
    riskUncertaintyEvidence: {
      purpose: "Top risks driving the score.",
      expectedInput: "Name top 2–3 risks: adoption, integration, vendor, regulatory.",
      exampleValue:
        "SAP integration timing risk (S/4 upgrade Q4); rental customer adoption unknown.",
      avoidExample: "“Some risks.” — name them.",
    },

    costCapacityFitWeight: {
      purpose: "Weight applied to Cost/capacity score.",
      expectedInput: "Number (0–100).",
      exampleValue: "10",
    },
    costCapacityFitScore: {
      purpose: "Fit with current budget and team capacity (1=poor, 5=clean fit).",
      expectedInput: "Integer 1–5.",
      exampleValue: "4",
    },
    costCapacityFitWeightedScore: {
      purpose: "Weight × Score for cost/capacity.",
      expectedInput: "Number.",
      exampleValue: "0.40",
    },
    costCapacityFitEvidence: {
      purpose: "How this fits available capacity and budget.",
      expectedInput: "Est cost band, team availability, deferred work trade-off.",
      exampleValue: "Est $450–600k; 2 of 3 needed engineers free post-July.",
      avoidExample: "“Affordable.” — name the number band.",
    },

    complianceSecurityExposureWeight: {
      purpose: "Weight applied to Compliance/security score.",
      expectedInput: "Number (0–100).",
      exampleValue: "5",
    },
    complianceSecurityExposureScore: {
      purpose: "Exposure level (1=high regulatory/security load, 5=low).",
      expectedInput: "Integer 1–5. Higher = LESS exposure.",
      exampleValue: "3",
    },
    complianceSecurityExposureWeightedScore: {
      purpose: "Weight × Score for compliance/security.",
      expectedInput: "Number.",
      exampleValue: "0.15",
    },
    complianceSecurityExposureEvidence: {
      purpose: "Top compliance/security touchpoints driving the score.",
      expectedInput: "PII, PCI, SOX, regional regulation, audit scope.",
      exampleValue:
        "PCI scope if portal holds card data; SOC2 audit logging needed; SOX impact on AR controls.",
      avoidExample: "“None.” — re-check; almost always there is something.",
    },

    candidateComparisonTable: {
      purpose: "Side-by-side ranking when multiple candidates were scored.",
      expectedInput:
        "Markdown table OR narrative listing candidates, totals, ranks, recommendation, key reason.",
      exampleValue:
        "| Candidate | Total | Rank | Rec | Key reason |\n| HEOBE | 3.85 | 1 | Proceed | Strongest user value |\n| Manual fix | 1.40 | 2 | Stop | Doesn’t solve root cause |",
      avoidExample: "Leaving blank when there were alternatives considered.",
    },

    selectionRecommendation: {
      purpose: "Headline recommendation for portfolio review.",
      expectedInput: "Pick the option matching the totals + your conviction.",
      exampleValue: "Proceed to Feasibility",
      avoidExample: "Proceeding when total score is below the program’s threshold.",
    },
    selectionRecommendationRationale: {
      purpose: "Justifies the headline recommendation in plain English.",
      expectedInput: "2–5 sentences tying recommendation back to top criteria.",
      exampleValue:
        "Highest user value (5) and strong strategic alignment (4). Feasibility is moderate; main unknown is SAP integration window, which the feasibility phase will resolve.",
      avoidExample: "“Numbers say yes.” — explain why.",
    },
    dependenciesAssumptions: {
      purpose: "Dependencies that must hold for the recommendation to be valid.",
      expectedInput: "List 2–6 dependencies + key assumptions.",
      exampleValue:
        "SAP S/4 upgrade timeline holds; 2 SAP-experienced engineers freed in July; legal approves customer portal PII handling.",
      avoidExample: "“No dependencies.” — there always are.",
    },
    knownEvidenceGaps: {
      purpose: "Honesty signal — what evidence is missing as of this scoring.",
      expectedInput: "Explicit gaps reviewers should know about, or ‘None’.",
      exampleValue:
        "Missing: rental customer adoption survey; updated SAP integration cost estimate.",
      avoidExample: "“None” when the rationale clearly relied on assumptions.",
    },
    waiversIfAny: {
      purpose: "Records any standard or evidence requirement intentionally skipped.",
      expectedInput: "Waiver reference + reason, or ‘None’.",
      exampleValue: "WVR-0007: A-4 deferred to feasibility phase (low market uncertainty).",
      avoidExample: "Skipping waivers silently — record them.",
    },

    selectionDecision: {
      purpose: "Formal recorded G3 decision (may mirror the recommendation).",
      expectedInput: "Final decision in 1–2 sentences.",
      exampleValue:
        "Approved to proceed to Feasibility. Reconfirm SAP integration cost before G4.",
      avoidExample: "Identical copy of recommendation — capture decision context.",
    },
    selectionReviewerAuthority: {
      purpose: "Who made the G3 call. Required for audit.",
      expectedInput: "Named individual + role.",
      exampleValue: "Jordan Okonkwo — Portfolio Council Chair",
      avoidExample: "A group name — name one person.",
    },
    selectionDecisionDate: {
      purpose: "Locks the G3 decision date.",
      expectedInput: "Date of the decision meeting.",
      exampleValue: "2026-05-29",
      validationRule: "Format: YYYY-MM-DD.",
    },
    selectionDecisionNotes: {
      purpose: "Decision detail beyond the recommendation.",
      expectedInput: "Conditions, follow-ups, dissent noted, conditions on approval.",
      exampleValue:
        "Approved with condition: refresh customer adoption signal before G4.",
      avoidExample: "“Approved.” — capture the texture.",
    },
    selectionNextAction: {
      purpose: "Concrete next step coming out of G3.",
      expectedInput: "Single, time-bound next action with owner.",
      exampleValue: "Kick off A-3.2 Feasibility (R. Patel, by 2026-06-05).",
      avoidExample: "“Continue work.” — name the action.",
    },
    documentStatus: {
      purpose: "State of THIS scorecard document.",
      expectedInput: "Draft → Submitted → Approved or Returned.",
      exampleValue: "Submitted",
      avoidExample: "Marking Approved before reviewer sign-off.",
    },
  },

  "A-3.2": {
    projectName: {
      purpose: "Anchors the feasibility study to a specific initiative.",
      expectedInput: "Initiative or product name.",
      exampleValue: "Heavy Equipment Operator Billing Engine",
    },
    ideaTitle: {
      purpose: "Trace back to the A-0 idea this feasibility study tests.",
      expectedInput: "Copy from the A-0 Idea Capture form exactly.",
      exampleValue: "Heavy equipment rental billing portal",
    },
    projectOwner: {
      purpose: "Single owner accountable for feasibility findings.",
      expectedInput: "Full name + role.",
      exampleValue: "Jamie Nguyen — Product Owner",
    },
    datePrepared: {
      purpose: "Anchors data freshness.",
      expectedInput: "Date you finalized this assessment.",
      exampleValue: "2026-06-05",
      validationRule: "Format: YYYY-MM-DD.",
    },
    reviewers: {
      purpose: "People whose review is required for G4.",
      expectedInput: "Comma-separated names + roles.",
      exampleValue: "Jordan Okonkwo (Portfolio); Lin Wei (CTO office); R. Patel (BA)",
      avoidExample: "“TBD.” — name reviewers up front.",
    },
    existingProductId: {
      purpose: "Link to existing PRD or mark new.",
      expectedInput: "PRD-XXX or N/A.",
      exampleValue: "PRD-042",
    },
    candidateNewProduct: {
      purpose: "Signals new product creation triggers PRCS registration.",
      expectedInput: "Yes if creating new PRD; No if extending existing.",
      exampleValue: "Yes",
    },
    candidatePclCode: {
      purpose: "PRCS classification (PCL-L.D.E.C).",
      expectedInput: "Format PCL-L.D.E.C, see PRCS standard.",
      exampleValue: "PCL-3.1.3.2",
    },
    pclCriticalityRationale: {
      purpose: "Justifies the criticality digit (last digit of PCL).",
      expectedInput: "Why this criticality (Low/Med/High/Regulated/Safety-Critical).",
      exampleValue:
        "High because customer payment data + monthly revenue dependency.",
    },
    domainTags: {
      purpose: "Drives discoverability and portfolio analytics.",
      expectedInput: "Comma-separated tags from PRCS controlled vocab.",
      exampleValue: "Finance, Operations, Commerce",
    },
    functionDescriptors: {
      purpose: "Functional descriptors (PRCS Layer-1).",
      expectedInput: "Comma-separated functional descriptors, or N/A.",
      exampleValue: "Billing, Rental, Customer Portal",
    },
    workTypeTags: {
      purpose: "PRCS Layer-2 work type tags for cross-cutting/pre-product work.",
      expectedInput: "Work type codes (WA, AP, IN…) or N/A.",
      exampleValue: "AP-RS, IN",
    },

    sourceIdeaCapture: {
      purpose: "Traces feasibility back to A-0 source artifact.",
      expectedInput: "A-0 artifact ID + title.",
      exampleValue: "IDEA-0001 — Heavy equipment rental billing portal",
    },
    sourceProblemDefinition: {
      purpose: "Traces to A-0.1 problem source.",
      expectedInput: "A-0.1 artifact ID + title.",
      exampleValue: "PROB-0001 — Manual lifecycle governance causes drift",
    },
    sourceSelectionScorecard: {
      purpose: "Traces to A-3.1 selection decision.",
      expectedInput: "A-3.1 artifact ID + decision outcome.",
      exampleValue: "SEL-0001 — Proceed to Feasibility",
    },
    sourceBusinessFieldReport: {
      purpose: "Traces to A-4 market evidence.",
      expectedInput: "A-4 artifact ID + title (or waiver reference).",
      exampleValue: "BFR-0001 — NA rental market 2026",
    },
    sourceEarlyResearchNotes: {
      purpose: "Surfaces any prior research feeding this assessment.",
      expectedInput: "Doc references, interview notes, prototype results, or N/A.",
      exampleValue: "SAP integration spike notes (May 2026)",
    },
    sourceTechnicalNotes: {
      purpose: "Surfaces prior technical exploration.",
      expectedInput: "Doc links, ADRs, spike notes, or N/A.",
      exampleValue: "ADR-007: SAP integration via OData",
    },
    sourceStakeholderNotes: {
      purpose: "Surfaces stakeholder interview findings.",
      expectedInput: "Names + dates + summary, or N/A.",
      exampleValue: "Sara Chen (AR Lead) interview 2026-05-12 — see notes link",
    },
    sourceOther: {
      purpose: "Catch-all for sources that don't fit above.",
      expectedInput: "Doc/title + relevance, or 'None'.",
      exampleValue: "Gartner Rental SaaS 2026 Magic Quadrant",
    },

    overallFeasibilitySummary: {
      purpose: "Executive view: is this project realistic? What helps/hurts?",
      expectedInput: "3–6 sentences naming top enablers + top blockers + must-clarify items.",
      exampleValue:
        "Feasible with conditions. Enablers: existing SAP expertise, validated user pain. Blockers: SAP S/4 upgrade timing collides with our Q3 window. Must clarify: customer portal PII handling before requirements phase.",
      avoidExample: "“Feasible.” — name what makes it so.",
    },

    techRequiredTechnologies: {
      purpose: "Technologies the project will require.",
      expectedInput: "Comma list: languages, frameworks, services.",
      exampleValue: "Next.js, Node, Postgres, SAP OData, Stripe",
    },
    techKnownStack: {
      purpose: "Of those, what we already run + know well.",
      expectedInput: "Subset of required tech already in production use.",
      exampleValue: "Next.js, Node, Postgres",
    },
    techNewToolsFrameworks: {
      purpose: "New tech we'd be introducing — increases risk.",
      expectedInput: "What's new + why we need it.",
      exampleValue: "SAP OData adapter (first time); Stripe Connect (first time)",
    },
    techArchitectureComplexity: {
      purpose: "Signal whether architecture is straightforward or complex.",
      expectedInput: "Short paragraph naming complexity drivers.",
      exampleValue:
        "Moderate: 2 new external integrations (SAP, Stripe); event-driven billing pipeline; PII handling.",
    },
    techDataStorageNeeds: {
      purpose: "Data shape + volume + sensitivity.",
      expectedInput: "Storage type + estimated size + sensitivity tier.",
      exampleValue:
        "Postgres ~50GB invoice/rental data; S3 ~200GB scanned contracts; PII confidential tier.",
    },
    techApiRequirements: {
      purpose: "Inbound + outbound API surface.",
      expectedInput: "Internal API endpoints + external APIs consumed.",
      exampleValue:
        "Internal REST API for portal; consume SAP OData (read/write invoices); Stripe payment intents.",
    },
    techPerformanceNeeds: {
      purpose: "Drives capacity + SLO targets.",
      expectedInput: "Latency, throughput, concurrent users, batch sizes.",
      exampleValue: "p95 portal <500ms; ~200 concurrent AR users; nightly batch <30 min.",
    },
    techSecurityNeeds: {
      purpose: "Security surface (separate from compliance section).",
      expectedInput: "AuthN/AuthZ, encryption, secrets, threat model needs.",
      exampleValue:
        "MFA for admin; field-level encryption for payment data; SAP service account in KMS.",
    },
    techPrototypeRequired: {
      purpose: "Triggers a spike phase if unknowns are too high.",
      expectedInput: "Yes if any tech is unproven for us; No otherwise.",
      exampleValue: "Yes",
      avoidExample: "No when there are listed unknowns.",
    },
    techUnknowns: {
      purpose: "Surfaces what to spike/research before commit.",
      expectedInput: "List 2–6 specific unknowns with each one's impact.",
      exampleValue:
        "SAP OData rate limits at our volume; Stripe Connect compliance scope for rentals; portal load profile during month-end.",
      avoidExample: "“Nothing.” — re-check; almost always there is something.",
    },
    technicalFeasibilityRating: {
      purpose: "Headline technical signal.",
      expectedInput: "Pick High/Medium/Low/Unknown matching the sub-field detail.",
      exampleValue: "Medium",
    },

    resRequiredRoles: {
      purpose: "Roles the team will need.",
      expectedInput: "Bullet roles with FTE counts.",
      exampleValue: "2 FE engineers, 2 BE engineers, 1 BA, 0.5 designer, 0.5 SRE",
    },
    resAvailableSkills: {
      purpose: "Skills we have today.",
      expectedInput: "Match available skills to roles.",
      exampleValue: "2 FE (TS/Next), 2 BE (Node/SAP), BA in-house",
    },
    resMissingSkills: {
      purpose: "Where we'll need hiring/contracting.",
      expectedInput: "Skills missing or stretched + plan.",
      exampleValue: "Stripe Connect expertise — contract specialist for 6 weeks.",
    },
    resRequiredTools: {
      purpose: "Tools the project needs.",
      expectedInput: "Dev tools, test tools, design tools.",
      exampleValue: "Datadog (existing), Stripe sandbox, SAP dev tenant",
    },
    resRequiredLicenses: {
      purpose: "License costs/seats.",
      expectedInput: "Licenses + seats + cost band.",
      exampleValue: "+5 Stripe Connect seats; +2 SAP dev tenant licenses",
    },
    resRequiredVendors: {
      purpose: "External vendors needed.",
      expectedInput: "Vendor + role + status.",
      exampleValue: "Stripe (signed); SAP integration partner (TBD)",
    },
    resDevelopmentCapacity: {
      purpose: "Team time available for this work.",
      expectedInput: "FTE-weeks available across the target timeline.",
      exampleValue: "≈110 FTE-weeks over Jul–Dec 2026 from product platform team",
    },
    resSupportCapacity: {
      purpose: "Post-launch support headroom.",
      expectedInput: "Who supports; SLA tier; capacity.",
      exampleValue: "Tier-2 by platform team; 0.3 FTE budgeted",
    },
    resourceFeasibilityRating: {
      purpose: "Headline resource signal.",
      expectedInput: "Pick High/Medium/Low/Unknown.",
      exampleValue: "Medium",
    },

    schedDesiredStartDate: {
      purpose: "Earliest desired start.",
      expectedInput: "Date or 'as soon as approved'.",
      exampleValue: "2026-07-01",
    },
    schedDesiredReleaseDate: {
      purpose: "Target release window.",
      expectedInput: "Date or quarter.",
      exampleValue: "2026-11-30 (Q4 2026)",
    },
    schedEstimatedDuration: {
      purpose: "Total elapsed time estimate.",
      expectedInput: "Range in weeks/months.",
      exampleValue: "≈5 months elapsed; ≈4 months active build",
    },
    schedMajorMilestones: {
      purpose: "Major milestones reviewers can track.",
      expectedInput: "Bullet 3–6 milestones with target dates.",
      exampleValue:
        "Aug 1: SAP spike done. Sep 15: alpha. Oct 31: beta. Nov 30: GA.",
    },
    schedTimeSensitiveDeadlines: {
      purpose: "Hard deadlines reviewers must respect.",
      expectedInput: "Specific external/regulatory/contract deadlines.",
      exampleValue: "Rental peak season begins Aug 1; year-end SOX freeze Dec 15.",
    },
    schedScheduleRisks: {
      purpose: "Schedule-specific risks.",
      expectedInput: "Top 2–4 risks to timeline.",
      exampleValue:
        "SAP S/4 upgrade may push integration; holiday code freeze cuts Nov capacity 30%.",
    },
    schedDependenciesTimeline: {
      purpose: "External deps with timeline impact.",
      expectedInput: "List deps + their dates.",
      exampleValue:
        "SAP S/4 upgrade lands 2026-09-01; Stripe Connect onboarding ~6 wk; Legal review of PII handling.",
    },
    scheduleFeasibilityRating: {
      purpose: "Headline schedule signal.",
      expectedInput: "Pick High/Medium/Low/Unknown.",
      exampleValue: "Medium",
    },

    finEstimatedCost: {
      purpose: "Total estimated cost — informs G4 funding ask.",
      expectedInput: "Cost band with major buckets (people, infra, vendor).",
      exampleValue:
        "$450k–$650k: $380k people; $30k infra; $50–200k Stripe fees & SAP partner",
    },
    finExpectedSavings: {
      purpose: "Concrete savings if delivered.",
      expectedInput: "Numbers with basis.",
      exampleValue:
        "$200k/yr (0.5 FTE reconciliation reduced); $80k/yr late-pay interest avoided",
    },
    finExpectedRevenue: {
      purpose: "Revenue uplift if any.",
      expectedInput: "Numbers with basis; N/A if internal.",
      exampleValue: "Optional revenue add: rental ARPU +$1.2k via add-on (Year 2)",
    },
    finExpectedEfficiencyGain: {
      purpose: "Operational efficiency uplift.",
      expectedInput: "Time saved, cycle reduction, error reduction.",
      exampleValue: "Invoice cycle 10d → 2d; disputes 18% → 5%",
    },
    finExpectedCustomerValue: {
      purpose: "Customer-side benefit (separate from internal savings).",
      expectedInput: "Concrete customer outcome.",
      exampleValue:
        "Self-serve invoice access; dispute resolution 5d → 1d; better NPS",
    },
    finFundingAvailability: {
      purpose: "Where the money comes from.",
      expectedInput: "Funded line, sponsor budget, or 'requires new ask'.",
      exampleValue: "Funded by FY26 Platform CapEx + COO ops budget contribution",
    },
    finReturnOnInvestment: {
      purpose: "Simple ROI signal.",
      expectedInput: "Payback period + 3-yr ROI band.",
      exampleValue: "Payback ≈14 months; 3-yr ROI ~2.1×",
    },
    finCostOfNotDoingProject: {
      purpose: "Cost of inaction — critical for go/no-go.",
      expectedInput: "Quantified pain if we don't do this.",
      exampleValue:
        "$280k/yr forfeited AR carrying cost + risk of 2 fleet account losses Q3",
    },
    financialFeasibilityRating: {
      purpose: "Headline financial signal.",
      expectedInput: "Pick High/Medium/Low/Unknown.",
      exampleValue: "High",
    },

    opsWhoWillUseIt: {
      purpose: "Primary users (matches A-0.1 affected users).",
      expectedInput: "Roles + approx user counts.",
      exampleValue: "AR clerks (12); fleet managers (8); rental customers (~400)",
    },
    opsWhoWillAdminister: {
      purpose: "Who runs the back-office side.",
      expectedInput: "Named role/team.",
      exampleValue: "Finance Ops admin (1 named user)",
    },
    opsWhoWillSupport: {
      purpose: "Who handles tier-1/2/3 support.",
      expectedInput: "Support tiers + named teams.",
      exampleValue: "T1: customer success; T2: AR ops; T3: platform engineering",
    },
    opsWorkflowChange: {
      purpose: "What user workflows change.",
      expectedInput: "Specific workflow deltas, before vs after.",
      exampleValue:
        "AR: stop weekly reconciliation; customers: stop calling for invoices; finance: close 2 days earlier.",
    },
    opsTrainingNeeded: {
      purpose: "Training delta to use the new system.",
      expectedInput: "Audience + duration + format.",
      exampleValue: "AR clerks: 2-hr workshop; customers: 5-min video + walk-through",
    },
    opsDocumentationNeeded: {
      purpose: "Docs we need to produce.",
      expectedInput: "Audience + doc types.",
      exampleValue: "User guide (customers); admin runbook; SOP for AR clerks",
    },
    opsSupportLoadImpact: {
      purpose: "Net change to support load.",
      expectedInput: "+/- tickets per week + reasoning.",
      exampleValue: "−40 disputes/wk; +10 portal access tickets initial month",
    },
    opsFitWithCurrentOperations: {
      purpose: "Whether this fits how the org runs today.",
      expectedInput: "Short paragraph on fit; flag misfits.",
      exampleValue:
        "Good fit; uses existing finance close cadence. Risk: customer success doesn't currently handle billing escalations.",
    },
    operationalFeasibilityRating: {
      purpose: "Headline ops signal.",
      expectedInput: "Pick High/Medium/Low/Unknown.",
      exampleValue: "Medium",
    },

    secAuthzNeeds: {
      purpose: "AuthN/AuthZ surface for this project.",
      expectedInput: "Roles, MFA, federation, RLS.",
      exampleValue: "SSO + MFA for staff; magic-link + WebAuthn for customers; RLS by tenant",
    },
    secSensitiveDataInvolved: {
      purpose: "Names sensitive data classes (drives compliance).",
      expectedInput: "PII/PCI/PHI/PII tags + storage locations.",
      exampleValue:
        "PCI (Stripe tokens), PII (customer contact + addresses), no PHI",
    },
    secAuditLogsNeeded: {
      purpose: "Audit log requirements (SOC2, internal audit).",
      expectedInput: "What events, retention, destination.",
      exampleValue:
        "Yes: invoice create/modify, AR corrections, admin access; 2-yr retention; SIEM destination",
    },
    secComplianceRequirements: {
      purpose: "Regulatory scope this project enters.",
      expectedInput: "Frameworks + scope.",
      exampleValue: "SOC2 Type II in-scope; SOX (AR controls); state privacy (CA, NY)",
    },
    secPrivacyReviewRequired: {
      purpose: "Whether legal/privacy review is mandatory.",
      expectedInput: "Yes/No + who runs it.",
      exampleValue: "Yes — DPO + legal (PII customer portal)",
    },
    secKnownSecurityRisks: {
      purpose: "Top risks worth surfacing now.",
      expectedInput: "Top 2–5 risks + mitigation direction.",
      exampleValue:
        "Card data scope creep (mitigation: Stripe tokenization); SAP service account leakage (mitigation: KMS + rotation)",
    },
    securityComplianceFeasibilityRating: {
      purpose: "Headline security/compliance signal.",
      expectedInput: "Pick High/Medium/Low/Unknown.",
      exampleValue: "Medium",
    },

    intExternalApis: {
      purpose: "External APIs we'll consume.",
      expectedInput: "API name + purpose + maturity.",
      exampleValue: "SAP OData (invoices); Stripe (payments); Twilio (notifications)",
    },
    intInternalSystems: {
      purpose: "Internal systems we'll touch.",
      expectedInput: "System + integration nature.",
      exampleValue: "SAP ERP (invoice read/write); IdP (SSO); Datadog (metrics)",
    },
    intThirdPartyServices: {
      purpose: "Third-party SaaS used at runtime.",
      expectedInput: "Service + purpose.",
      exampleValue: "Stripe, Twilio, Datadog, Sentry",
    },
    intVendorDependencies: {
      purpose: "Vendor relationships needed.",
      expectedInput: "Vendor + contract status.",
      exampleValue: "Stripe (signed MSA); SAP integration partner (RFP in flight)",
    },
    intOpenSourceDependencies: {
      purpose: "Critical OSS deps to watch.",
      expectedInput: "Top OSS libs we'd lean on.",
      exampleValue: "Next.js, Prisma, Zod, tRPC, Tailwind",
    },
    intDataImportExport: {
      purpose: "Data going in/out.",
      expectedInput: "Source + destination + format + freq.",
      exampleValue:
        "SAP → portal (nightly OData); portal → finance close (CSV monthly); audit log → SIEM (streamed)",
    },
    intAuthPaymentCrmErp: {
      purpose: "Integration with foundational enterprise systems.",
      expectedInput: "Named systems + integration nature.",
      exampleValue: "Auth: Okta; Payments: Stripe; CRM: Salesforce (read-only); ERP: SAP",
    },
    intDependencyRisks: {
      purpose: "Risks from dependency choices.",
      expectedInput: "Top 2–4 risks (vendor lock-in, version, sunset…).",
      exampleValue: "SAP OData breaking changes in S/4 upgrade; Stripe Connect pricing model evolving",
    },
    integrationFeasibilityRating: {
      purpose: "Headline integration signal.",
      expectedInput: "Pick High/Medium/Low/Unknown.",
      exampleValue: "Medium",
    },

    mainExpectedOwner: {
      purpose: "Who owns post-launch maintenance.",
      expectedInput: "Named team/role.",
      exampleValue: "Platform team (manager: J. Nguyen)",
    },
    mainSupportLevel: {
      purpose: "Support tier this product targets.",
      expectedInput: "Tier + SLA targets.",
      exampleValue: "Tier-2; uptime 99.9%; p99 portal <1s",
    },
    mainBugFixExpectations: {
      purpose: "How quickly we'll respond to bugs.",
      expectedInput: "SLA bands by severity.",
      exampleValue: "SEV-1 24h; SEV-2 5d; SEV-3 next release",
    },
    mainUpdateFrequency: {
      purpose: "Cadence of releases.",
      expectedInput: "Release cadence.",
      exampleValue: "Bi-weekly minor; quarterly major; emergency hotfix path",
    },
    mainDependencyUpdateBurden: {
      purpose: "Cost of keeping deps current.",
      expectedInput: "Estimated burden in FTE-hours/month.",
      exampleValue: "≈8 hrs/month; auto-PRs via Renovate",
    },
    mainMonitoringNeeds: {
      purpose: "Monitoring/alerting requirements.",
      expectedInput: "Metrics + alerts + dashboards.",
      exampleValue:
        "Golden signals + integration health (SAP, Stripe); PagerDuty for SEV-1; dashboards in Datadog",
    },
    mainDocumentationNeeds: {
      purpose: "Living docs needed in production.",
      expectedInput: "Runbooks, API docs, architecture diagrams.",
      exampleValue:
        "Runbook (SAP outage, Stripe outage); API docs; architecture & data flow diagrams",
    },
    mainLongTermHostingCost: {
      purpose: "Run-rate cost reviewers will care about.",
      expectedInput: "$/month estimate with major components.",
      exampleValue: "≈$2.5–4k/month: AWS $1.8k, Datadog $400, Stripe pass-through",
    },
    maintenanceFeasibilityRating: {
      purpose: "Headline maintenance signal.",
      expectedInput: "Pick High/Medium/Low/Unknown.",
      exampleValue: "High",
    },

    feasibilityRatingSummaryNotes: {
      purpose: "Consolidated summary table of all 8 areas.",
      expectedInput:
        "Table or list per area: rating + 1-sentence note. Reviewers read this first.",
      exampleValue:
        "Technical: Medium — SAP unknowns. Resource: Medium — Stripe skill gap. Schedule: Medium — S/4 timing. Financial: High. Operational: Medium. Security: Medium. Integration: Medium. Maintenance: High.",
      avoidExample: "Just dumping ratings without notes.",
    },

    majorRisks: {
      purpose: "Top risks reviewers must weigh at G4.",
      expectedInput: "Top 3–6 named risks with impact.",
      exampleValue:
        "1) SAP S/4 timing delay. 2) Stripe Connect compliance scope. 3) AR adoption resistance. 4) Holiday capacity squeeze.",
    },
    riskMitigations: {
      purpose: "Concrete mitigations for the risks listed.",
      expectedInput: "1:1 mitigation per risk where possible.",
      exampleValue:
        "1) Parallel SAP spike. 2) PCI scope memo with legal pre-G5. 3) AR change champion + early demo. 4) Front-load Aug/Sep capacity.",
    },
    blockingRisks: {
      purpose: "Risks that would stop G4 approval if not resolved.",
      expectedInput: "List or 'None'.",
      exampleValue: "None (SAP timing is conditional, not blocking)",
    },
    nonBlockingRisks: {
      purpose: "Risks worth flagging but won't stop G4.",
      expectedInput: "List or 'None'.",
      exampleValue:
        "Stripe pricing model evolution; SAP integration partner price uncertainty",
    },

    assumptions: {
      purpose: "What we're assuming — to be tested in later phases.",
      expectedInput: "2–6 assumptions, honest about uncertainty.",
      exampleValue:
        "AR team has Q3 onboarding capacity; SAP S/4 upgrade lands on schedule; customers tolerate portal-only flow.",
    },
    openQuestions: {
      purpose: "Questions still unresolved.",
      expectedInput: "List or 'None'.",
      exampleValue:
        "Does Stripe Connect cover rental deposit flows in CA? Is SOX audit period extended due to ERP change?",
    },
    requiredResearch: {
      purpose: "Research we need before requirements/build.",
      expectedInput: "Research items + owner + by-when, or 'None'.",
      exampleValue:
        "SAP S/4 OData spike (BE lead, by Aug 1); customer rental deposit legal review (Legal, by Aug 15).",
    },

    feasibilityDecision: {
      purpose: "Recommended G4 outcome — captures your conviction.",
      expectedInput: "Pick the closest match.",
      exampleValue: "Feasible with conditions",
      avoidExample: "Picking Feasible when blocking risks exist.",
    },
    feasibilityDecisionDate: {
      purpose: "When the decision was recorded.",
      expectedInput: "Date of decision.",
      exampleValue: "2026-06-12",
      validationRule: "Format: YYYY-MM-DD.",
    },
    feasibilityDecisionMaker: {
      purpose: "Authority making the G4 call.",
      expectedInput: "Named person + role.",
      exampleValue: "Jordan Okonkwo — Portfolio Council Chair",
    },
    feasibilityDecisionRationale: {
      purpose: "Why this decision fits the evidence.",
      expectedInput: "3–6 sentences. Reference the rating summary.",
      exampleValue:
        "Strong financial + operational case offsets moderate tech/schedule risk. Conditions: SAP spike completed before A-1 CRS kickoff; PCI scope memo before A-7 stakeholder work.",
    },
    requiredFollowUp: {
      purpose: "Actions that must happen before/during the next phase.",
      expectedInput: "Specific follow-ups with owners.",
      exampleValue:
        "SAP spike (BE lead, Aug 1); PCI memo (Legal, Aug 15); customer change-champion identified (Product, Aug 15).",
    },
    nextLifecyclePhase: {
      purpose: "Next phase if this is approved.",
      expectedInput: "Phase number/title.",
      exampleValue: "Phase 5 — Requirements (G5)",
    },

    feasibilityApprovalStatus: {
      purpose: "State of THIS feasibility document.",
      expectedInput: "Pick the closest match for current state.",
      exampleValue: "Feasible — Proceed to Requirements",
    },
    feasibilityReviewer: {
      purpose: "Reviewer of record for G4.",
      expectedInput: "Named reviewer + role.",
      exampleValue: "Jordan Okonkwo — Portfolio Council Chair",
    },
    feasibilityReviewDate: {
      purpose: "Date the reviewer recorded the decision.",
      expectedInput: "Date.",
      exampleValue: "2026-06-12",
      validationRule: "Format: YYYY-MM-DD.",
    },
    feasibilityReviewNotes: {
      purpose: "Decision detail — conditions, dissent, next checks.",
      expectedInput: "1–4 sentences.",
      exampleValue:
        "Approved with conditions noted above. Reconfirm SAP integration cost band before CRS kickoff.",
    },
  },

  "A-4": {
    reportTitle: {
      purpose: "Short, recognizable title for the business field report.",
      expectedInput: "3–10 words naming the market/field + period.",
      exampleValue: "North America rental equipment market — 2026",
      avoidExample: "“Market Report.” — too generic.",
    },
    intendedAudience: {
      purpose: "Drives tone, depth, and structure of the report.",
      expectedInput: "Name the forum/role that will act on this report.",
      exampleValue: "Portfolio Council + CFO; sponsor: COO.",
      avoidExample: "“Anyone interested.” — pick a target.",
    },
    preparedBy: {
      purpose: "Author accountable for the analysis quality.",
      expectedInput: "Full name + role.",
      exampleValue: "Riya Patel — Strategy Analyst",
      avoidExample: "Team name — pick a person.",
    },
    datePrepared: {
      purpose: "Anchors the data freshness of this report.",
      expectedInput: "Date the analysis was finalized.",
      exampleValue: "2026-05-15",
      validationRule: "Format: YYYY-MM-DD.",
    },
    relatedInitiativeReference: {
      purpose: "Ties the report to a candidate initiative or PRD.",
      expectedInput: "PRD-XXX or IDEA-XXXX. Use N/A if exploratory.",
      exampleValue: "IDEA-0001",
      avoidExample: "Leaving blank — at least write N/A.",
    },
    reportVariant: {
      purpose: "Tells reviewers which Appendix-A focus this report applies.",
      expectedInput: "Pick the closest variant; only the chosen scope is required in depth.",
      exampleValue: "MarketEntry",
      avoidExample: "Picking Standard then writing a single variant focus.",
    },
    variantSpecificNotes: {
      purpose:
        "Required when variant ≠ Standard: scope, methods, and key findings unique to the variant.",
      expectedInput:
        "≥10 chars when not Standard. Describe geography/segment/competitor set + methods.",
      exampleValue:
        "MarketEntry focus: U.S. Midwest rental segment, primary interviews + IBISWorld data.",
      avoidExample:
        "Leaving blank when variant ≠ Standard — schema will reject.",
    },
    executiveSummary: {
      purpose: "Standalone-readable distillation. Most leaders read only this.",
      expectedInput: "Findings, conclusions, recommendations in 4–8 sentences.",
      exampleValue:
        "Rental equipment SaaS in NA is a $4.2B market growing 6%/yr. Top 3 competitors hold 41% share. Recommend entering via heavy equipment vertical with billing-portal first product. Key risks: SAP integration and customer onboarding speed.",
      avoidExample: "Repeating section headings — it must stand alone.",
    },
    introduction: {
      purpose: "Defines the field and why it matters to the org.",
      expectedInput: "Field definition, scope boundaries, organizational relevance.",
      exampleValue:
        "Rental equipment SaaS covers software for asset rental & billing in construction/AG. Relevance: leverages our existing fleet IoT data; aligns with FY26 platform OKR.",
      avoidExample: "Generic dictionary definitions.",
    },
    sourcesAndCitations: {
      purpose: "Quality bar — reviewers verify sources.",
      expectedInput:
        "Bullet credible sources: report titles + dates, internal links, interview names + dates.",
      exampleValue:
        "- IBISWorld Equip Rental US, Mar 2026.\n- Interviews: 3 customers (Apr 2026).\n- Internal: AR-DSO dashboard Q1 2026.",
      avoidExample: "Vague citations like “various sources.”",
    },
    marketAnalysis: {
      purpose: "Size, growth, segmentation, demand trends.",
      expectedInput:
        "TAM/SAM/SOM (if available), top segments, growth drivers, customer profiles.",
      exampleValue:
        "TAM $12B (NA equipment rental SaaS). SAM $4.2B (heavy equipment). SOM $400M (Midwest+South). Growth driver: fleet IoT adoption.",
      avoidExample: "“The market is big.” — quantify.",
    },
    competitiveAnalysis: {
      purpose: "Major players, share, strategies, strengths/weaknesses.",
      expectedInput:
        "Top 3–6 competitors with share, key strengths, gaps, and our differentiation.",
      exampleValue:
        "RentalPro (18%): strong but no SAP connector. Equipify (14%): vertical breadth, weak billing. Our edge: SAP-native + heavy equipment specialization.",
      avoidExample: "Listing competitors without differentiation analysis.",
    },
    futureOutlook: {
      purpose: "Forecast direction + implication for players.",
      expectedInput: "3–5 year outlook + implications.",
      exampleValue:
        "By 2029, expect 60% rental SaaS to integrate IoT + payments. Implication: must ship native IoT ingestion by FY27.",
      avoidExample: "Pure speculation without basis.",
    },
    swotAnalysis: {
      purpose: "Structured strengths/weaknesses/opportunities/threats.",
      expectedInput: "List 2–4 items per quadrant; tie to strategy.",
      exampleValue:
        "S: SAP expertise, IoT data. W: no rental domain history. O: vertical heavy-equipment gap. T: RentalPro acquiring a payment startup.",
      avoidExample: "Single-word items — write tied-to-strategy items.",
    },
    trendsAndChallenges: {
      purpose: "Drivers + pressures shaping the field.",
      expectedInput:
        "Top 3–5 drivers (tech, ESG, AI…) + top 3–5 challenges (talent, supply chain, regulation…).",
      exampleValue:
        "Drivers: IoT, AI demand forecasting, integrated payments. Challenges: data integration cost, mid-market budget pressure, EPA reporting.",
      avoidExample: "Trends that don’t apply to your field.",
    },
    potentialGrowthAreas: {
      purpose: "Where the org could expand within the field.",
      expectedInput: "Concrete growth bets + supporting technique.",
      exampleValue:
        "Predictive maintenance add-on (workshops + AR feedback) — adds ~$1.2k ARPU.",
      avoidExample: "Generic ‘grow revenue’ statements.",
    },
    recommendations: {
      purpose: "Action-oriented, prioritized, measurable, risk-aware.",
      expectedInput:
        "Numbered list. Each rec ties to evidence above + a measurable signal.",
      exampleValue:
        "1) Enter via heavy-equipment billing portal (proven pain, fits SAP edge). 2) Defer EU expansion 18 months (data residency cost). 3) Add IoT-based usage billing in Year 2.",
      avoidExample: "Open-ended recs without prioritization.",
    },
    conclusion: {
      purpose: "Restates conclusions + flags decisions needed.",
      expectedInput: "2–4 sentences naming the decisions the reader must make next.",
      exampleValue:
        "Field is attractive and reachable. Decisions for Portfolio Council: approve heavy-equipment entry; fund A-3.2 Feasibility; defer EU.",
      avoidExample: "Restating only findings, no decision asks.",
    },
    financialAnalysisSubset: {
      purpose:
        "Quantitative financial view where public/internal data exists. Required to write ‘N/A’ explicitly when not used.",
      expectedInput:
        "Ratios, benchmarks, peer trends. If skipped, write ‘N/A — reason’.",
      exampleValue:
        "Competitor peer EV/Revenue 4.2x avg; our internal AR-DSO baseline 38 days. N/A on direct financials (private competitors).",
      avoidExample: "Leaving blank — must say N/A with reason if not used.",
    },
    documentStatus: {
      purpose: "State of THIS report.",
      expectedInput: "Draft → Submitted → Approved or Returned.",
      exampleValue: "Submitted",
      avoidExample: "Marking Approved before reviewer sign-off.",
    },
  },

  "A-3.3": {
    executiveSummary: {
      purpose: "The funding ask in one paragraph. Most leaders read only this.",
      expectedInput:
        "4–8 sentences: what + why + cost + benefit + recommendation + ask.",
      exampleValue:
        "We propose funding the Heavy Equipment Billing Engine for $580k over 5 months. Today AR loses $280k/yr to disputes and late pay. The portal reduces cycle 10d→2d, disputes 18%→5%. Payback ~14 months, 3-yr ROI 2.1×. Recommend proceed to Requirements (G5) with conditions on SAP integration.",
      avoidExample: "Just a description with no ask.",
    },
    strategicAlignment: {
      purpose: "Ties to portfolio strategy. Without this, sponsors disengage.",
      expectedInput: "Name the specific OKR/strategy/board priority this supports.",
      exampleValue:
        "Directly supports FY26 OKR ‘increase rental revenue per asset by 12%’ and Board priority on operational margin.",
      avoidExample: "“Aligns with strategy.” — name what.",
    },
    expectedBenefits: {
      purpose: "Quantified case for the funding.",
      expectedInput:
        "Revenue, savings, risk reduction, productivity, CX, compliance. Numbers + basis.",
      exampleValue:
        "$200k/yr AR savings; $80k/yr late-pay interest avoided; dispute rate 18%→5%; NPS +8 pts (basis: AR ops baseline + benchmark).",
      avoidExample: "Round numbers without basis.",
    },
    expectedCostsInvestment: {
      purpose: "Full delivery + ops cost picture.",
      expectedInput:
        "People, infra, vendor, licenses, support, maintenance, change-management.",
      exampleValue:
        "People $380k; infra $30k; Stripe + SAP partner $50–200k; training $20k; first-year support 0.3 FTE.",
      avoidExample: "Just a single $ number.",
    },
    roiPaybackScenarioSummary: {
      purpose: "Economic viability signal.",
      expectedInput: "Payback period + 3-yr ROI + best/worst-case bands.",
      exampleValue:
        "Payback 14 months (10–18 worst case); 3-yr ROI 2.1× (1.3× worst case).",
    },
    forecastReferenceA5: {
      purpose:
        "Links to A-5 financial forecast (when economic viability depends on a model).",
      expectedInput: "A-5 artifact reference or 'N/A — basis used: …'.",
      exampleValue: "A-5 FCT-0001 — Rental Billing 3-yr forecast",
      avoidExample: "Leaving blank when ROI depends on forward-looking model.",
    },
    majorRisks: {
      purpose:
        "Risks worth surfacing to sponsors at funding time (aligned with feasibility).",
      expectedInput: "Top 3–5 risks with brief impact each.",
      exampleValue:
        "1) SAP S/4 timing. 2) PCI scope creep. 3) AR adoption resistance. 4) Holiday capacity squeeze.",
    },
    riskMitigations: {
      purpose: "Mitigations sponsors can hold the team accountable to.",
      expectedInput: "1:1 mitigation per risk, with named owner where required.",
      exampleValue:
        "1) Parallel SAP spike (BE Lead, Jul). 2) PCI memo (Legal, Aug). 3) AR change champion (Product). 4) Front-load Aug/Sep capacity.",
    },
    constraints: {
      purpose: "Hard limits sponsors must accept.",
      expectedInput:
        "Funding, capacity, vendor, security/privacy/compliance, integration, timeline.",
      exampleValue:
        "Cap $650k; must reuse existing SAP; must hit GA before Dec 15 SOX freeze.",
    },
    dependencies: {
      purpose: "External dependencies that condition the case.",
      expectedInput: "List deps + their dates.",
      exampleValue:
        "SAP S/4 upgrade (lands 2026-09-01); Stripe Connect MSA signed; Legal review on PII.",
    },
    prcsExistingProductId: {
      purpose: "Links the business case to a current PRD.",
      expectedInput: "PRD-XXX or N/A.",
      exampleValue: "PRD-042",
    },
    prcsCandidateApprovedProductId: {
      purpose: "Candidate PRD if this creates a new product.",
      expectedInput: "Proposed PRD-XXX or N/A.",
      exampleValue: "PRD-058 (proposed)",
    },
    prcsPclCode: {
      purpose: "PRCS classification candidate.",
      expectedInput: "PCL-L.D.E.C.",
      exampleValue: "PCL-3.1.3.2",
    },
    prcsCriticalityTier: {
      purpose: "Criticality digit explanation (last part of PCL).",
      expectedInput: "Low/Medium/High/Regulated/Safety-Critical.",
      exampleValue: "High",
    },
    prcsDomainTags: {
      purpose: "PRCS domain tags for portfolio analytics.",
      expectedInput: "Comma-separated controlled-vocab tags.",
      exampleValue: "Finance, Commerce, Operations",
    },
    prcsFunctionDescriptors: {
      purpose: "Functional descriptors for the candidate product.",
      expectedInput: "Comma-separated functions, or N/A.",
      exampleValue: "Billing, Rental, Customer Portal",
    },
    prcsWorkTypeTags: {
      purpose: "PRCS Layer-2 work type tags (for cross-cutting work).",
      expectedInput: "Work type codes or N/A.",
      exampleValue: "AP-RS, IN",
    },
    prcsNonApplicabilityRationale: {
      purpose: "Documents PRCS items that don't apply and WHY.",
      expectedInput: "Items + rationale, or N/A.",
      exampleValue: "N/A — all PRCS facets apply.",
    },
    prcsDownstreamStandardsTieringImpact: {
      purpose: "How PCL drives downstream standards (security, data, SLA).",
      expectedInput: "Impact on Standards 2.1, 3.3, 4.6, 5.7, etc.",
      exampleValue:
        "High criticality → SOC2 in-scope; SLA target 99.9%; mandatory architecture review.",
    },
    businessRecommendation: {
      purpose: "Headline G4 recommendation tied to the funding decision.",
      expectedInput: "Pick the closest match.",
      exampleValue: "Proceed to Requirements with Conditions",
    },
    businessRecommendationRationale: {
      purpose: "Why this recommendation fits the evidence + case.",
      expectedInput: "3–5 sentences tying recommendation to top benefits/risks.",
      exampleValue:
        "Quantified benefits and clear strategic fit justify funding. Conditions address SAP timing risk before significant build investment. Pivot/Defer would carry $280k/yr ongoing pain.",
    },
    conditionsIfAny: {
      purpose:
        "Required if recommendation is Conditional — what must be true before next phase.",
      expectedInput: "Specific conditions, or 'None'.",
      exampleValue:
        "1) SAP integration spike completed before A-1 CRS. 2) Legal PII memo before A-7 stakeholder phase.",
    },
    conditionOwners: {
      purpose: "Who's accountable for each condition.",
      expectedInput: "1:1 owner per condition, or N/A.",
      exampleValue: "1) BE Lead (R. Patel). 2) DPO (S. Khan).",
    },
    conditionDueDates: {
      purpose: "When each condition must be satisfied.",
      expectedInput: "1:1 date per condition, or N/A.",
      exampleValue: "1) 2026-08-01. 2) 2026-08-15.",
    },
    approvedBy: {
      purpose: "Name of the G4 approver.",
      expectedInput: "Full name.",
      exampleValue: "Jordan Okonkwo",
    },
    approverRoleAuthority: {
      purpose: "Role/authority granting approval.",
      expectedInput: "Their role in the decision.",
      exampleValue: "Portfolio Council Chair",
    },
    approvalDate: {
      purpose: "Locks the G4 approval date.",
      expectedInput: "Approval date.",
      exampleValue: "2026-06-12",
      validationRule: "Format: YYYY-MM-DD.",
    },
    approvalDecisionNotes: {
      purpose: "Decision detail — conditions, dissent, follow-ups.",
      expectedInput: "1–4 sentences.",
      exampleValue:
        "Approved with conditions. Reconfirm SAP integration cost band before CRS kickoff.",
    },
  },

  "A-1": {
    packageTitle: {
      purpose: "Names the CRS package — appears in registries and approvals.",
      expectedInput: "5–10 words including product/initiative + 'CRS'.",
      exampleValue: "Heavy Equipment Billing Engine — CRS v1",
      avoidExample: "“CRS doc.” — won’t scan in a list.",
    },
    crsIntroduction: {
      purpose:
        "Frames the requirements: scope, audience, source artifacts, and how to read this CRS.",
      expectedInput:
        "3–6 sentences. Reference upstream A-0/A-0.1/A-3.x artifacts.",
      exampleValue:
        "This CRS captures customer-side requirements for the Heavy Equipment Billing Engine, building on PROB-0001 and approved Feasibility/Business Case (G4). Audience: product, engineering, AR ops. Each statement is owned by the named requirement owner.",
      avoidExample: "Just copying the project description.",
    },
    crsRows: {
      purpose:
        "Captures the stakeholder-voiced requirements (the WHAT, not the HOW). One row per atomic requirement.",
      expectedInput:
        "Use the workspace to add rows. Each row should be testable. Numbering is auto.",
      exampleValue:
        "Title: ‘Self-serve invoice access’ — Statement: ‘AR customers can view, download, and request corrections on invoices via a secure portal, 24/7, without phoning AR.’",
      avoidExample:
        "Solution-oriented titles like ‘Build React invoice page.’ — that’s SRS work, not CRS.",
    },
    documentStatus: {
      purpose: "State of THIS CRS document.",
      expectedInput: "Draft while writing; Approved only after sign-off.",
      exampleValue: "Approved",
    },
  },

  "A-2": {
    srsTitle: {
      purpose: "Names the SRS document.",
      expectedInput: "Initiative/product + 'SRS' + version.",
      exampleValue: "Heavy Equipment Billing Engine — SRS v1",
    },
    srsIntroduction: {
      purpose:
        "Frames the engineering requirements: scope, source CRS, conventions, and out-of-scope notes.",
      expectedInput:
        "3–6 sentences. Reference the parent CRS by ID. State assumption set.",
      exampleValue:
        "This SRS translates the CRS package CRS-0001 into engineering requirements. FR rows are testable functional behaviors; NFR rows record measurable non-functional constraints. SAP integration details live in the API contract (A-12).",
    },
    srsRows: {
      purpose:
        "Captures atomic functional and non-functional requirements. Each row should map to ≥1 CRS row.",
      expectedInput:
        "Add via workspace. Title is a stable label; Body is testable; Verification states how it’ll be verified; Parent CRS IDs trace it back.",
      exampleValue:
        "FR — ‘Authenticated customer portal session’ — Body: ‘System MUST authenticate customer via SSO/magic-link before any invoice data is rendered.’ Verification: Integration test (auth-bypass attempts return 403). Parents: CRS-001, CRS-002.",
      avoidExample:
        "Vague rows like ‘Make it secure.’ — must be testable + traced.",
    },
    documentStatus: {
      purpose: "State of THIS SRS.",
      expectedInput: "Draft → Approved after review.",
      exampleValue: "Draft",
    },
  },

  "A-7": {
    inventoryTitle: {
      purpose: "Names this stakeholder inventory.",
      expectedInput: "Initiative + ‘Stakeholder Inventory’.",
      exampleValue: "Heavy Equipment Billing — Stakeholder Inventory v1",
    },
    stakeholdersSummary: {
      purpose: "Executive view of WHO is involved + WHY.",
      expectedInput: "3–6 sentences naming groups + their interest.",
      exampleValue:
        "Internal: AR ops (use daily), Finance (consumes data), Platform Eng (own system). External: rental customers (primary users), Stripe (payments vendor), SAP partner (integration).",
    },
    primaryPersonas: {
      purpose: "Concrete user archetypes that drive UX + scope decisions.",
      expectedInput: "2–4 named personas with goal + frustration + needs.",
      exampleValue:
        "1) ‘Sara, AR Lead’: reconciles 120 invoices/wk; frustrated by SAP exports; needs single source of truth.\n2) ‘Mike, Fleet Customer’: rents 12 machines/month; wants self-serve invoice access.",
      avoidExample: "Demographic-only descriptions without goals/frustrations.",
    },
    secondaryUsers: {
      purpose: "Non-primary user groups whose needs matter.",
      expectedInput: "Lighter detail than primary; or leave empty.",
      exampleValue: "Finance close team; auditors; customer success team.",
    },
    decisionMakers: {
      purpose: "Who approves/rejects/funds this work — required for G5.",
      expectedInput: "Named individuals + role/authority + decision area.",
      exampleValue:
        "Jordan Okonkwo (Portfolio Chair) — gate decisions; Lin Wei (CTO) — architecture; Sara Khan (DPO) — privacy/PII.",
    },
    communicationNotes: {
      purpose: "Cadence + channels + audiences. Sets expectations.",
      expectedInput: "Who hears what, how often, by what channel.",
      exampleValue:
        "Weekly status to sponsor (email); bi-weekly demo to AR ops; monthly portfolio update; PagerDuty for SEV-1.",
    },
    authorityMatrix: {
      purpose: "RACI/RACED-style mapping of decisions to people.",
      expectedInput:
        "Per decision area: Responsible/Accountable/Consulted/Informed.",
      exampleValue:
        "Scope: A=Product Owner, R=BA, C=Eng Lead, I=Sponsor.\nArchitecture: A=Eng Lead, R=Senior Eng, C=CTO, I=Product.",
    },
    supportModelNotes: {
      purpose: "Post-launch support model (optional but recommended).",
      expectedInput: "Tier model + owners + SLAs.",
      exampleValue: "T1 Customer success; T2 AR ops; T3 Platform Eng. SLA tier-2.",
    },
    documentStatus: {
      purpose: "State of THIS stakeholder inventory.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-8": {
    packageTitle: {
      purpose: "Names the requirements package.",
      expectedInput: "Initiative + ‘Requirements Package’ + version.",
      exampleValue: "Heavy Equipment Billing — Requirements Package v1",
    },
    packageOverview: {
      purpose:
        "Standalone executive view tying CRS/SRS/NFR/Stakeholder/Features together.",
      expectedInput:
        "4–8 sentences explaining what's in the package, scope, audience, and decision asks.",
      exampleValue:
        "This package consolidates the customer-side CRS (CRS-0001), engineering SRS (SRS-0001), NFR register (NFR-0001), stakeholder inventory (STK-0001), and feature inventory (FEAT-0001) for the Billing Engine. Ready for G5 review. Open items: Stripe Connect compliance scope (in flight with Legal).",
      avoidExample: "Just listing artifact IDs without narrative.",
    },
    crsReferenceNotes: {
      purpose: "Pointer + summary for the CRS artifact in this package.",
      expectedInput: "CRS artifact ID + statement count + version note.",
      exampleValue: "CRS-0001 v1 (32 statements; approved 2026-08-22).",
    },
    srsReferenceNotes: {
      purpose: "Pointer + summary for the SRS artifact.",
      expectedInput: "SRS artifact ID + counts (FR + NFR rows) + version.",
      exampleValue: "SRS-0001 v1 (58 FR, 14 NFR; draft).",
    },
    nfrReferenceNotes: {
      purpose: "Pointer for the dedicated NFR register (if separate from SRS NFRs).",
      expectedInput: "NFR artifact ID + count + scope.",
      exampleValue: "NFR-0001 v1 (12 NFR records; covers perf, security, audit).",
    },
    stakeholderReferenceNotes: {
      purpose: "Pointer to A-7 stakeholder profile.",
      expectedInput: "STK artifact ID + version.",
      exampleValue: "STK-0001 v1 (8 personas; approved).",
    },
    traceabilitySeedNotes: {
      purpose:
        "Seeds the CRS↔SRS↔Features traceability — vital for G5 readiness and SOC2 audit trail.",
      expectedInput:
        "Coverage statement + outline of trace links (each CRS row → SRS rows → features). Note any gaps.",
      exampleValue:
        "All 32 CRS rows have ≥1 SRS row. 30/32 CRS rows have ≥1 feature. Gaps: CRS-019 and CRS-024 await feature assignment.",
      avoidExample: "“Traceability done.” — show coverage stats.",
    },
    approvalRecord: {
      purpose: "Captures the G5 approval state of this package.",
      expectedInput: "Approver + role + date + decision summary.",
      exampleValue:
        "Approved 2026-08-29 by Jordan Okonkwo (Portfolio Chair). Conditions: close 2 traceability gaps before A-12.",
    },
    documentStatus: {
      purpose: "State of THIS package.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-9": {
    inventoryTitle: {
      purpose: "Names the feature inventory.",
      expectedInput: "Initiative + ‘Feature Inventory’ + version.",
      exampleValue: "Heavy Equipment Billing — Feature Inventory v1",
    },
    inventoryIntro: {
      purpose:
        "Frames the inventory: how features map to CRS/SRS, prioritization model, and audience.",
      expectedInput:
        "3–5 sentences. Reference prioritization (MoSCoW here) + linking rules.",
      exampleValue:
        "Features link to CRS/SRS rows via local IDs. Prioritization uses MoSCoW. ‘Must’ = required for GA. ‘Should/Could’ = post-GA. ‘Wont’ = explicitly out of scope.",
    },
    featureRows: {
      purpose:
        "The feature backlog. Each row should be specific enough to estimate.",
      expectedInput:
        "Add via workspace. Title is short + recognizable. Description ≥1 sentence. Priority via MoSCoW. Link to CRS/SRS/NFR IDs for traceability.",
      exampleValue:
        "Title: ‘Self-serve invoice view’ — Description: ‘Authenticated customer can list invoices, filter by date/status, download PDF.’ Priority: Must. Links: CRS-001, CRS-005, SRS-FR-014.",
      avoidExample:
        "Title-only features without linked requirements — breaks traceability.",
    },
    documentStatus: {
      purpose: "State of THIS feature inventory.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Draft",
    },
  },

  "A-10": {
    registerTitle: {
      purpose: "Names the NFR register.",
      expectedInput: "Initiative + ‘NFR Register’ + version.",
      exampleValue: "Heavy Equipment Billing — NFR Register v1",
    },
    registerIntroduction: {
      purpose:
        "Frames the NFR register: which quality dimensions are covered + how each is verified.",
      expectedInput:
        "3–5 sentences. Reference the quality framework (e.g. ISO 25010) if used.",
      exampleValue:
        "NFRs cover performance, security, availability, observability, maintainability, accessibility. Verification methods include automated tests, monitoring SLOs, and audit. Aligned with ISO 25010.",
    },
    nfrRows: {
      purpose:
        "Atomic non-functional requirements. Each must be measurable and verifiable.",
      expectedInput:
        "Add via workspace. Dimension = ISO 25010 category. Title = stable label. Body = measurable target. Verification = how it’s tested/monitored.",
      exampleValue:
        "Dimension: Performance. Title: ‘Portal p95 latency’. Body: ‘System MUST serve invoice list page at p95 <500ms under 200 concurrent users.’ Verification: Load test + production SLO alert.",
      avoidExample: "Vague NFRs like ‘Be fast.’ — must be measurable.",
    },
    documentStatus: {
      purpose: "State of THIS NFR register.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-6": {
    scopeTitle: {
      purpose: "Names the scope document.",
      expectedInput: "Initiative + ‘Scope’ + version.",
      exampleValue: "Heavy Equipment Billing — Scope v1",
    },
    inScopeSummary: {
      purpose:
        "Defines what IS included. Reviewers will hold the team to this.",
      expectedInput:
        "Bullet list of capabilities/areas in scope. Be specific (which users, which workflows).",
      exampleValue:
        "- Customer portal (auth, list invoices, view PDF, request correction).\n- AR admin (review corrections, approve/reject, audit log).\n- SAP integration (read-only invoice + customer master data).\n- Stripe payment integration (one-time + saved card).",
      avoidExample: "“Everything in the CRS.” — be explicit.",
    },
    outOfScopeSummary: {
      purpose:
        "Defines what is NOT included. Prevents scope creep at review time.",
      expectedInput: "Bullet list of capabilities deliberately excluded.",
      exampleValue:
        "- Multi-currency support.\n- Sales tax engine (Avalara) — uses SAP-calc only.\n- Mobile app (web only at GA).\n- Subscription/recurring billing.",
    },
    deferrals: {
      purpose:
        "Items intentionally deferred to a later release. Different from out-of-scope: deferrals are planned.",
      expectedInput: "Bullet list with target release/version.",
      exampleValue:
        "Deferred to v2: bulk download, saved filters, customer-facing reporting dashboards.",
    },
    assumptions: {
      purpose: "What the scope assumes — to be validated.",
      expectedInput: "2–6 assumptions, honest about uncertainty.",
      exampleValue:
        "SAP S/4 upgrade lands by Sep 1; AR team has Q3 capacity; rental customers tolerate portal-only flow.",
    },
    constraints: {
      purpose: "Hard limits the team must respect.",
      expectedInput: "Funding, timeline, regulatory, technical caps.",
      exampleValue:
        "Cap $650k; GA before Dec 15 SOX freeze; must reuse existing SAP integration patterns.",
    },
    dependencies: {
      purpose: "Things outside the team that the scope depends on.",
      expectedInput: "Concrete deps + dates + owners.",
      exampleValue:
        "SAP S/4 upgrade (Sep 1 — SAP team); Stripe Connect signed MSA (in flight — Legal); Customer Success staffing (Oct 1 — CS Director).",
    },
    acceptanceBoundary: {
      purpose:
        "The line between ‘scope satisfied’ and ‘scope not satisfied’. Drives UAT.",
      expectedInput:
        "Bullet acceptance criteria at the system level — what reviewers will check at the end.",
      exampleValue:
        "GA criteria: all Must features delivered; SAP read/write integration verified end-to-end with 3 real customers; portal SLO met for 30 days; SOX audit log signed off.",
      avoidExample: "Open-ended phrasing — must be checkable.",
    },
    documentStatus: {
      purpose: "State of THIS scope document.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-11": {
    erdTitle: {
      purpose: "Names the ERD document.",
      expectedInput: "Initiative + ‘ERD’ + version.",
      exampleValue: "Heavy Equipment Billing — ERD v1",
    },
    erdIntroduction: {
      purpose:
        "Frames the data model: scope, conventions (naming, IDs, soft-delete), and external dependencies.",
      expectedInput:
        "3–5 sentences. Reference naming standard, soft-delete strategy, multi-tenant approach.",
      exampleValue:
        "Models customer-facing billing entities for the portal. Naming follows STD-NAM-001; all tenant tables include tenant_id and follow STD-DAT-004 isolation. Reads from SAP master data are mirrored via nightly sync.",
      avoidExample: "Just listing entity names — no narrative.",
    },
    erdRows: {
      purpose:
        "Entity rows. Each row is one table/aggregate. Reviewers will check for tenant_id + audit fields.",
      expectedInput:
        "Add via workspace. Entity name + attributes + relationships + keys/constraints + classification/retention.",
      exampleValue:
        "Entity: ‘Invoice’. Attributes: id (CC-PID), tenant_id, customer_id, sap_invoice_number, total_cents, currency, status, created_at, deleted_at. Relationships: Invoice belongs_to Customer. Keys: unique(tenant_id, sap_invoice_number). Classification: CON (PII via customer link). Retention: 7y per STD-DAT-001.",
      avoidExample:
        "Entity rows without tenant_id or classification — won’t pass G7 review.",
    },
    documentStatus: {
      purpose: "State of THIS ERD.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Draft",
    },
  },

  "A-12": {
    contractTitle: {
      purpose: "Names the API contract document.",
      expectedInput: "Initiative + ‘API Contract’ + version.",
      exampleValue: "Heavy Equipment Billing — API Contract v1",
    },
    contractIntro: {
      purpose:
        "Frames the contract: API base URL, authentication model, rate-limit policy, idempotency, error envelope.",
      expectedInput:
        "3–6 sentences. Reference STD-ENG-002 API design standard.",
      exampleValue:
        "REST + JSON over HTTPS. Base: /v1. Auth: OAuth2 client-credentials (B2B) and short-lived JWT (customer portal). Idempotency-Key on all POSTs. Pagination via cursor. Error envelope: { code, message, request_id }.",
    },
    versioningNotes: {
      purpose: "How versioning works for this API (required by STD-ENG-002).",
      expectedInput:
        "URL/header strategy + breaking-change policy + deprecation timeline.",
      exampleValue:
        "URL prefix /v{N}. Breaking changes require new major version. Deprecation notice: 90 days minimum; Sunset header; CHANGELOG entries in /docs.",
    },
    apiRows: {
      purpose:
        "API operations. Each row is one endpoint. Reviewers will check auth + error model + idempotency on writes.",
      expectedInput:
        "Add via workspace. Op ID + method + path + request + response + auth/scopes + error model.",
      exampleValue:
        "Op: ‘invoices.list’. Method: GET /v1/invoices. Request: query params (cursor, status, date_range). Response: { items: Invoice[], next_cursor }. Auth: scope=invoices:read. Errors: 401 unauthenticated, 403 forbidden, 429 rate-limited.",
      avoidExample:
        "Endpoints without auth/scope or error model — incomplete contract.",
    },
    documentStatus: {
      purpose: "State of THIS contract.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Draft",
    },
  },

  "ARD-001": {
    documentTitle: {
      purpose: "Names the architecture design document (ARD).",
      expectedInput: "Initiative + ‘Architecture’ + version.",
      exampleValue: "Heavy Equipment Billing — Architecture v1",
    },
    executiveSummary: {
      purpose:
        "Standalone view of the architecture for ARB / reviewers.",
      expectedInput:
        "4–8 sentences: domain, key components, integration points, key decisions, key risks.",
      exampleValue:
        "Two-tier web app: Next.js portal + Node billing service backed by Postgres. Integrates SAP (read-only OData) and Stripe (Connect). Key decisions: BFF pattern in portal, event-driven AR correction workflow, KMS-backed PCI tokenization. Key risks: SAP rate-limit, Stripe scope.",
      avoidExample: "Reading like a code review — keep it architectural.",
    },
    contextDiagramMermaid: {
      purpose:
        "C4 Level 1: the system in its environment (users + external systems).",
      expectedInput:
        "Mermaid `flowchart` block. Show users, our system, and external systems. Use → for direction.",
      exampleValue:
        "flowchart LR\n  customer[Rental Customer] -->|browser| portal[Billing Portal]\n  arOps[AR Ops] -->|browser| portal\n  portal --> sap[SAP S/4]\n  portal --> stripe[Stripe Connect]\n  portal --> idp[Okta SSO]",
      avoidExample: "Class-level diagrams — context = level 1.",
    },
    containerDiagramMermaid: {
      purpose:
        "C4 Level 2: containers inside the system (apps, services, DBs, queues).",
      expectedInput:
        "Mermaid flowchart showing internal containers + protocols.",
      exampleValue:
        "flowchart LR\n  web[Next.js Portal\\nNode] -->|REST/JSON| api[Billing API\\nNode]\n  api -->|SQL| db[(Postgres)]\n  api -->|OData| sap[SAP S/4]\n  api -->|HTTPS| stripe[Stripe Connect]\n  api -->|events| q[Redis Streams]",
    },
    componentOverview: {
      purpose:
        "C4 Level 3: components inside each container. Reviewers use this to plan modules.",
      expectedInput:
        "Per container: 3–6 components with one-line responsibility.",
      exampleValue:
        "Billing API: AuthMiddleware, TenantContext, InvoiceRouter, CorrectionWorkflow, SapAdapter, StripeAdapter, AuditWriter.",
    },
    dataFlowNotes: {
      purpose:
        "How data moves through the system — critical for security review.",
      expectedInput:
        "Step-by-step write path + read path. Note PII boundaries + encryption.",
      exampleValue:
        "Read: portal → API (JWT) → Postgres (RLS by tenant) → render. Write (correction): portal → API → write Postgres → emit event → SAP adapter → SAP. PII never leaves Confidential boundary; payment tokens only via Stripe.",
    },
    adrRows: {
      purpose:
        "Embedded ADRs that capture material decisions. Each ADR is auditable.",
      expectedInput:
        "Add via workspace. Title + Decision + Status (Proposed/Accepted/Superseded).",
      exampleValue:
        "ADR: ‘BFF in portal instead of direct API calls’. Decision: portal renders via BFF endpoints in Next.js to keep secrets server-side. Status: Accepted.",
    },
    deviationsNotes: {
      purpose: "Records intentional deviations from standards.",
      expectedInput: "Standard + deviation + rationale + expiry. Or ‘None’.",
      exampleValue:
        "STD-ENG-002 §5.3: cursor pagination not implemented for /v1/invoices list (uses offset). Rationale: SAP-side OData limitation. Expiry: revisit when SAP upgrade ships.",
    },
    documentStatus: {
      purpose: "State of THIS ARD.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "UXD-001": {
    designTitle: {
      purpose: "Names the UI/UX design document.",
      expectedInput: "Initiative + ‘UI/UX’ + version.",
      exampleValue: "Heavy Equipment Billing — UI/UX v1",
    },
    goals: {
      purpose:
        "UX goals and principles guiding design decisions.",
      expectedInput:
        "Bullet 3–6 goals/principles tied to user outcomes.",
      exampleValue:
        "1) Customer reaches invoice in ≤2 clicks. 2) Mobile-friendly first.\n3) Plain-English copy. 4) Status visible at every step (no dead ends). 5) WCAG 2.1 AA.",
      avoidExample: "Generic ‘easy to use’ statements.",
    },
    informationArchitecture: {
      purpose: "Page hierarchy + navigation model.",
      expectedInput:
        "Tree of top-level sections + key sub-pages.",
      exampleValue:
        "Top-level: Dashboard, Invoices, Payments, Corrections, Help. Invoices → list, detail, corrections. Payments → list, methods.",
    },
    keyJourneys: {
      purpose:
        "Critical user journeys reviewers can validate against.",
      expectedInput:
        "2–5 named journeys with step-by-step.",
      exampleValue:
        "‘Customer pays invoice’: login → dashboard → invoice → Pay → enter card → confirm → receipt.\n‘AR clerk approves correction’: login → corrections queue → review → approve → audit log.",
    },
    componentInventory: {
      purpose:
        "Inventory of reusable UI components (drives design system + dev cost).",
      expectedInput:
        "List components + reuse/new + state.",
      exampleValue:
        "Reused: Button, Input, Modal, Toast, Table, FilterBar.\nNew: InvoiceCard, CorrectionForm, PaymentMethodPicker.",
    },
    documentStatus: {
      purpose: "State of THIS UI/UX doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Draft",
    },
  },

  "A-13": {
    planTitle: {
      purpose: "Names the module plan.",
      expectedInput: "Initiative + ‘Module Plan’ + version.",
      exampleValue: "Heavy Equipment Billing — Module Plan v1",
    },
    planIntroduction: {
      purpose:
        "Frames how the codebase is partitioned and why. Reviewers will check for clear boundaries.",
      expectedInput:
        "3–5 sentences. Reference architecture (ARD), naming standard, and language/framework conventions.",
      exampleValue:
        "Monorepo with two app packages (portal, api) and a shared package (contracts). Modules follow the ARD container split. Naming follows STD-NAM-001.",
    },
    namespaceNotes: {
      purpose:
        "Naming + namespace rules contributors must follow.",
      expectedInput:
        "Package prefix, file/folder conventions, public vs internal exports.",
      exampleValue:
        "Package prefix `@billing/`. Public APIs exported from `index.ts` only. Internal code under `_internal/`. Test files co-located as `*.test.ts`.",
    },
    moduleRows: {
      purpose:
        "Per-module rows. One row per top-level module/directory.",
      expectedInput:
        "Add via workspace. Module name + directory path + owner + interfaces/exports + test placement.",
      exampleValue:
        "Module: ‘invoices’. Path: `apps/api/src/invoices/`. Owner: BE Lead. Interfaces: `listInvoices`, `getInvoice`, `requestCorrection`. Tests: co-located `*.test.ts` + integration in `__tests__/integration/`.",
      avoidExample: "Module rows without owners — won’t hold under review.",
    },
    documentStatus: {
      purpose: "State of THIS module plan.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Draft",
    },
  },

  "A-14": {
    strategyTitle: {
      purpose: "Names the environment & delivery strategy.",
      expectedInput: "Initiative + ‘Env & Delivery Strategy’ + version.",
      exampleValue: "Heavy Equipment Billing — Env & Delivery v1",
    },
    environmentsOverview: {
      purpose:
        "Lists environments + their purpose, scope, and parity with prod.",
      expectedInput:
        "Per env (dev/stage/prod): purpose, data class, traffic, who has access.",
      exampleValue:
        "- dev: per-engineer; synthetic data only; full access.\n- stage: shared; subset of anon prod data; access via VPN + role.\n- prod: customer-facing; CON/RST data; access via break-glass only.",
    },
    branchingModel: {
      purpose: "Branching + merge policy contributors must follow.",
      expectedInput: "Model name + merge gates + branch protection rules.",
      exampleValue:
        "Trunk-based: short-lived feature branches; PR required; 1 approval; CI green; signed commits; squash merge to main.",
    },
    secretsManagement: {
      purpose:
        "Where secrets/config live and how rotation works (required by STD-SEC-005).",
      expectedInput:
        "Secret store + rotation + access model.",
      exampleValue:
        "AWS Secrets Manager (KMS-encrypted). Rotation: 90 days (auto) for service accts; manual for vendor keys. Access via IAM role + audit log.",
    },
    cicdOverview: {
      purpose: "CI/CD pipeline shape + gates.",
      expectedInput:
        "Stages + tools + quality gates + artifact signing.",
      exampleValue:
        "GitHub Actions: lint → unit → integration → build → SBOM + sign → deploy stage → smoke → manual promote → deploy prod (canary 5% → 50% → 100%).",
    },
    deploymentRollback: {
      purpose: "Deploy strategy + rollback path (required by STD-OPS-002).",
      expectedInput:
        "Deploy strategy + rollback steps + RTO target.",
      exampleValue:
        "Blue/green; rollback by swap to previous color (≤5 min). DB migrations forward-only; deprecated columns dropped after one minor version.",
    },
    observabilityHooks: {
      purpose:
        "How operations see the system (logs, metrics, traces, alerts).",
      expectedInput:
        "Tools + correlation IDs + alert routing (per STD-OPS-003).",
      exampleValue:
        "Datadog logs/metrics/traces. trace_id + request_id propagated. Alerts → PagerDuty for SEV-1/2; Slack for SEV-3.",
    },
    accessModelNotes: {
      purpose:
        "Who has access to which environment + how access is granted.",
      expectedInput:
        "Role → env access matrix; break-glass procedure.",
      exampleValue:
        "Engineers: dev full; stage read; prod via break-glass (approval + 24h auto-expire). SRE: stage/prod full with MFA.",
    },
    documentStatus: {
      purpose: "State of THIS strategy.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Draft",
    },
  },

  "A-15": {
    planTitle: {
      purpose: "Names the development plan.",
      expectedInput: "Initiative + ‘Dev Plan’ + version.",
      exampleValue: "Heavy Equipment Billing — Dev Plan v1",
    },
    deliveryApproach: {
      purpose:
        "How the team will deliver: methodology, ceremony cadence, team shape.",
      expectedInput:
        "3–5 sentences. Methodology + cadence + key ceremonies + team.",
      exampleValue:
        "2-week sprints; daily stand-up; bi-weekly demo to sponsor; monthly retro. Team: 5 eng, 1 BA, 0.5 designer. SRE on-call rotation from week 8.",
    },
    milestones: {
      purpose:
        "Major milestones reviewers can track to.",
      expectedInput:
        "Bullet 5–10 milestones with target dates + acceptance.",
      exampleValue:
        "M1 (Jul 30): walking skeleton (auth + invoice list).\nM2 (Sep 15): alpha (corrections workflow).\nM3 (Oct 31): beta (payments).\nM4 (Nov 30): GA.",
    },
    workBreakdownSummary: {
      purpose:
        "How features break down to executable work — driver of estimates.",
      expectedInput:
        "Epics + key stories; reference feature inventory (A-9).",
      exampleValue:
        "Epic ‘Customer auth’ (FEAT-001): 5 stories. Epic ‘Invoice viewing’ (FEAT-002): 8 stories. Epic ‘Correction workflow’ (FEAT-003): 12 stories. Epic ‘Payments’ (FEAT-004): 10 stories.",
    },
    risksBlockers: {
      purpose:
        "Top risks/blockers for delivery (separate from product risks).",
      expectedInput:
        "Top 2–5 risks with mitigation owner.",
      exampleValue:
        "1) Stripe Connect onboarding latency (Owner: BE Lead). 2) SAP dev tenant access (Owner: SAP team). 3) UX hire timing (Owner: PMO).",
    },
    definitionOfDone: {
      purpose:
        "The team’s shared bar for ‘done’. Reviewers will check work against this.",
      expectedInput:
        "Bullet criteria: code, tests, docs, observability, security, sign-offs.",
      exampleValue:
        "- Code reviewed + merged. Tests ≥80% line coverage on touched code.\n- API docs updated. Logs/metrics added.\n- Threat model item addressed (if any). Product approval on UAT.",
    },
    executionModelNotes: {
      purpose:
        "Optional notes on execution patterns (TD-001/HG-001 patterns, ADRs).",
      expectedInput: "Free text or N/A.",
      exampleValue:
        "Follows TD-001 ticket-driven flow. Uses HG-001 ‘happy path first’ pattern in iteration planning.",
    },
    documentStatus: {
      purpose: "State of THIS dev plan.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Draft",
    },
  },

  "M-10": {
    milestoneNotes: {
      purpose:
        "Records what happened at the Build Planning milestone (Phase 10). Used in audit & retro.",
      expectedInput:
        "Bullet: what was reviewed, decisions, risks raised, action items + owners + dates.",
      exampleValue:
        "- Reviewed module plan (A-13), env strategy (A-14), dev plan (A-15).\n- Decision: defer SAP integration to sprint 4.\n- Risk: Stripe Connect onboarding latency (Owner: BE Lead, by Jul 15).\n- Action: schedule arch review for SAP adapter (Owner: Eng Lead, by Jul 5).",
      avoidExample: "“Went well.” — capture decisions + actions.",
    },
    documentStatus: {
      purpose: "State of THIS milestone note.",
      expectedInput: "Draft → Approved after retro.",
      exampleValue: "Approved",
    },
  },

  "M-11": {
    milestoneNotes: {
      purpose:
        "Records the Implementation Readiness check (Phase 11). Confirms env, secrets, observability, and team are ready.",
      expectedInput:
        "Checklist or bullet: environments ready, CI/CD green, secrets rotated, observability hooks live, team on-call rotation set, exceptions noted.",
      exampleValue:
        "- Dev/stage envs provisioned; prod canary path validated.\n- CI green on main 7 days running.\n- Secrets rotated; KMS access verified.\n- Datadog dashboards live; PagerDuty rotation set.\n- 3 open exceptions logged (load test suite).",
      avoidExample: "“Ready.” — show the checklist.",
    },
    documentStatus: {
      purpose: "State of THIS readiness note.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "M-12": {
    milestoneNotes: {
      purpose:
        "Records the Build & Integrate milestone (Phase 12). Captures integration outcomes and remaining gaps before G9.",
      expectedInput:
        "Bullet: integration scope completed, integration issues + resolutions, perf/security findings, gaps remaining.",
      exampleValue:
        "- SAP read integration: working in stage; latency p95 380ms.\n- Stripe Connect: end-to-end tested with 2 sandbox merchants.\n- Issue: SAP rate limit at 300 req/min; mitigation: 250 req/min cap + retry-backoff (deployed).\n- Gap: bulk-correction workflow still missing (target: Nov 15).",
    },
    documentStatus: {
      purpose: "State of THIS milestone note.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-16": {
    executionSummary: {
      purpose:
        "Summarizes test strategy execution at G9. Reviewers use this to judge release readiness.",
      expectedInput:
        "Bullet: scope tested, environments, test types run, coverage achieved, pass rate, blockers found + dispositioned.",
      exampleValue:
        "Scope: all GA features (FEAT-001 to FEAT-014).\nEnvironments: stage with anon prod data.\nTests run: 240 unit (100% pass), 88 integration (98% pass), 12 e2e (100% pass), 1 load (passed @ 200 RPS), 1 security DAST (no high/crit).\nCoverage: lines 82%, branches 76%.\nBlockers: 2 SEV-3 dispositioned (see A-19).",
      avoidExample: "“All tests passed.” — show the numbers.",
    },
    documentStatus: {
      purpose: "State of THIS test strategy execution doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-17": {
    scenariosOutcome: {
      purpose:
        "Acceptance Test scenario outcomes — drives business sign-off (UAT).",
      expectedInput:
        "Per scenario: ID, title, owner, expected, actual, status (Pass/Fail/Blocked). Reference UAT artifact if separate.",
      exampleValue:
        "AT-001 ‘Customer pays invoice’ — Owner: Sara Chen — Expected: payment success + receipt. Actual: success. Status: Pass.\nAT-002 ‘AR approves correction’ — Owner: J. Nguyen — Expected: corrected invoice + audit log. Actual: success. Status: Pass.\nAT-003 ‘Bulk correction’ — Status: N/A (deferred per A-6 scope).",
    },
    documentStatus: {
      purpose: "State of THIS acceptance scenarios doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-18": {
    qaSummary: {
      purpose:
        "QA team’s overall judgment on quality. Distinct from A-16 (test execution) and A-17 (acceptance).",
      expectedInput:
        "QA lead’s narrative: quality assessment, exit criteria status, known risks, recommendation.",
      exampleValue:
        "Quality assessment: meets exit criteria. All blocker/critical defects closed. 3 SEV-3 defects with documented workarounds (see A-19). Performance and security scans within thresholds. Recommendation: Ship.",
    },
    documentStatus: {
      purpose: "State of THIS QA results doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-19": {
    bugDispositionSummary: {
      purpose:
        "Captures defects found + how each was dispositioned. Important for audit and release readiness.",
      expectedInput:
        "Per defect: ID, title, severity, status, disposition (fix/defer/wontfix), owner. Use ‘None’ if no defects.",
      exampleValue:
        "BUG-001 SAP rate limit — SEV-2 — Resolved (retry-backoff merged).\nBUG-002 invoice PDF download wrong filename — SEV-3 — Deferred to v1.1 (workaround: rename on save).\nBUG-003 a11y contrast issue — SEV-3 — Resolved (color updated).",
      avoidExample: "“Some bugs.” — list them with disposition.",
    },
    documentStatus: {
      purpose: "State of THIS bug disposition doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-20": {
    signOffNotes: {
      purpose:
        "Captures the final validation sign-off from product + QA + (where required) Security & Compliance.",
      expectedInput:
        "Per signatory: name, role, date, statement, conditions (if any).",
      exampleValue:
        "Product: Jamie Nguyen — Product Owner — 2026-11-28 — Approved.\nQA: Lee Park — QA Lead — 2026-11-28 — Approved (conditions: monitor SAP rate-limit alerts for 30 days).\nSecurity: Sara Khan — DPO — 2026-11-29 — Approved (PII scan clean).",
    },
    documentStatus: {
      purpose: "State of THIS sign-off doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-21": {
    readinessSummary: {
      purpose:
        "Release readiness checklist outcome — gates the G8 decision to release.",
      expectedInput:
        "Checklist form: code freeze, regression pass, perf/security scans clean, runbooks ready, on-call set, comms drafted, rollback rehearsed, sign-offs collected.",
      exampleValue:
        "- Code freeze 2026-11-20: PASS.\n- Regression: PASS (240/240).\n- Perf scan p95<500ms: PASS.\n- Security scan: PASS (no high/crit).\n- Runbooks: published.\n- On-call: assigned Nov 24–Dec 8.\n- Comms: drafts ready (A-24).\n- Rollback: rehearsed 2026-11-22.\n- Sign-offs: Product, QA, SRE.",
      avoidExample: "“Ready.” — show the checklist.",
    },
    documentStatus: {
      purpose: "State of THIS readiness checklist.",
      expectedInput: "Draft → Approved (G8 sign-off).",
      exampleValue: "Approved",
    },
  },

  "A-22": {
    documentSummary: {
      purpose:
        "Customer-facing release notes — what shipped, why it matters, what to expect.",
      expectedInput:
        "Sections: highlights (3–5 bullets), new features, fixes, known issues, upgrade notes (if any), links to docs.",
      exampleValue:
        "## Highlights\n- Self-serve invoice portal\n- Correction workflow\n## New\n- Invoice list/filter/download\n- Card-on-file payments\n## Fixes\n- 2 a11y improvements\n## Known issues\n- Bulk download deferred to v1.1",
      avoidExample: "Internal jargon or ticket IDs without context.",
    },
    documentStatus: {
      purpose: "State of THIS release notes doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-23": {
    documentSummary: {
      purpose:
        "Rollback plan — explicit, time-boxed steps to revert if release fails.",
      expectedInput:
        "Sections: trigger criteria, rollback steps, who executes, validation, communication, RTO target.",
      exampleValue:
        "Trigger: SEV-1 within 1 hr of deploy OR p99 >2s sustained 10 min.\nSteps: 1) swap blue/green to previous color. 2) verify portal up. 3) run smoke. 4) DB: no migration roll-back (forward-only).\nExecutor: SRE on-call.\nValidation: smoke green + manual sanity.\nComm: notify status page + sponsor email.\nRTO: <15 min.",
      avoidExample: "“Roll back if something breaks.” — define the trigger.",
    },
    documentStatus: {
      purpose: "State of THIS rollback plan.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-24": {
    documentSummary: {
      purpose:
        "Communications plan around release — internal + external audiences with timing.",
      expectedInput:
        "Per audience: channel, message, owner, timing, success signal.",
      exampleValue:
        "Customers: in-app banner + email — T-1d, day-of, T+1d (Owner: PMM).\nInternal: Slack #releases + AR ops standup (Owner: Eng Lead).\nSupport: training delivered (Owner: CS Lead).\nSuccess signal: <10 support tickets in first 48h.",
    },
    documentStatus: {
      purpose: "State of THIS comms plan.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-25": {
    documentSummary: {
      purpose:
        "Operational readiness review — confirms ops can actually run the system.",
      expectedInput:
        "Checklist: monitoring dashboards live, alerts routed, runbooks complete, on-call training done, support team ready, capacity planned, SLOs documented.",
      exampleValue:
        "- Dashboards: 4 in Datadog.\n- Alerts: SEV-1/2 to PagerDuty.\n- Runbooks: 6 scenarios.\n- On-call: 5 engineers trained.\n- Support: T1/T2 ready; SOPs published.\n- Capacity: 4× headroom at peak load.\n- SLOs: 99.9% / p95<500ms documented.",
    },
    documentStatus: {
      purpose: "State of THIS ops readiness doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-26": {
    documentSummary: {
      purpose:
        "Final release sign-off record — names + dates + statements + conditions.",
      expectedInput:
        "Per signatory: name, role, date, statement, conditions (if any).",
      exampleValue:
        "Product: J. Nguyen — Product Owner — 2026-11-28 — Approved.\nEng: L. Wei — CTO — 2026-11-28 — Approved.\nSecurity: S. Khan — DPO — 2026-11-28 — Approved.\nOps/SRE: M. Park — SRE Lead — 2026-11-28 — Approved (conditions: monitor SAP rate-limit 30d).",
    },
    documentStatus: {
      purpose: "State of THIS sign-off record.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-27": {
    deploymentSummary: {
      purpose:
        "Deployment checklist outcome — gates the G9 decision to deploy.",
      expectedInput:
        "Per pre-deploy step: status. Include change ticket, scheduling, freeze window, comms, dry-run, post-deploy verification plan.",
      exampleValue:
        "- Change ticket CHG-2412: approved.\n- Window: 2026-11-30 22:00 UTC.\n- Freeze: respected (SOX OK).\n- Comms: sent 24h + 1h prior.\n- Dry-run on stage: passed 2026-11-29.\n- Verification: smoke + canary monitoring 30 min.",
    },
    documentStatus: {
      purpose: "State of THIS deployment checklist.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-28": {
    documentSummary: {
      purpose:
        "Step-by-step deployment runbook for the on-call engineer.",
      expectedInput:
        "Numbered steps: pre-flight, deploy commands, verification, rollback trigger, post-deploy. Include exact commands/links.",
      exampleValue:
        "1. Pre-flight: confirm CI green on tagged release. (link)\n2. Run `deploy --color green --tag v1.0.0`.\n3. Verify health: portal /healthz returns 200, p95<500ms.\n4. Swap traffic: `traffic-shift green 100%`.\n5. Watch dashboard 30 min.\n6. If SEV-1: see rollback (A-23).",
      avoidExample: "Prose descriptions — runbooks are step-by-step.",
    },
    documentStatus: {
      purpose: "State of THIS runbook.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-29": {
    documentSummary: {
      purpose:
        "Post-deploy smoke test outcomes — confirms the release is healthy in production.",
      expectedInput:
        "Per smoke check: name, expected, actual, status, time. Include duration of post-deploy watch.",
      exampleValue:
        "Smoke (auto, 6 checks): all PASS at 22:14 UTC.\nManual smoke (3 user flows): all PASS.\nWatch period: 30 min — no alerts; p95 420ms.",
    },
    documentStatus: {
      purpose: "State of THIS smoke test record.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-30": {
    documentSummary: {
      purpose:
        "Monitoring & alerting cutover — confirms monitoring is live for the new release.",
      expectedInput:
        "Checklist: dashboards switched to new build labels, alerts routed, baseline thresholds tuned, deprecation of old alerts.",
      exampleValue:
        "- Dashboard ‘Billing prod v1’ active.\n- Alerts re-routed to PagerDuty billing-prod escalation.\n- Baselines tuned (latency, error rate, SAP integration health).\n- Old v0 alerts archived.",
    },
    documentStatus: {
      purpose: "State of THIS cutover doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-31": {
    documentSummary: {
      purpose:
        "Hypercare / support plan for the post-launch window — heightened support before steady-state.",
      expectedInput:
        "Window dates, heightened SLAs, dedicated team, escalation path, exit criteria.",
      exampleValue:
        "Window: 2026-11-30 to 2026-12-21 (3 wks).\nSLA: SEV-1 1h response (vs. 4h steady-state).\nTeam: 2 eng + SRE + PM on rapid-response Slack.\nEscalation: Eng Lead → CTO.\nExit: 0 SEV-1 for 7 days + <5 SEV-3/wk.",
    },
    documentStatus: {
      purpose: "State of THIS hypercare plan.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-35": {
    documentSummary: {
      purpose:
        "Post-incident review — captures what happened + what changes (per STD-SEC-007 / STD-OPS-003).",
      expectedInput:
        "Sections: incident summary, timeline, root cause, impact, action items + owners + dates, lessons learned.",
      exampleValue:
        "Incident: SAP rate-limit storm at peak.\nTimeline: 14:02 alert; 14:08 ack; 14:14 mitigation (throttle); 14:30 resolved.\nRoot cause: missing client-side rate cap when SAP partner reduced QPS.\nImpact: 4 min portal degradation, 0 disputes.\nActions: 1) auto-discover SAP QPS limit (BE Lead, Dec 15). 2) add alert on SAP 429s (SRE, Dec 5).\nLearnings: rate-cap config should not be hard-coded.",
      avoidExample: "Blame language — focus on the system.",
    },
    documentStatus: {
      purpose: "State of THIS incident review.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-38": {
    reviewSummary: {
      purpose:
        "Post-release review — looking back at the release in steady state. Drives improvement backlog (A-41).",
      expectedInput:
        "Sections: outcomes vs. goals, customer reception, internal feedback, what went well, what didn’t, decisions, follow-ups.",
      exampleValue:
        "Outcomes vs goals: AR cycle 10d→3d (vs target 2d); disputes 18%→8% (target 5%).\nCustomers: 73% portal adoption in 30 days; CSAT 4.4/5.\nInternal: smoother than expected SAP integration; Stripe Connect onboarding took 2 wks longer than estimated.\nWent well: hypercare staffing; rollback rehearsal.\nDidn’t: bulk download missing was the #1 customer request.\nFollow-ups: ship bulk download in v1.1 (Jan).",
    },
    documentStatus: {
      purpose: "State of THIS post-release review.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-39": {
    documentSummary: {
      purpose:
        "Records knowledge base updates from this release — keeps support + docs in sync.",
      expectedInput:
        "List KB articles created/updated: title, audience, owner, link.",
      exampleValue:
        "- ‘How to view invoices’ (customer-facing, owner CS, link).\n- ‘Resolving correction requests’ (AR ops, owner Product, link).\n- ‘SAP rate-limit playbook’ (internal, owner SRE, link).",
    },
    documentStatus: {
      purpose: "State of THIS KB update.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-40": {
    documentSummary: {
      purpose:
        "Capacity / performance report — confirms system runs within SLOs in steady state and projects forward.",
      expectedInput:
        "Sections: SLO results vs target, peak load observations, headroom projection, capacity plan revisions.",
      exampleValue:
        "SLO results (30d): availability 99.94% (target 99.9%); p95 latency 420ms (target <500ms); error rate 0.03% (target <0.1%).\nPeak load: 220 RPS at month-end vs forecast 200; headroom 3× at peak.\nProjection: at 12% growth/mo, scale event likely Q2 2027.\nPlan: add read replica when monthly active users >5k.",
    },
    documentStatus: {
      purpose: "State of THIS report.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },

  "A-41": {
    documentSummary: {
      purpose:
        "Improvement backlog — concrete follow-ups out of A-35/A-38/A-40 and customer signal.",
      expectedInput:
        "List items: title, source (incident/post-release/customer/perf), priority, owner, target release.",
      exampleValue:
        "1) Bulk download (Customer signal, P1, Product, v1.1).\n2) Auto-discover SAP QPS (Incident A-35, P2, BE, v1.2).\n3) Mobile-friendly invoice detail (Customer signal, P2, Design, v1.2).\n4) Read replica (Capacity A-40, P3, SRE, Q2 2027).",
    },
    documentStatus: {
      purpose: "State of THIS backlog doc.",
      expectedInput: "Draft → Approved.",
      exampleValue: "Approved",
    },
  },
};

export function getFieldGuide(
  templateId: string,
  fieldName: string,
): FieldHelpContent | undefined {
  return TEMPLATE_FIELD_GUIDES[templateId]?.[fieldName];
}
