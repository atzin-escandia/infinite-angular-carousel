export type CrowdgivingSectionKey = 'ngos' | 'products' | 'payment';
export type CrowdgivingSectionPath = 'ngos' | 'products' | 'payment';

export interface ICrowdgivingSection {
  key: CrowdgivingSectionKey;
  label: string;
  path: CrowdgivingSectionPath;
}
