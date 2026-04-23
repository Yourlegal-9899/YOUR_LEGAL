import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ASIC Annual Compliance Services in Australia| YourLegal',
  description:
    'Stay compliant with ASIC annual compliance for Australian Pty Ltd company. Automated filings and professional services to avoid penalties. Get started today!',
  alternates: {
    canonical: 'https://www.yourlegal.io/australia/annual-compliance',
  },
};

export default function AustraliaAnnualComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

