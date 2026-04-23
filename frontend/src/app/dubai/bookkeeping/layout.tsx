import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Bookkeeping Services in Dubai | YourLegal',
  description:
    'Reliable bookkeeping services in Dubai for startups, small businesses, and e-commerce. We manage daily records and VAT to help you avoid costly FTA penalties.',
  alternates: {
    canonical: 'https://www.yourlegal.io/dubai/bookkeeping',
  },
};

export default function DubaiBookkeepingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

