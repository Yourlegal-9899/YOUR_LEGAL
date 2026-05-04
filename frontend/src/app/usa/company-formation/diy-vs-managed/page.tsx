import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { companyFormationDiyVsManagedContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(companyFormationDiyVsManagedContent);

export default function CompanyFormationDiyVsManagedPage() {
  return <UsaGuidePage content={companyFormationDiyVsManagedContent} />;
}
