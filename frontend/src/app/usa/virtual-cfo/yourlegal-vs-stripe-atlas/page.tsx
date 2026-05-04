import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { virtualCfoYourlegalVsStripeAtlasContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(virtualCfoYourlegalVsStripeAtlasContent);

export default function VirtualCfoYourlegalVsStripeAtlasPage() {
  return <UsaGuidePage content={virtualCfoYourlegalVsStripeAtlasContent} />;
}
