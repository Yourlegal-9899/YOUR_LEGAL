import rawDocData from '@/lib/usa-missing-routes-doc-data.json';

type RawDocRoute = {
  heading: string;
  lines: string[];
};

export const usaMissingRoutesDocData = rawDocData as Record<string, RawDocRoute>;
