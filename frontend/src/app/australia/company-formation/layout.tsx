import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Australia Company Formation for Non-Residents | YourLegal',
  description:
    'Expert Australia company formation for non-residents. We provide the mandatory resident director, ASIC registration, and ATO tax setup. Launch remotely today!',
  alternates: {
    canonical: 'https://www.yourlegal.io/australia/company-formation',
  },
};

export default function AustraliaCompanyFormationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

