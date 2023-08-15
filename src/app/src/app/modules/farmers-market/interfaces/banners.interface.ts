import { Banner } from './banner.interface';

export interface Banners {
  adoptions: {
    top: Banner;
    bottom: Banner;
  };
  boxes: {
    top: Banner;
    bottom: Banner;
  };
}
