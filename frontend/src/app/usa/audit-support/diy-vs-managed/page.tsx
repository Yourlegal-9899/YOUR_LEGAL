import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { auditSupportDiyVsManagedContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(auditSupportDiyVsManagedContent);

export default function AuditSupportDiyVsManagedPage() {
  return <UsaGuidePage content={auditSupportDiyVsManagedContent} />;
}
