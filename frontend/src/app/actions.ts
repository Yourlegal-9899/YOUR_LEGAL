
'use server';

import { answerLegalQuestions } from '@/ai/flows/answer-legal-questions';
import { FRONTEND_AUTH_TOKEN_COOKIE } from '@/lib/auth-cookie';
import { API_BASE_URL } from '@/lib/api-base';
import { cookies } from 'next/headers';
import { z } from 'zod';

const AnswerSchema = z.object({
  question: z.string().min(1, { message: 'Question cannot be empty.' }),
});

export type ChatState = {
  messages: {
    role: 'user' | 'assistant';
    content: string;
    id: string;
  }[];
  error?: string;
  loading: boolean;
};

const buildCookieHeader = async () => {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  if (!all.length) return '';
  return all.map(({ name, value }) => `${name}=${value}`).join('; ');
};

const getFrontendAuthToken = async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FRONTEND_AUTH_TOKEN_COOKIE)?.value;
  if (!raw) return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const cookieHeader = await buildCookieHeader();
  const authToken = await getFrontendAuthToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }
  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  return fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  });
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10);
  return parsed.toISOString().slice(0, 10);
};

const detectIntents = (question: string) => {
  const q = question.toLowerCase();
  const wantsAnyStatus = /status|progress|update/.test(q);
  const wantsCompliance = /compliance|good standing|boi|annual report|due date|deadline/.test(q);
  const wantsTax = /tax|irs|return|filing|deadline|ct600|vat|gst|tds|aoc|mgt/.test(q);
  const wantsOverview = /bookkeeping|overview|summary|snapshot|financial/.test(q);
  const wantsPlan = /plan|subscription|billing|package|tier|pricing|upgrade|downgrade|renew|renewal|my plan|current plan/.test(q);
  const wantsFormationProgress = /formation|incorporation|ein|company progress|progress|timeline|company & legal|compliance history/.test(q);
  const wantsQuickBooks = /quickbooks|qbo|bookkeeping|invoice|bill|accounts|bank|balance|cash|p&l|profit|loss|balance sheet|cash flow|report|transactions|ar|ap/.test(q);
  const wantsBankBalance = /bank|balance|cash|account/.test(q) || wantsOverview;
  const wantsInvoices = /invoice|accounts receivable|ar\b/.test(q) || wantsOverview;
  const wantsBills = /bill|accounts payable|ap\b/.test(q) || wantsOverview;
  const wantsReports = /p&l|profit|loss|balance sheet|cash flow|report|growth|trend|performance/.test(q);
  const wantsTransactions = /transaction/.test(q);
  const wantsAccountStatus = wantsAnyStatus || /account status|profile status|my status|user status|subscription status|plan status/.test(q);
  const wantsOrders = wantsAnyStatus || /order|orders|service request|deliverable|purchase/.test(q);
  const wantsDocuments = wantsAnyStatus || /document|documents|uploads|files?|kyc|passport|pan|aadhaar|bank statement|receipt/.test(q);
  const wantsTickets = wantsAnyStatus || /ticket|support|helpdesk|issue|complaint/.test(q);
  const wantsPayments = wantsAnyStatus || /payment|payments|billing|charge|receipt|invoice/.test(q);
  const wantsOnboarding = wantsAnyStatus || /onboarding|application|submission|intake/.test(q);
  const wantsAdminStats = /growth|stats|metrics|kpi|revenue|signups|user growth|platform growth/.test(q);
  return {
    wantsCompliance,
    wantsTax,
    wantsOverview,
    wantsPlan,
    wantsFormationProgress,
    wantsQuickBooks,
    wantsBankBalance,
    wantsInvoices,
    wantsBills,
    wantsReports,
    wantsTransactions,
    wantsAccountStatus,
    wantsOrders,
    wantsDocuments,
    wantsTickets,
    wantsPayments,
    wantsOnboarding,
    wantsAdminStats,
  };
};

const extractEmail = (value: string) => {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] || null;
};

const extractReportValue = (report: any, keywords: string[]) => {
  if (!report?.Rows?.Row) return null;
  const matches: { label: string; amount: string }[] = [];
  const walk = (rows: any[]) => {
    rows.forEach((row) => {
      const headerText = row?.Header?.ColData?.[0]?.value;
      const dataLabel = row?.ColData?.[0]?.value;
      const summaryLabel = row?.Summary?.ColData?.[0]?.value;
      const label = summaryLabel || dataLabel || headerText || '';
      const amount = row?.Summary?.ColData?.[1]?.value ?? row?.ColData?.[1]?.value ?? '';
      if (label) {
        const lower = String(label).toLowerCase();
        if (keywords.some((kw) => lower.includes(kw))) {
          matches.push({ label, amount });
        }
      }
      if (row?.Rows?.Row) {
        walk(row.Rows.Row);
      }
    });
  };
  walk(report.Rows.Row);
  if (!matches.length) return null;
  return matches;
};

const buildLiveData = async (question: string) => {
  const intents = detectIntents(question);
  const parts: string[] = [];
  const nowStamp = new Date().toISOString();
  const requestedEmail = extractEmail(question);

  let cachedMe: any | null = null;
  let meLoaded = false;
  const getMe = async () => {
    if (meLoaded) return cachedMe;
    meLoaded = true;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/auth/me`);
      cachedMe = await res.json().catch(() => null);
    } catch {
      cachedMe = null;
    }
    return cachedMe;
  };

  const resolveCurrentStep = (progress: any, order: string[]) =>
    order.find((key) => progress?.[key]?.status !== 'completed') || order[order.length - 1];

  const summarizeProgress = (label: string, progress: any, order: string[], labels: Record<string, string>) => {
    if (!progress || typeof progress !== 'object') return `${label}: unavailable.`;
    const currentKey = resolveCurrentStep(progress, order);
    const completedCount = order.filter((key) => progress?.[key]?.status === 'completed').length;
    const total = order.length;
    const currentLabel = labels[currentKey] || currentKey;
    const completedSteps = order
      .map((key) => {
        const step = progress?.[key];
        if (step?.status !== 'completed') return null;
        const date = step?.completedAt ? formatDate(step.completedAt) : 'Completed';
        return `${labels[key] || key}: ${date}`;
      })
      .filter(Boolean) as string[];

    return `${label}: current step ${currentLabel} (${completedCount}/${total} completed)` +
      (completedSteps.length ? `\n  Completed: ${completedSteps.join(', ')}` : '');
  };

  if (intents.wantsPlan) {
    try {
      const data = await getMe();
      if (data?.user) {
        const user = data.user;
        const planLabel = user?.servicePlan || 'Not selected';
        const subscriptionStatus = user?.subscriptionStatus || 'N/A';
        const region = user?.region || 'N/A';
        const companyName = user?.companyName || 'N/A';
        parts.push(
          `Plan details as of ${nowStamp}:\n` +
          `- Plan: ${planLabel}\n` +
          `- Subscription status: ${subscriptionStatus}\n` +
          `- Region: ${region}\n` +
          `- Company: ${companyName}`
        );
      } else {
        parts.push(`Plan details as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Plan details as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsAccountStatus) {
    try {
      const data = await getMe();
      const user = data?.user;
      if (user) {
        const emailVerified = user?.emailVerified ? 'Yes' : 'No';
        const qbStatus = user?.quickBooksConnected ? 'connected' : 'not connected';
        parts.push(
          `Account status as of ${nowStamp}:\n` +
          `- Status: ${user?.status || 'N/A'}\n` +
          `- Email verified: ${emailVerified}\n` +
          `- Plan: ${user?.servicePlan || 'Not selected'}\n` +
          `- Subscription: ${user?.subscriptionStatus || 'N/A'}\n` +
          `- QuickBooks: ${qbStatus}\n` +
          `- Region: ${user?.region || 'N/A'}\n` +
          `- Company: ${user?.companyName || 'N/A'}`
        );
      } else {
        parts.push(`Account status as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Account status as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsOnboarding) {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/onboarding/me`);
      const data = await res.json().catch(() => null);
      const submission = data?.submission;
      if (res.ok && submission) {
        parts.push(
          `Onboarding status as of ${nowStamp}:\n` +
          `- Status: ${submission?.status || 'pending'}\n` +
          `- Plan: ${submission?.plan || submission?.planEntityType || 'N/A'}\n` +
          `- Entity type: ${submission?.entityType || submission?.planEntityType || 'N/A'}\n` +
          `- Country/Region: ${submission?.planCountry || submission?.destination || 'N/A'}\n` +
          `- Submitted: ${formatDate(submission?.createdAt)}`
        );
      } else if (res.ok) {
        parts.push(`Onboarding status as of ${nowStamp}: no submissions found.`);
      } else {
        parts.push(`Onboarding status as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Onboarding status as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsOrders) {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/orders/me`);
      const data = await res.json().catch(() => null);
      const orders = data?.orders || [];
      if (res.ok && orders.length) {
        const byStatus = orders.reduce((acc: Record<string, number>, order: any) => {
          const key = order?.status || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const recent = orders.slice(0, 5).map((order: any) => {
          const ref = order?.orderNumber || order?._id || 'Order';
          const service = order?.serviceType || order?.plan || 'Service';
          const status = order?.status || 'unknown';
          return `- ${ref}: ${service} (${status})`;
        });
        parts.push(
          `Orders status as of ${nowStamp}:\n` +
          `Counts: ${Object.entries(byStatus).map(([k, v]) => `${k} ${v}`).join(', ')}\n` +
          recent.join('\n')
        );
      } else if (res.ok) {
        parts.push(`Orders status as of ${nowStamp}: no orders found.`);
      } else {
        parts.push(`Orders status as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Orders status as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsDocuments) {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/documents/me`);
      const data = await res.json().catch(() => null);
      const documents = data?.documents || [];
      if (res.ok && documents.length) {
        const byStatus = documents.reduce((acc: Record<string, number>, doc: any) => {
          const key = doc?.status || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const recent = documents.slice(0, 5).map((doc: any) => {
          const name = doc?.name || doc?.originalName || 'Document';
          const status = doc?.status || 'pending';
          return `- ${name}: ${status}`;
        });
        parts.push(
          `Document status as of ${nowStamp}:\n` +
          `Counts: ${Object.entries(byStatus).map(([k, v]) => `${k} ${v}`).join(', ')}\n` +
          recent.join('\n')
        );
      } else if (res.ok) {
        parts.push(`Document status as of ${nowStamp}: no documents found.`);
      } else {
        parts.push(`Document status as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Document status as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsTickets) {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/tickets/me`);
      const data = await res.json().catch(() => null);
      const tickets = data?.tickets || [];
      if (res.ok && tickets.length) {
        const byStatus = tickets.reduce((acc: Record<string, number>, ticket: any) => {
          const key = ticket?.status || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const recent = tickets.slice(0, 5).map((ticket: any) => {
          const ref = ticket?.ticketNumber || ticket?._id || 'Ticket';
          const status = ticket?.status || 'open';
          const subject = ticket?.subject || 'Support ticket';
          return `- ${ref}: ${subject} (${status})`;
        });
        parts.push(
          `Support tickets as of ${nowStamp}:\n` +
          `Counts: ${Object.entries(byStatus).map(([k, v]) => `${k} ${v}`).join(', ')}\n` +
          recent.join('\n')
        );
      } else if (res.ok) {
        parts.push(`Support tickets as of ${nowStamp}: none found.`);
      } else {
        parts.push(`Support tickets as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Support tickets as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsPayments) {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/payment/my-payments`);
      const data = await res.json().catch(() => null);
      const payments = data?.payments || [];
      if (res.ok && payments.length) {
        const byStatus = payments.reduce((acc: Record<string, number>, payment: any) => {
          const key = payment?.status || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const recent = payments.slice(0, 5).map((payment: any) => {
          const amount = Number(payment?.amount || 0);
          const currency = payment?.currency || 'usd';
          const status = payment?.status || 'pending';
          const plan = payment?.plan || payment?.metadata?.serviceId || 'Payment';
          return `- ${plan}: ${amount.toFixed(2)} ${currency.toUpperCase()} (${status})`;
        });
        parts.push(
          `Payments as of ${nowStamp}:\n` +
          `Counts: ${Object.entries(byStatus).map(([k, v]) => `${k} ${v}`).join(', ')}\n` +
          recent.join('\n')
        );
      } else if (res.ok) {
        parts.push(`Payments as of ${nowStamp}: none found.`);
      } else {
        parts.push(`Payments as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Payments as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsAdminStats) {
    try {
      const me = await getMe();
      const role = me?.user?.role;
      if (role !== 'admin') {
        parts.push(`Platform growth stats as of ${nowStamp}: admin access required.`);
      } else {
        const res = await fetchWithAuth(`${API_BASE_URL}/admin/stats`);
        const data = await res.json().catch(() => null);
        const stats = data?.stats;
        if (res.ok && stats) {
          parts.push(
            `Platform growth stats as of ${nowStamp}:\n` +
            `- Total users: ${stats.totalUsers}\n` +
            `- Active users: ${stats.activeUsers}\n` +
            `- Recent signups (30d): ${stats.recentSignups}\n` +
            `- Active subscriptions: ${stats.activeSubscriptions}\n` +
            `- Total revenue: ${Number(stats.totalRevenue || 0).toFixed(2)}\n` +
            `- Compliance risk: ${stats.complianceRisk}\n` +
            `- Awaiting docs: ${stats.awaitingDocs}`
          );
        } else {
          parts.push(`Platform growth stats as of ${nowStamp}: unavailable.`);
        }
      }
    } catch {
      parts.push(`Platform growth stats as of ${nowStamp}: unavailable.`);
    }
  }

  if (requestedEmail) {
    try {
      const me = await getMe();
      const role = me?.user?.role;
      if (role !== 'admin') {
        parts.push(`User lookup for ${requestedEmail} as of ${nowStamp}: admin access required.`);
      } else {
        const res = await fetchWithAuth(`${API_BASE_URL}/admin/users`);
        const data = await res.json().catch(() => null);
        const users = data?.users || [];
        const match = users.find((user: any) => String(user?.email || '').toLowerCase() === requestedEmail.toLowerCase());
        if (res.ok && match) {
          parts.push(
            `User status for ${requestedEmail} as of ${nowStamp}:\n` +
            `- Name: ${match?.name || 'N/A'}\n` +
            `- Status: ${match?.status || 'N/A'}\n` +
            `- Plan: ${match?.servicePlan || 'Not selected'}\n` +
            `- Subscription: ${match?.subscriptionStatus || 'N/A'}\n` +
            `- Region: ${match?.region || 'N/A'}\n` +
            `- QuickBooks: ${match?.quickBooksConnected ? 'connected' : 'not connected'}`
          );
        } else if (res.ok) {
          parts.push(`User lookup for ${requestedEmail} as of ${nowStamp}: no user found.`);
        } else {
          parts.push(`User lookup for ${requestedEmail} as of ${nowStamp}: unavailable.`);
        }
      }
    } catch {
      parts.push(`User lookup for ${requestedEmail} as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsFormationProgress) {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/formations/me`);
      const data = await res.json().catch(() => null);
      if (res.ok && data?.formations) {
        const formations = (data.formations as any[]).slice(0, 5);
        if (formations.length) {
          const formationLines = formations.map((formation) => {
            const companyName = formation?.companyName || formation?.legalName || 'Company';
            const status = formation?.status || 'N/A';
            const formationProgress = summarizeProgress(
              'Formation',
              formation?.formationProgress,
              ['nameCheck', 'filingPrep', 'stateFiling', 'approved'],
              {
                nameCheck: 'Name Check',
                filingPrep: 'Filing Prep',
                stateFiling: 'State Filing',
                approved: 'Approved',
              }
            );
            const einProgress = summarizeProgress(
              'EIN',
              formation?.einProgress,
              ['ss4Application', 'irsSubmission', 'processing', 'allotment'],
              {
                ss4Application: 'SS-4 Application',
                irsSubmission: 'IRS Submission',
                processing: 'Processing',
                allotment: 'Allotment',
              }
            );
            const complianceProgress = summarizeProgress(
              'Initial compliance',
              formation?.initialCompliance,
              ['operatingAgreement', 'initialResolutions', 'boiReport', 'goodStanding'],
              {
                operatingAgreement: 'Operating Agreement',
                initialResolutions: 'Initial Resolutions',
                boiReport: 'BOI Report',
                goodStanding: 'Good Standing',
              }
            );
            const einNumber = formation?.einProgress?.einNumber || formation?.ein || null;
            const einLine = einNumber ? `EIN: ${einNumber}` : 'EIN: not issued';

            return [
              `- ${companyName} (status: ${status})`,
              `  ${formationProgress}`,
              `  ${einProgress}`,
              `  ${complianceProgress}`,
              `  ${einLine}`,
            ].join('\n');
          });

          parts.push(
            `Formation & compliance progress as of ${nowStamp}:\n` +
            formationLines.join('\n')
          );
        } else {
          parts.push(`Formation & compliance progress as of ${nowStamp}: no formations found.`);
        }
      } else {
        parts.push(`Formation & compliance progress as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Formation & compliance progress as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsCompliance) {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/compliance/events/me`);
      const data = await res.json().catch(() => null);
      if (res.ok && data?.events) {
        const events = (data.events as any[])
          .map((event) => ({
            name: event?.rule?.name || event?.description || 'Compliance filing',
            dueDate: formatDate(event?.dueDate),
            status: event?.status || 'upcoming',
          }))
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
          .slice(0, 10);
        if (events.length) {
          parts.push(
            `Compliance events (next ${events.length}) as of ${nowStamp}:\n` +
            events.map((e) => `- ${e.name}: ${e.dueDate} (${e.status})`).join('\n')
          );
        } else {
          parts.push(`Compliance events as of ${nowStamp}: none found.`);
        }
      } else {
        parts.push(`Compliance events as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Compliance events as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsTax) {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/tax-filings/me`);
      const data = await res.json().catch(() => null);
      if (res.ok && data?.filings) {
        const filings = (data.filings as any[])
          .map((filing) => ({
            name: filing?.filingName || filing?.filingType || 'Tax filing',
            year: filing?.taxYear || 'N/A',
            dueDate: formatDate(filing?.dueDate),
            status: filing?.status || 'pending',
            company: filing?.company?.companyName || filing?.companyName || '',
          }))
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
          .slice(0, 10);
        if (filings.length) {
          parts.push(
            `Tax filings & deadlines (next ${filings.length}) as of ${nowStamp}:\n` +
            filings.map((f) => `- ${f.name} ${f.year}${f.company ? ` (${f.company})` : ''}: ${f.dueDate} (${f.status})`).join('\n')
          );
        } else {
          parts.push(`Tax filings as of ${nowStamp}: none found.`);
        }
      } else {
        parts.push(`Tax filings as of ${nowStamp}: unavailable.`);
      }
    } catch {
      parts.push(`Tax filings as of ${nowStamp}: unavailable.`);
    }
  }

  if (intents.wantsQuickBooks) {
    let qbConnected = false;
    try {
      const statusRes = await fetchWithAuth(`${API_BASE_URL}/quickbooks/status`);
      const statusData = await statusRes.json().catch(() => null);
      qbConnected = Boolean(statusRes.ok && statusData?.connected);
      if (!qbConnected) {
        parts.push(`QuickBooks status as of ${nowStamp}: not connected.`);
      }
    } catch {
      parts.push(`QuickBooks status as of ${nowStamp}: unavailable.`);
    }

    if (qbConnected) {
      if (intents.wantsBankBalance) {
        try {
          const res = await fetchWithAuth(`${API_BASE_URL}/quickbooks/proxy`, {
            method: 'POST',
            body: JSON.stringify({ method: 'GET', url: 'query?query=select * from Account' }),
          });
          const data = await res.json().catch(() => null);
          const accounts = data?.QueryResponse?.Account || [];
          const bankAccounts = accounts.filter((account: any) => account?.AccountType === 'Bank');
          const totalCash = bankAccounts.reduce((sum: number, account: any) => {
            const value = Number(account?.CurrentBalance ?? account?.Balance ?? 0);
            return sum + (Number.isFinite(value) ? value : 0);
          }, 0);
          const topAccounts = bankAccounts.slice(0, 5).map((account: any) => {
            const balance = Number(account?.CurrentBalance ?? account?.Balance ?? 0);
            return `- ${account?.Name || 'Bank Account'}: ${Number.isFinite(balance) ? balance.toFixed(2) : 'N/A'}`;
          });
          parts.push(
            `QuickBooks bank balances as of ${nowStamp}:\n` +
            `Total cash across bank accounts: ${totalCash.toFixed(2)}\n` +
            (topAccounts.length ? topAccounts.join('\n') : '- No bank accounts found.')
          );
        } catch {
          parts.push(`QuickBooks bank balances as of ${nowStamp}: unavailable.`);
        }
      }

      if (intents.wantsInvoices) {
        try {
          const res = await fetchWithAuth(`${API_BASE_URL}/quickbooks/invoices`);
          const data = await res.json().catch(() => null);
          const invoices = data?.invoices || [];
          const now = new Date();
          const safeAmount = (value: any) => {
            const n = Number(value);
            return Number.isFinite(n) ? n : 0;
          };
          const openInvoices = invoices.filter((inv: any) => safeAmount(inv?.Balance) > 0);
          const overdue = openInvoices.filter((inv: any) => inv?.DueDate && new Date(inv.DueDate) < now);
          const totalOpen = openInvoices.reduce((sum: number, inv: any) => sum + safeAmount(inv?.Balance), 0);
          const topInvoices = openInvoices.slice(0, 5).map((inv: any) => {
            const balance = safeAmount(inv?.Balance);
            return `- ${inv?.DocNumber || inv?.Id}: ${balance.toFixed(2)} due ${formatDate(inv?.DueDate)}`;
          });
          parts.push(
            `QuickBooks invoices as of ${nowStamp}:\n` +
            `Open invoices: ${openInvoices.length}, overdue: ${overdue.length}, total open balance: ${totalOpen.toFixed(2)}\n` +
            (topInvoices.length ? topInvoices.join('\n') : '- No open invoices found.')
          );
        } catch {
          parts.push(`QuickBooks invoices as of ${nowStamp}: unavailable.`);
        }
      }

      if (intents.wantsBills) {
        try {
          const res = await fetchWithAuth(`${API_BASE_URL}/quickbooks/proxy`, {
            method: 'POST',
            body: JSON.stringify({ method: 'GET', url: 'query?query=select * from Bill' }),
          });
          const data = await res.json().catch(() => null);
          const bills = data?.QueryResponse?.Bill || [];
          const safeAmount = (value: any) => {
            const n = Number(value);
            return Number.isFinite(n) ? n : 0;
          };
          const openBills = bills.filter((bill: any) => safeAmount(bill?.Balance) > 0);
          const totalOpen = openBills.reduce((sum: number, bill: any) => sum + safeAmount(bill?.Balance), 0);
          const topBills = openBills.slice(0, 5).map((bill: any) => {
            const balance = safeAmount(bill?.Balance);
            return `- ${bill?.DocNumber || bill?.Id}: ${balance.toFixed(2)} due ${formatDate(bill?.DueDate)}`;
          });
          parts.push(
            `QuickBooks bills as of ${nowStamp}:\n` +
            `Open bills: ${openBills.length}, total open balance: ${totalOpen.toFixed(2)}\n` +
            (topBills.length ? topBills.join('\n') : '- No open bills found.')
          );
        } catch {
          parts.push(`QuickBooks bills as of ${nowStamp}: unavailable.`);
        }
      }

      if (intents.wantsReports) {
        try {
          const [pnlRes, balanceRes, cashRes] = await Promise.all([
            fetchWithAuth(`${API_BASE_URL}/quickbooks/proxy`, {
              method: 'POST',
              body: JSON.stringify({ method: 'GET', url: 'reports/ProfitAndLoss' }),
            }),
            fetchWithAuth(`${API_BASE_URL}/quickbooks/proxy`, {
              method: 'POST',
              body: JSON.stringify({ method: 'GET', url: 'reports/BalanceSheet' }),
            }),
            fetchWithAuth(`${API_BASE_URL}/quickbooks/proxy`, {
              method: 'POST',
              body: JSON.stringify({ method: 'GET', url: 'reports/CashFlow' }),
            }),
          ]);
          const pnlData = await pnlRes.json().catch(() => null);
          const balanceData = await balanceRes.json().catch(() => null);
          const cashData = await cashRes.json().catch(() => null);

          const pnlHighlights = extractReportValue(pnlData, ['net income', 'total income', 'total expenses']);
          const balanceHighlights = extractReportValue(balanceData, ['total assets', 'total liabilities', 'total equity']);
          const cashHighlights = extractReportValue(cashData, ['net cash', 'cash']);

          const formatHighlights = (title: string, highlights: any[] | null) => {
            if (!highlights || !highlights.length) return `${title}: unavailable.`;
            return `${title}:\n` + highlights.slice(0, 5).map((row) => `- ${row.label}: ${row.amount}`).join('\n');
          };

          parts.push(
            `QuickBooks report highlights as of ${nowStamp}:\n` +
            `${formatHighlights('Profit & Loss', pnlHighlights)}\n` +
            `${formatHighlights('Balance Sheet', balanceHighlights)}\n` +
            `${formatHighlights('Cash Flow', cashHighlights)}`
          );
        } catch {
          parts.push(`QuickBooks reports as of ${nowStamp}: unavailable.`);
        }
      }

      if (intents.wantsTransactions) {
        try {
          const res = await fetchWithAuth(`${API_BASE_URL}/quickbooks/proxy`, {
            method: 'POST',
            body: JSON.stringify({ method: 'GET', url: 'reports/TransactionList' }),
          });
          const data = await res.json().catch(() => null);
          const rows = data?.Rows?.Row || [];
          const samples = rows.slice(0, 5).map((row: any) => {
            const cols = row?.ColData || [];
            const date = cols[0]?.value || '';
            const type = cols[1]?.value || '';
            const name = cols[2]?.value || '';
            const amount = cols[4]?.value || '';
            return `- ${date} ${type} ${name} ${amount}`.trim();
          });
          parts.push(
            `QuickBooks transactions (sample) as of ${nowStamp}:\n` +
            (samples.length ? samples.join('\n') : '- No transactions found.')
          );
        } catch {
          parts.push(`QuickBooks transactions as of ${nowStamp}: unavailable.`);
        }
      }
    }
  }

  return parts.join('\n\n');
};

export async function askQuestion(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const validatedFields = AnswerSchema.safeParse({
    question: formData.get('question'),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      error: validatedFields.error.flatten().fieldErrors.question?.[0],
      loading: false,
    };
  }
  
  const userMessage = { role: 'user' as const, content: validatedFields.data.question, id: crypto.randomUUID() };
  const newState = {
      ...prevState,
      messages: [...prevState.messages, userMessage],
      error: undefined,
      loading: true,
  };

  try {
    const liveData = await buildLiveData(validatedFields.data.question);
    const response = await answerLegalQuestions({ question: validatedFields.data.question, liveData });
    const assistantMessage = { role: 'assistant' as const, content: response.answer, id: crypto.randomUUID() };
    return {
      ...newState,
      messages: [...newState.messages, assistantMessage],
      loading: false,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = { role: 'assistant' as const, content: "Sorry, I couldn't get an answer. Please try again.", id: crypto.randomUUID() };
    return {
      ...newState,
      messages: [...newState.messages, errorMessage],
      error: "An unexpected error occurred.",
      loading: false,
    };
  }
}

const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  question: z.string().min(1, 'Question cannot be empty.'),
});

export type ContactFormState = {
    message: string;
    error?: string;
};

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
    const validatedFields = ContactFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            ...prevState,
            error: JSON.stringify(validatedFields.error.flatten().fieldErrors),
            message: "Validation failed."
        }
    }

    console.log("Form submitted:", validatedFields.data);

    // Here you would typically send an email, save to a database, etc.
    // For now, we'll just log it and return a success message.

    return {
        ...prevState,
        message: "Thank you for your message! We will get back to you shortly.",
        error: undefined,
    }
}
