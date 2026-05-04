import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { crossBorderAccountingDiyVsManagedContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(crossBorderAccountingDiyVsManagedContent);

export default function CrossBorderAccountingDiyVsManagedPage() {
  return <UsaGuidePage content={crossBorderAccountingDiyVsManagedContent} />;
}
