import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Accounting Services in Australia | YourLegal',
  description:
    'Professional accounting services in Australia by YourLegal. We handle your financial statements and tax obligations so you can focus on scaling your business.',
};

export default function AustraliaAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
