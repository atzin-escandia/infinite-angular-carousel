export interface RestrictionDTO {
  minimumArticles: number;
  minimumPVP: number;
  active?: boolean;
  logisticCenter?: string;
  _country?: string;
  iso?: string;
}
