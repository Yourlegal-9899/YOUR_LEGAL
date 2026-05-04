import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { bestCompanyFormationContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(bestCompanyFormationContent);

export default function BestCompanyFormationPage() {
  return <UsaGuidePage content={bestCompanyFormationContent} />;
}
