export interface SlidesInfo {
  name: string;
  titleKey: string;
  button: {
    textKey: string;
    urlKey: string;
    openNewTab: boolean;
  };
  image: string;
  position: number;
}

export interface SlidesInfoJson {
  code: number;
  data: {
    list: SlidesInfo[];
  };
}
