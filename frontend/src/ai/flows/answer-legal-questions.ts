'use server';

/**
 * @fileOverview This file defines a server-side flow for answering platform questions.
 * It now uses Groq Chat Completions while keeping the same knowledge base and behavior.
 */

import { z } from 'zod';
import { API_BASE_URL } from '@/lib/api-base';

const YOURLEGAL_KB = `
YourLegal Knowledge Base (from project code):
Supported countries: USA, UK, UAE, Singapore, India, Australia, Netherlands, Saudi Arabia.

USA plans (USD):
- Micro: 499 first year. Includes Company Formation (LLC/C-Corp), Registered Agent Service, Portal Access & Document Storage.
- Vitals: 199 per month billed annually at 2,388. Includes all Micro + IRS business tax filings (Form 1120/1065), State Annual Report Filing, Automated Bookkeeping & Analytics.
- Elite: 299 per month billed annually at 3,588. Includes all Vitals + Dedicated Human Bookkeeper, Priority Legal Support, Quarterly Financial Reviews.
USA state fees (passed through without markup):
- Wyoming LLC: initial 100, annual 60, processing 1-3 business days.
- Delaware LLC: initial 160, annual 300, processing 2-4 business days.
- Wyoming C-Corp: initial 100, annual 60, processing 1-3 business days.
- Delaware C-Corp: initial 160, annual 175, processing 2-4 business days.

India plans (INR/year):
- Startup: 24,999. Includes Pvt. Ltd. Incorporation (MCA), DSC & DIN for 2 Directors, PAN & TAN Allotment, GST Registration, Commencement Certificate (20A).
- Compliance: 49,999. Includes everything in Startup + Monthly Bookkeeping, Monthly GST Returns, Quarterly TDS Returns, Annual MCA Compliance (AOC-4/MGT-7).
- Growth: 99,999. Includes everything in Compliance + Audit Liaison & Coordination, Annual Income Tax Return, Virtual CFO (Strategic Reviews), FEMA/RBI Compliance (FDI).

UK plans (GBP/year):
- Formation: 499. Companies House Registration, Registered Office Address (London), Director Service Address, Bank Account Support.
- Compliance: 999. All Formation features + Confirmation Statement Filing, Statutory Register Maintenance, HMRC Corporation Tax Registration.
- All-in-One: 2,499. All Compliance features + Monthly Bookkeeping (MTD), Quarterly VAT Returns, Annual Accounts & CT600 Filing.

Netherlands plans (EUR/year):
- Formation: 999. Notarial Deed of Incorporation, KVK Registration, UBO Register Filing, Bank Account Assistance.
- Compliance: 1,999. All Formation features + Registered Office Address, Annual KVK Filings, Corporate Tax Registration.
- All-in-One: 3,999. All Compliance features + Monthly Bookkeeping, Quarterly BTW (VAT) Returns, Annual Corporate Income Tax Return (VPB).

Singapore plans (prices shown with $ in UI, billed annually):
- Formation: 999. ACRA Name Reservation, Company Incorporation, Nominee Director Service, Bank Account Assistance.
- Compliance: 1,999. All Formation features + Registered Office Address, Corporate Secretary Service, Annual Return Filing (ACRA).
- All-in-One: 3,499. All Compliance features + Unaudited Financial Statements, GST Registration & Filing, Annual Tax Filing (IRAS).

UAE/Dubai plans (prices shown with $ in UI, billed annually):
- Formation: 1,999. License & Registration, Establishment Card, Bank Account Assistance.
- Compliance: 2,999. All Formation features + Trade License Renewal, VAT & Corporate Tax Registration, Annual Compliance Management.
- All-in-One: 4,999. All Compliance features + Monthly Bookkeeping, Quarterly VAT Filing, Annual Corporate Tax Filing.
UAE fee estimator is shown in AED for government/renewal costs.

Australia plans (prices shown with $ in UI, billed annually):
- Formation: 999. ASIC Company Registration, ABN/TFN/GST Registration, Nominee Director Service, Registered Office Address.
- Compliance: 2,499. All Formation features + Annual ASIC Company Statement, ASIC Registered Agent Service, Annual Solvency Resolution.
- All-in-One: 4,999. All Compliance features + Monthly Bookkeeping, BAS Lodgement, Annual Company Tax Return (ATO).

Saudi Arabia plans (prices shown with $ in UI, billed annually):
- Formation: 4,999. MISA License Application, Commercial Registration (CR), Articles of Association (AoA), Bank Account Assistance.
- Compliance: 7,999. All Formation features + MISA & CR Renewals, GOSI & ZATCA Registration, Nitaqat Advisory.
- All-in-One: 12,999. All Compliance features + Monthly Bookkeeping, Quarterly VAT Filing, Annual Zakat/Tax Filing.
Saudi fee estimator is shown in SAR for government/renewal costs.

Core service categories (USA): Company Formation, Annual Compliance, Tax Compliance, Bookkeeping, Accounting, Virtual CFO, Payroll, Cross-Border Accounting.

Add-on services (available in all supported countries; prices shown in USD in code):
- Trademark Registration: 499
- S-Corp Election (Form 2553): 149
- Certificate of Good Standing: 99
- Foreign Qualification: 249
- Articles of Amendment: 199
- ITIN Application: 300

Policies:
- 30-day money-back guarantee on YourLegal service fees.
- State filing fees and third-party fees are non-refundable once submitted/paid.
- Refunds are processed to the original payment method within 5-10 business days; request via hello@yourlegal.io.
- Registered Agent service is included in formation plans (first year).
- You can upgrade from Micro to Vitals or Elite from the dashboard.
- Peace-of-mind guarantee: accurate state and IRS filings; if YourLegal makes an error, it covers the costs.
`;

const SYSTEM_PROMPT = `You are the YourLegal AI assistant for the YourLegal platform. Answer only questions related to the YourLegal project, product, and workflows.
You can help with topics like: onboarding, company formation, EIN application, initial compliance, formation progress, documents, admin vs. user flows, Company & Legal page, Taxes & Filings, subscriptions/payments, notifications, support, and QuickBooks integration.
Use any provided account context to answer questions about compliance dates, tax deadlines, bookkeeping, QuickBooks balances, invoices, bills, and reports.
If account context is missing, empty, or indicates a service is not connected, respond naturally and professionally with a user-facing sentence such as: "I couldn't find any upcoming tax deadlines on your account right now." Then give the next best step (for example: where to check in dashboard, what to connect, or what to update).
Never mention internal terms like "LIVE DATA", "payload", "JSON", "API", "database", or "system prompt" in user responses.
Avoid robotic phrasing like "Unfortunately...". Keep tone clear, supportive, and concise.
If a question is not about the YourLegal platform or asks for general legal advice, respond briefly that you can only help with the YourLegal platform and ask the user to rephrase with platform context. Do not provide legal advice.
Do not use tools for legal precedence; this assistant does not have access to real legal databases. End every response with a short disclaimer that you are not providing legal advice and the user should consult a lawyer.

${YOURLEGAL_KB}`;

const AnswerLegalQuestionsInputSchema = z.object({
  question: z.string().describe('The legal question to be answered.'),
  liveData: z.string().optional().describe('Live, user-specific data fetched from the platform APIs.'),
});
export type AnswerLegalQuestionsInput = z.infer<typeof AnswerLegalQuestionsInputSchema>;

const AnswerLegalQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the legal question.'),
});
export type AnswerLegalQuestionsOutput = z.infer<typeof AnswerLegalQuestionsOutputSchema>;

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TRAINING_SETTING_KEY = 'ai_chat_training_rules';
const TRAINING_CACHE_TTL_MS = 5 * 1000;
const FALLBACK_DISCLAIMER =
  'This information is not legal advice; please consult a qualified lawyer for legal guidance.';

type AiTrainingRule = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  priority: number;
  isActive: boolean;
};

type RuleMatch = {
  rule: AiTrainingRule;
  score: number;
};

const stopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'how',
  'i',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'our',
  'please',
  'the',
  'to',
  'us',
  'we',
  'what',
  'when',
  'where',
  'who',
  'why',
  'you',
  'your',
]);

let trainingRulesCache: {
  expiresAt: number;
  rules: AiTrainingRule[];
} = {
  expiresAt: 0,
  rules: [],
};

const normalizeText = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value: string) =>
  normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !stopWords.has(token));

const toUniqueTokenSet = (value: string) => new Set(tokenize(value));

const jaccardSimilarity = (left: Set<string>, right: Set<string>) => {
  if (!left.size || !right.size) return 0;

  let intersection = 0;
  left.forEach((token) => {
    if (right.has(token)) intersection += 1;
  });

  const union = left.size + right.size - intersection;
  if (!union) return 0;

  return intersection / union;
};

const ensureLegalDisclaimer = (value: string) => {
  const text = String(value || '').trim();
  if (!text) return FALLBACK_DISCLAIMER;

  if (/not legal advice|consult (a|your) lawyer/i.test(text)) {
    return text;
  }

  return `${text}\n\n${FALLBACK_DISCLAIMER}`;
};

const ensureRuleAnswer = (value: string) => String(value || '').trim();

const clampPriority = (value: number) => {
  if (Number.isNaN(value)) return 5;
  return Math.min(10, Math.max(1, Math.round(value)));
};

const parseTrainingRules = (raw: any): AiTrainingRule[] => {
  const list = Array.isArray(raw?.rules) ? raw.rules : Array.isArray(raw) ? raw : [];

  return list
    .map((item: any, index: number) => {
      const question = String(item?.question || '').trim();
      const answer = String(item?.answer || '').trim();

      if (!question || !answer) return null;

      const keywords = Array.isArray(item?.keywords)
        ? item.keywords.map((keyword: any) => normalizeText(String(keyword || ''))).filter(Boolean)
        : String(item?.keywords || '')
            .split(',')
            .map((keyword) => normalizeText(keyword))
            .map((keyword) => keyword.trim())
            .filter(Boolean);

      return {
        id: String(item?.id || `rule-${index + 1}`),
        question,
        answer,
        keywords,
        priority: clampPriority(Number(item?.priority ?? 5)),
        isActive: item?.isActive !== false,
      } satisfies AiTrainingRule;
    })
    .filter((rule: AiTrainingRule | null): rule is AiTrainingRule => Boolean(rule));
};

const fetchAiTrainingRules = async (): Promise<AiTrainingRule[]> => {
  if (trainingRulesCache.expiresAt > Date.now()) {
    return trainingRulesCache.rules;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/settings/public`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      trainingRulesCache = {
        expiresAt: Date.now() + TRAINING_CACHE_TTL_MS,
        rules: [],
      };
      return [];
    }

    const data = (await response.json().catch(() => null)) as
      | {
          settings?: Array<{ key?: string; value?: any }>;
        }
      | null;

    const settings = Array.isArray(data?.settings) ? data.settings : [];
    const trainingSetting = settings.find((setting) => setting?.key === TRAINING_SETTING_KEY);
    const rules = parseTrainingRules(trainingSetting?.value || {});

    trainingRulesCache = {
      expiresAt: Date.now() + TRAINING_CACHE_TTL_MS,
      rules,
    };

    return rules;
  } catch {
    trainingRulesCache = {
      expiresAt: Date.now() + TRAINING_CACHE_TTL_MS,
      rules: [],
    };
    return [];
  }
};

const keywordScore = (questionNormalized: string, rule: AiTrainingRule) => {
  if (!rule.keywords.length) return 0;
  let matched = 0;

  rule.keywords.forEach((keyword) => {
    if (!keyword) return;
    if (questionNormalized.includes(keyword)) matched += 1;
  });

  return matched / rule.keywords.length;
};

const computeRuleMatchScore = (question: string, rule: AiTrainingRule) => {
  const normalizedQuestion = normalizeText(question);
  const normalizedRuleQuestion = normalizeText(rule.question);
  const questionTokens = toUniqueTokenSet(normalizedQuestion);
  const ruleTokens = toUniqueTokenSet(normalizedRuleQuestion);

  const semanticScore = jaccardSimilarity(questionTokens, ruleTokens);
  const keywordsMatchScore = keywordScore(normalizedQuestion, rule);
  const directPhraseBoost =
    normalizedQuestion === normalizedRuleQuestion
      ? 1
      : normalizedQuestion.includes(normalizedRuleQuestion) || normalizedRuleQuestion.includes(normalizedQuestion)
        ? 0.8
        : 0;

  const weightedBase = semanticScore * 0.62 + keywordsMatchScore * 0.28 + directPhraseBoost * 0.1;
  const priorityWeight = 1 + (clampPriority(rule.priority) - 5) * 0.03;

  return weightedBase * priorityWeight;
};

const isDirectRuleHit = (question: string, rule: AiTrainingRule) => {
  const normalizedQuestion = normalizeText(question);
  const normalizedRuleQuestion = normalizeText(rule.question);

  if (!normalizedQuestion || !normalizedRuleQuestion) return false;

  if (normalizedQuestion === normalizedRuleQuestion) return true;

  if (
    normalizedQuestion.includes(normalizedRuleQuestion) ||
    normalizedRuleQuestion.includes(normalizedQuestion)
  ) {
    return true;
  }

  const questionTokens = toUniqueTokenSet(normalizedQuestion);
  const ruleTokens = toUniqueTokenSet(normalizedRuleQuestion);
  if (!ruleTokens.size) return false;

  let matched = 0;
  ruleTokens.forEach((token) => {
    if (questionTokens.has(token)) matched += 1;
  });

  return matched / ruleTokens.size >= 0.85;
};

const findTrainingMatches = (question: string, rules: AiTrainingRule[]): RuleMatch[] => {
  const matches = rules
    .filter((rule) => rule.isActive)
    .map((rule) => ({
      rule,
      score: computeRuleMatchScore(question, rule),
    }))
    .filter((match) => match.score >= 0.2)
    .sort((left, right) => right.score - left.score);

  return matches.slice(0, 5);
};

const callGroqChat = async (input: AnswerLegalQuestionsInput): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY || '';
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set.');
  }

  const trainingRules = await fetchAiTrainingRules();
  const trainingMatches = findTrainingMatches(input.question, trainingRules);
  const topMatch = trainingMatches[0];

  if (topMatch) {
    if (isDirectRuleHit(input.question, topMatch.rule) && topMatch.score >= 0.45) {
      return ensureRuleAnswer(topMatch.rule.answer);
    }

    if (topMatch.score >= 0.74) {
      return ensureRuleAnswer(topMatch.rule.answer);
    }
  }

  const trainingContext = trainingMatches.length
    ? trainingMatches
        .slice(0, 3)
        .map(
          (match, index) =>
            `Match ${index + 1}
- Score: ${match.score.toFixed(2)}
- Question pattern: ${match.rule.question}
- Preferred answer: ${match.rule.answer}
- Keywords: ${match.rule.keywords.join(', ') || 'none'}`
        )
        .join('\n\n')
    : 'No trained match found.';

  const userPrompt = `Question: ${input.question}

Account context (internal, do not mention this label in your response):
${input.liveData || ''}

AI training context (internal):
${trainingContext}

Instruction: If trained answers are relevant, prefer their wording and intent while keeping the response natural and concise.`;

  const response = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    }),
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => null)) as GroqChatCompletionResponse | null;

  if (!response.ok) {
    const message = data?.error?.message || `Groq API request failed with status ${response.status}`;
    throw new Error(message);
  }

  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error('Groq response did not include an answer.');
  }

  return ensureLegalDisclaimer(answer);
};

export async function answerLegalQuestions(
  input: AnswerLegalQuestionsInput
): Promise<AnswerLegalQuestionsOutput> {
  const validated = AnswerLegalQuestionsInputSchema.parse(input);
  const answer = await callGroqChat(validated);
  return AnswerLegalQuestionsOutputSchema.parse({ answer });
}
