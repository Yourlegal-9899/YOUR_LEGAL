import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corporate Tax Filing Services Singapore | ACRA & IRAS',
  description:
    'Corporate tax filing services Singapore for ACRA & IRAS compliance. Get help with annual returns, GST filing, and expert solutions for your business.',
};

export default function SingaporeTaxComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
