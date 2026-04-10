import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Australia Company Formation & Compliance | YourLegal',
  description:
    'Fast Australia company formation for global founders. Get a Pty Ltd setup with a resident director, tax registration (ABN/GST), and full ATO compliance.',
};

export default function AustraliaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
