import { KeyValue } from '@angular/common';

export interface SharedDate {
  sharedSendDate?: string;
  sharedDeliveryDate?: string;
  articlesWithisNotSharedDates?: string[];
}

export interface SharedCountData {
  dateShared: string;
  countDatesShared: KeyValue<string, number>[];
}
