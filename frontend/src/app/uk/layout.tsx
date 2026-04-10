import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UK Company Formation for Non Residents & Resident| YourLegal',
  description:
    'Easily form a UK company in 24 hours with Yourlegal. Expert UK company formation for non-residents and residents with bank account setup and tax registration.',
};

export default function UkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
