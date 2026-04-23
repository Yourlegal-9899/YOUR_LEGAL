import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookkeeping Services in Saudi Arabia| YourLegal',
  description:
    'Bookkeeping services in Saudi Arabia, ZATCA-compliant and tax-ready. Let YourLegal handle your financial records, VAT filings, and compliance needs.',
  alternates: {
    canonical: 'https://www.yourlegal.io/saudi-arabia/bookkeeping',
  },
};

export default function SaudiArabiaBookkeepingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

