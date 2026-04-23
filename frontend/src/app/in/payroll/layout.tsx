import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Payroll Services in India | TDS, PF & ESI | YourLegal',
  description:
    'Best Payroll services in India for startups, SMEs & foreign subsidiaries. We manage salaries, TDS, PF, ESI, and labor law compliance. Get expert support today!',
  alternates: {
    canonical: 'https://www.yourlegal.io/in/payroll',
  },
};

export default function IndiaPayrollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

