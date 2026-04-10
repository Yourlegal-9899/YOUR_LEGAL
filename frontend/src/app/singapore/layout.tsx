import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Incorporation Services in Singapore | YourLegal',
  description:
    'Looking for company incorporation services in Singapore? Get fast, reliable, and expert support to establish your business in Asia’s leading hub.',
};

export default function SingaporeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
