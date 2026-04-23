import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business License Renewal Dubai & Annual Compliance',
  description:
    'Expert business license renewal Dubai services. We manage trade license renewals, office leases, and annual compliance for Free Zone & Mainland companies.',
  alternates: {
    canonical: 'https://www.yourlegal.io/dubai/annual-compliance',
  },
};

export default function DubaiAnnualComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

