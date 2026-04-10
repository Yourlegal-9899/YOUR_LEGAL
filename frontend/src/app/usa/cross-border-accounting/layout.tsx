import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Accounting Services in the USA | Your Legal',
  description:
    'Get expert cross-border accounting services in the USA with Your Legal. Manage multi-currency operations, transfer pricing, and tax compliance with ease.',
};

export default function CrossBorderAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
