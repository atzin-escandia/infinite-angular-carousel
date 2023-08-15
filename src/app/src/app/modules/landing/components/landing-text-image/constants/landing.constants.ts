export enum BLOCK_MODE {
  TITLE_BODY = 'TITLE_BODY',
  TITLE_BODY_SUBTITLE = 'TITLE_BODY_SUBTITLE',
  TITLE_SUBTITLE = 'TITLE_SUBTITLE',
  FULL_BLOCKS = 'FULL_BLOCKS',
  FULL_BLOCKS_INVERSE = 'FULL_BLOCKS_INVERSE',
  TITLE_SUBTITLE_INVERSE = 'TITLE_SUBTITLE_INVERSE',
  TITLE_BODY_INVERSE = 'TITLE_BODY_INVERSE',
  TITLE_BODY_SUBTITLE_INVERSE = 'TITLE_BODY_SUBTITLE_INVERSE',
  IMAGE_BG = 'IMAGE_BG',
}

export interface IInfoTextImage {
  preheader?: string;
  subtitle?: string;
  header?: string;
  URLKey?: string;
  paragraph?: string;
  list?: string [];
  bodyList?: any;
  image: {
    url: string;
    alt: string;
  };
  button?: {
    text: string;
    link: string;
  };
  newTab?: boolean;
}

export interface IBlocksToDisplay {
  title: boolean;
  subtitle: boolean;
  image: boolean;
  paragraph: boolean;
  button: boolean;
  inverse: boolean;
  imageBg: boolean;
}

export const DISPLAY_BLOCKS: Map<BLOCK_MODE, IBlocksToDisplay> = new Map([
  [
    BLOCK_MODE.FULL_BLOCKS,
    { title: true, subtitle: true, image: true, paragraph: true, button: true, inverse: false, imageBg: false },
  ],
  [
    BLOCK_MODE.TITLE_BODY,
    { title: true, paragraph: true, subtitle: false, image: true, button: false, inverse: false, imageBg: false },
  ],
  [
    BLOCK_MODE.TITLE_BODY_SUBTITLE,
    { title: true, paragraph: true, subtitle: true, image: false, button: false, inverse: false, imageBg: false },
  ],
  [
    BLOCK_MODE.TITLE_SUBTITLE,
    { title: true, paragraph: false, subtitle: true, image: false, button: false, inverse: false, imageBg: false },
  ],
  [
    BLOCK_MODE.TITLE_SUBTITLE_INVERSE,
    { title: true, paragraph: false, subtitle: true, image: false, button: false, inverse: true, imageBg: false },
  ],
  [
    BLOCK_MODE.FULL_BLOCKS_INVERSE,
    { title: true, subtitle: true, image: true, paragraph: true, button: true, inverse: true, imageBg: false },
  ],
  [
    BLOCK_MODE.TITLE_BODY_INVERSE,
    { title: true, paragraph: true, subtitle: false, image: true, button: false, inverse: true, imageBg: false },
  ],
  [
    BLOCK_MODE.TITLE_BODY_SUBTITLE_INVERSE,
    { title: true, paragraph: true, subtitle: true, image: false, button: false, inverse: true, imageBg: false },
  ],
  [
    BLOCK_MODE.IMAGE_BG,
    { title: true, paragraph: false, subtitle: true, image: true, button: false, inverse: false, imageBg: true },
  ],
]);
