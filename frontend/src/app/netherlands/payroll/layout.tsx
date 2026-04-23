import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payroll services in the Netherlands for Dutch B.V.',
  description:
    'Expert payroll services in the Netherlands for expats and locals. Accurate wage tax, social security, pensions and the 30% ruling for your Dutch B.V.',
  alternates: {
    canonical: 'https://www.yourlegal.io/netherlands/payroll',
  },
};

export default function NetherlandsPayrollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

