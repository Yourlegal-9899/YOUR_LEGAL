import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Accounting Services in Singapore | YourLegal',
  description:
    'Expert cross-border accounting services in Singapore. Manage tax treaties, transfer pricing, and multi-currency reporting for global business growth.',
};

export default function SingaporeCrossBorderAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
