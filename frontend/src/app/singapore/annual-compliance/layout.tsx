import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annual Compliance Services & ACRA Compliance Singapore',
  description:
    'Ensure your company meets all ACRA compliance Singapore regulations. Get reliable annual filing and corporate secretarial services to avoid penalties and risks.',
  alternates: {
    canonical: 'https://www.yourlegal.io/singapore/annual-compliance',
  },
};

export default function SingaporeAnnualComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

