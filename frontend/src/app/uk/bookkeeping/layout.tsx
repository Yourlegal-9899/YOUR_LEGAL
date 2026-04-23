import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional outsourced bookkeeping services Uk | YourLegal',
  description:
    'Partner with YourLegal for top outsourced bookkeeping services UK. Get MTD-compliant bookkeeping, accurate VAT returns, and hassle-free Corporation Tax filings.',
  alternates: {
    canonical: 'https://www.yourlegal.io/uk/bookkeeping',
  },
};

export default function UkBookkeepingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

