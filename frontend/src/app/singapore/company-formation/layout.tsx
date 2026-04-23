import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Singapore Company Formation for Non-Resident | YourLegal',
  description:
    'Looking for Singapore company formation for non-residents? Get expert help with Nominee Director, Company Secretary, and ACRA filings for a smooth setup.',
  alternates: {
    canonical: 'https://www.yourlegal.io/singapore/company-formation',
  },
};

export default function SingaporeCompanyFormationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

