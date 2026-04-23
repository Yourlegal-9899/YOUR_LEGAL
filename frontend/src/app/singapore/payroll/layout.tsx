import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compliant Payroll Services in Singapore| YourLegal',
  description:
    'Looking for the best payroll services in Singapore? YourLegal offers precise CPF contributions, tax filing, and full compliance for your business.',
  alternates: {
    canonical: 'https://www.yourlegal.io/singapore/payroll',
  },
};

export default function SingaporePayrollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

