import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Netherlands Company Formation for Non-Residents| Dutch B.V.',
  description:
    'Expert Netherlands company formation for non-residents. We handle Dutch B.V. setup, notary deeds, KVK registration, and tax compliance for global founders.',
  alternates: {
    canonical: 'https://www.yourlegal.io/netherlands',
  },
};

export default function NetherlandsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

