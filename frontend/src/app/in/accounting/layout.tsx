import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Accounting Services in India| YourLegal',
  description:
    'Expert accounting services in India for Pvt Ltd companies. We handle Ind AS financials, MCA filings, and tax returns to keep you compliant. Get started today!',
  alternates: {
    canonical: 'https://www.yourlegal.io/in/accounting',
  },
};

export default function IndiaAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

