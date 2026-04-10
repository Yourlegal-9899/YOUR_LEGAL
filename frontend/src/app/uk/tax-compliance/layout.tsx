import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stay Compliant in the UK| Corp & Tax Compliance Services UK',
  description:
    'Stay ahead with our tax compliance services UK, offering expert advice and solutions to keep your business compliant, efficient, and on track for success.',
};

export default function UkTaxComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
