import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { auditSupportYourlegalVsStripeAtlasContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(auditSupportYourlegalVsStripeAtlasContent);

export default function AuditSupportYourlegalVsStripeAtlasPage() {
  return <UsaGuidePage content={auditSupportYourlegalVsStripeAtlasContent} />;
}
