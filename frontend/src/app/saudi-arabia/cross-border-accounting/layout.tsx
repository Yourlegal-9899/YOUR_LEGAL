import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Accounting Services in Saudi Arabia | YourLegal',
  description:
    'Expert cross-border accounting in Saudi Arabia for KSA businesses. We manage withholding tax, transfer pricing, and ZATCA compliance for global operations.',
  alternates: {
    canonical: 'https://www.yourlegal.io/saudi-arabia/cross-border-accounting',
  },
};

export default function SaudiArabiaCrossBorderAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

