import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Cross-Border Accounting Services in UK | YourLegal',
  description:
    'YourLegal provides expert cross-border accounting services in  UK, ensuring VAT compliance, tax treaty optimization, and transfer pricing for global businesses.',
};

export default function UkCrossBorderAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
