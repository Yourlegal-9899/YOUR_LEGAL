import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annual Compliance Private Limited Company India | YourLegal',
  description:
    'Get expert help for annual compliance private limited company India. We manage MCA filings, ROC returns, and AGM minutes. Ensure 100% compliance today!',
  alternates: {
    canonical: 'https://www.yourlegal.io/in/annual-compliance',
  },
};

export default function IndiaAnnualComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

