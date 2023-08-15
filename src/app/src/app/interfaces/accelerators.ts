export interface AcceleratorInfo {
  name: string;
  image: string;
  urlKey: string;
  titleKey: string;
  position: number;
}

export interface AcceleratorsInfoJson {
  code: number;
  data: {
    list: AcceleratorInfo[];
  };
}
