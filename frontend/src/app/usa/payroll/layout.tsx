import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compliant Payroll Services in the united states| Your Legal',
  description:
    'We provide compliant, automated payroll services in the United States. Ensure timely payments, minimize compliance risks, and simplify payroll management.',
};

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
