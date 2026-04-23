import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Accounting Services for Australian Businesses',
  description:
    'Boost global operations with expert Cross-Border Accounting Services for Australia from YourLegal. Ensure compliance, optimize taxes, and streamline finances.',
  alternates: {
    canonical: 'https://www.yourlegal.io/australia/cross-border-accounting',
  },
};

export default function AustraliaCrossBorderAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

