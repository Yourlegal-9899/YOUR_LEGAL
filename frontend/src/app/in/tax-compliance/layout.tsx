import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tax Compliance Services India | Expert Solutions | YourLegal',
  description:
    'Expert tax compliance services India. We manage Income Tax, GST filings, MCA obligations, and RBI reporting for global founders. Stay 100% compliant today!',
  alternates: {
    canonical: 'https://www.yourlegal.io/in/tax-compliance',
  },
};

export default function IndiaTaxComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

