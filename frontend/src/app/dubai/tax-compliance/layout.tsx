import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tax Compliance UAE | Expert VAT & Corporate Tax Services',
  description:
    'Expert tax compliance UAE services for your business. We manage VAT, Corporate Tax filing, ESR, and UBO registers to ensure you avoid heavy federal penalties.',
  alternates: {
    canonical: 'https://www.yourlegal.io/dubai/tax-compliance',
  },
};

export default function DubaiTaxComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

