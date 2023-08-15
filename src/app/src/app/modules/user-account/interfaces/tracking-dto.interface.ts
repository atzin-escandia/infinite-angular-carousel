export interface TrackingDTO {
  status?: string;
  manualStatus?: boolean;
  notificated?: boolean;
  testLabelDate?: string;
  delivered?: boolean;
  doubleScan?: boolean;
  error?: boolean;
  errorMessage?: string;
  uniqueLabel?: boolean;
  documents?: any[];
  trackId?: string;
  events?: any[];
}
