import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'US Company Formation for Non-Residents | LLC & C-Corp',
  description:
    'US Company Formation for Non-Residents hassle-free! Get LLC/C-Corp formation, EIN, banking, compliance & full support—all in one platform. Get started today!',
};

export default function UsaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
