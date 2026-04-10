import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annual Compliance Services in the United States | YourLegal',
  description:
    'Get expert Annual Compliance Services in the United States. We automate state filings, franchise taxes, and BOI reports to keep your company in good standing.',
};

export default function AnnualComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
