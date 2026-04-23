import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'US Tax Filing for Non-Resident LLC Owners | YourLegal',
  description:
    'Accurate, deadline-driven US tax filing for non-resident LLC owners and C-Corps. Get expert guidance to stay compliant, avoid IRS penalties and simplify taxes.',
  alternates: {
    canonical: 'https://www.yourlegal.io/usa/tax-compliance',
  },
};

export default function TaxComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

