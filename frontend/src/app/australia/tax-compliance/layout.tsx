import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tax Compliance Australia: ASIC & ATO Compliance | YourLegal',
  description:
    'Expert guide to tax compliance Australia. Manage ASIC filings, ATO tax returns, and GST requirements to keep your business compliant and avoid costly penalties.',
};

export default function AustraliaTaxComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
