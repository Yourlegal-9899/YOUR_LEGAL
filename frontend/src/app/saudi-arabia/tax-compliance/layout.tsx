import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Tax Compliance Saudi Arabia| ZATCA & MHRSD| YourLegal',
  description:
    'Expert Tax Compliance Saudi Arabia: YourLegal handles ZATCA & MHRSD for you. Ensure smooth operations, avoid heavy penalties, and stay 100% compliant.',
  alternates: {
    canonical: 'https://www.yourlegal.io/saudi-arabia/tax-compliance',
  },
};

export default function SaudiArabiaTaxComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

