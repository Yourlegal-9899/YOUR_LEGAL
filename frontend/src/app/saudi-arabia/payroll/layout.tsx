import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compliant Payroll Services in Saudi Arabia | YourLegal',
  description:
    'Get compliant payroll services in Saudi Arabia with YourLegal, managing GOSI, Mudad, and Saudization for seamless employee management and legal compliance.',
  alternates: {
    canonical: 'https://www.yourlegal.io/saudi-arabia/payroll',
  },
};

export default function SaudiArabiaPayrollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

