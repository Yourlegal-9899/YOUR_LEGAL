import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Formation Netherlands | Start Your Dutch B.V. Today',
  description:
    'Start your Dutch B.V. remotely. Our end-to-end service covers everything for company formation Netherlands, from notary tasks to business bank account support.',
  alternates: {
    canonical: 'https://www.yourlegal.io/netherlands/company-formation',
  },
};

export default function NetherlandsCompanyFormationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

