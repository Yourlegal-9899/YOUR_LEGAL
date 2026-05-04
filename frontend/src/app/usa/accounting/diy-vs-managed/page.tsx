import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { accountingDiyVsManagedContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(accountingDiyVsManagedContent);

export default function AccountingDiyVsManagedPage() {
  return <UsaGuidePage content={accountingDiyVsManagedContent} />;
}
