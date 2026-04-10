import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annual Compliance Netherlands Company | KVK & Tax Filings',
  description:
    'Get support for annual compliance Netherlands company. Avoid penalties with timely KVK filings and professional corporate tax returns for your Dutch business.',
};

export default function NetherlandsAnnualComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
