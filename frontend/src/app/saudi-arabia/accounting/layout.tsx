import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Accounting Services in Saudi Arabia| YourLegal',
  description:
    'Get SOCPA-compliant best accounting services in Saudi Arabia. Ensure ZATCA readiness, manage taxes, audits, and Zakat with YourLegal’s professional expertise.',
  alternates: {
    canonical: 'https://www.yourlegal.io/saudi-arabia/accounting',
  },
};

export default function SaudiArabiaAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

