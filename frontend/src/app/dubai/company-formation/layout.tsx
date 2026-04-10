import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Formation in Dubai Free Zone & Mainland | YourLegal',
  description:
    'Looking for company formation in Dubai free zone? We handle trade licenses, visas, and banking for international founders. Start your UAE company today!',
};

export default function DubaiCompanyFormationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
