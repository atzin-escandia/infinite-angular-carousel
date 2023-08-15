import { Hero } from '@modules/farmers-market/interfaces/hero.interface';

export const FARMERS_MARKET_HERO: {adoptions: Hero; boxes: Hero} = {
  adoptions: {
    background: 'green',
    description: 'page.adopt-header.body',
    imageSrc: '../../assets/img/farmers-market/adoptions-header.svg',
    size: 'm',
    title: 'page.adopt-header.title'
  },
  boxes: {
    background: 'orange',
    description: 'page.oh-header.body',
    imageSrc: '../../../assets/img/farmers-market/boxes-header.svg',
    size: 'm',
    title: 'page.oh-header.title'
  }
};
