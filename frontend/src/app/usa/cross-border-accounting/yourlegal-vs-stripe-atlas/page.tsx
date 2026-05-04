import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { crossBorderAccountingYourlegalVsStripeAtlasContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(crossBorderAccountingYourlegalVsStripeAtlasContent);

export default function CrossBorderAccountingYourlegalVsStripeAtlasPage() {
  return <UsaGuidePage content={crossBorderAccountingYourlegalVsStripeAtlasContent} />;
}
