import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'India Company Formation for Foreigners | YourLegal',
  description:
    'Seamless India company formation for foreigners. We provide resident directors, MCA filings, and GST setup to launch your business remotely. Get a free consult!',
  alternates: {
    canonical: 'https://www.yourlegal.io/in/company-formation',
  },
};

export default function IndiaCompanyFormationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

