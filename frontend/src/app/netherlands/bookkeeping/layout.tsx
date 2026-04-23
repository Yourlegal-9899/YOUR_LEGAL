import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookkeeping Services in the Netherlands| Dutch B.V.',
  description:
    'Get expert bookkeeping services in the Netherlands for your Dutch B.V. We handle daily transactions, BTW returns, and KVK filings to ensure full compliance.',
  alternates: {
    canonical: 'https://www.yourlegal.io/in/bookkeeping',
  },
};

export default function NetherlandsBookkeepingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

