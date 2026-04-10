import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Formation in USA for Non-Residents | YourLegal',
  description:
    'Form your Delaware or Wyoming LLC or C-Corp from anywhere. Expert US company formation in USA for Non Residents, with compliance guidance and banking support.',
};

export default function CompanyFormationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
