import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payroll Services in UK| HMRC-Compliant Solutions| YourLegal',
  description:
    'YourLegal offers payroll services in UK, ensuring full HMRC compliance, accurate tax calculations, and timely employee payments. Simplify your payroll today.',
  alternates: {
    canonical: 'https://www.yourlegal.io/uk/payroll',
  },
};

export default function UkPayrollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

