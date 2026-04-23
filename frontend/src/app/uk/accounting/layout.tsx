import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Accounting Outsourcing Services in UK | YourLegal',
  description:
    'Get expert accounting outsourcing services in UK. We handle statutory accounts, HMRC tax returns, and Companies House filings to keep your business compliant.',
  alternates: {
    canonical: 'https://www.yourlegal.io/uk/accounting',
  },
};

export default function UkAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

