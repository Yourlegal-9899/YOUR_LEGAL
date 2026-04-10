import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tax Compliance Netherlands | Expert B.V. Service & Filing',
  description:
    'Professional tax compliance Netherlands services for your B.V. We handle KVK filings, VAT returns, and corporate tax to keep your Dutch business compliant.',
};

export default function NetherlandsTaxComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
