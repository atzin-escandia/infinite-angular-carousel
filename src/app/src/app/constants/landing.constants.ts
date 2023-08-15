export type ModelContentType =
  | 'header'
  | 'pointImage'
  | 'agroupment'
  | 'titleAndSubtitle'
  | 'quote'
  | 'faq'
  | 'video'
  | 'textAndImage'
  | 'text'
  | 'counter'
  | 'newsletterForm';

export enum PROJECT_TYPE {
  ADOPTIONS = 'adoptions',
  BOXES = 'boxes',
}

export enum ProjectsByAgroup {
  AGROUPMENT_LONG_LENGTH = 12,
  AGROUPMENT_SHORT_LENGTH = 9,
}

export enum PROJECT_CARD_SIZE {
  WIDE = 'wide',
  NARROW = 'narrow',
  ADOPTIONS_LENGTH = 3,
  BOXES_LENGTH = 4,
}

export enum BlockType {
  VIDEO = 'video',
  AGROUPMENT = 'agroupment',
  HEADER = 'header',
}
