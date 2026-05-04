'use server';

/**
 * @fileOverview This file defines a server-side flow for answering platform questions.
 * It now uses Groq Chat Completions while keeping the same knowledge base and behavior.
 */

import { z } from 'zod';

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

const callGroqChat = async (input: AnswerLegalQuestionsInput): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY || '';
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set.');
  }

  const userPrompt = `Question: ${input.question}

Account context (internal, do not mention this label in your response):
${input.liveData || ''}`;

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

  return answer;
};

export async function answerLegalQuestions(
  input: AnswerLegalQuestionsInput
): Promise<AnswerLegalQuestionsOutput> {
  const validated = AnswerLegalQuestionsInputSchema.parse(input);
  const answer = await callGroqChat(validated);
  return AnswerLegalQuestionsOutputSchema.parse({ answer });
}
