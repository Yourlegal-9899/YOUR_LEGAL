import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accounting Services in Dubai| FTA & Audit-Ready| YourLegal',
  description:
    'Expert accounting services in dubai for Mainland & Free Zone companies. We manage IFRS, VAT, and Corporate Tax to ensure you stay compliant and audit-ready.',
};

export default function DubaiAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
