import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross Border Accounting Services in Dubai| YourLegal',
  description:
    'Expert cross border accounting services in dubai. We manage transfer pricing, multi-currency reporting, and international tax for your global business.',
  alternates: {
    canonical: 'https://www.yourlegal.io/dubai/cross-border-accounting',
  },
};

export default function DubaiCrossBorderAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

