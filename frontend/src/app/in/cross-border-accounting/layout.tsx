import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Border Accounting Services in India | Yourlegal',
  description:
    'Expert cross-border accounting services in India. We manage FEMA compliance, RBI reporting, and transfer pricing for global firms & startups. Stay compliant!',
};

export default function IndiaCrossBorderAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
