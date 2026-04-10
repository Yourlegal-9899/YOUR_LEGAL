import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accounting services in the Netherlands| YourLegal',
  description:
    'Get expert accounting services in the Netherlands. We handle Dutch GAAP, KVK filings, and tax compliance for your B.V. Avoid penalties and ensure growth today!',
};

export default function NetherlandsAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
