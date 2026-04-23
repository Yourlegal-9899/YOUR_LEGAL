import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payroll Services in Dubai | WPS Compliant | YourLegal',
  description:
    'Get WPS-compliant payroll services in Dubai. We manage salaries, gratuity, and leave in line with UAE Labour Law. Avoid fines and ensure 100% compliance.',
  alternates: {
    canonical: 'https://www.yourlegal.io/dubai/payroll',
  },
};

export default function DubaiPayrollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

