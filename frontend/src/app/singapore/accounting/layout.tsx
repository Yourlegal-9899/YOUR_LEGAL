import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Accounting Services in Singapore | YourLegal',
  description:
    'Get expert accounting services in Singapore with YourLegal. Ensure compliance with ACRA, IRAS, and SFRS for your company’s financial reporting and tax filings.',
};

export default function SingaporeAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
