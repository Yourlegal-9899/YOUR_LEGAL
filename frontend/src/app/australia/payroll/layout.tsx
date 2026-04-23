import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payroll Services in Australia - ATO-Compliant| YourLegal',
  description:
    'YourLegal provides expert payroll services in Australia, ensuring compliance with PAYG tax, superannuation, and STP reporting. Avoid fines and stay compliant.',
  alternates: {
    canonical: 'https://www.yourlegal.io/australia/payroll',
  },
};

export default function AustraliaPayrollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

