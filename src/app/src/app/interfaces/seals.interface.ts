export interface Seal {
  _id: string;
  _m_longDescription: {
    de: string;
    en: string;
    es: string;
    fr: string;
    it: string;
    nl: string;
    sv: string;
  };
  _m_shortDescription: {
    de: string;
    en: string;
    es: string;
    fr: string;
    it: string;
    nl: string;
    sv: string;
  };
  active: boolean;
  category: string;
  code: string;
  createdAt: string;
  filterCriteria: boolean;
  imageUrl: string;
  isFeatured: boolean;
  isOfficial: boolean;
  longDescription?: string;
  shortDescription?: string;
  updatedAt: string;
  files?: SealFile[];
  isFeaturedSeal?: boolean;
}

export interface CompleteSeals {
  header: HeaderSeal[];
  detailHeader: HeaderSeal[];
  official: Seal[];
  unOfficial: Seal[];
}

export interface HeaderSeal {
  id: string;
  src: string;
  label: string;
  isTag: boolean;
  key: string;
}

export interface ProjectSeals {
  _seal: string;
  files?: SealFile[];
  isFeaturedSeal?: boolean;
}

export interface SealsCategory {
  up?: ProjectSeals[];
  farmer?: ProjectSeals[];
}

interface SealFile {
  name: string;
  url: string;
}
