import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Virtual CFO Service in Australia | YourLegal',
  description:
    'Best Virtual CFO service in Australia for startups & scale-ups. Get strategic financial modeling, fundraising support, and KPI tracking to scale your business.',
};

export default function AustraliaVirtualCfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
