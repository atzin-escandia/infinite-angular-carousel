import { environment } from '../../../../../environments/environment';

export interface BulletCard {
  img: string;
  title: string;
}
export interface AccordionItems {
  title: string;
  description: string;
}

export const BULLETS: BulletCard[] = [
  {
    img: `${environment.domain}/assets/img/subscription-box/bullet-1.svg`,
    title: 'discoverybox.page.landing.tab-1',
  },
  {
    img: `${environment.domain}/assets/img/subscription-box/bullet-2.svg`,
    title: 'discoverybox.page.landing.tab-2',
  },
  {
    img: `${environment.domain}/assets/img/subscription-box/bullet-3.svg`,
    title: 'discoverybox.page.landing.tab-3',
  },
];

export const BULLET_POINTS: string[] = [
  'discoverybox.page.landing-whats-included-1.text-info',
  'discoverybox.page.landing-whats-included-2.text-info',
  'discoverybox.page.landing-whats-included-3.text-info',
  'discoverybox.page.landing-whats-included-4.text-info',
  'discoverybox.page.landing-whats-included-5.text-info',
];

export const FAQ_ITEMS: AccordionItems[] = [
  {
    title: 'discoverybox.page.landing-faq-1.title',
    description: 'discoverybox.page.landing-faq-1.body',
  },
  {
    title: 'discoverybox.page.landing-faq-2.title',
    description: 'discoverybox.page.landing-faq-2.body',
  },
  {
    title: 'discoverybox.page.landing-faq-3.title',
    description: 'discoverybox.page.landing-faq-3.body',
  },
  {
    title: 'discoverybox.page.landing-faq-4.title',
    description: 'discoverybox.page.landing-faq-4.body',
  },
  {
    title: 'discoverybox.page.landing-faq-5.title',
    description: 'discoverybox.page.landing-faq-5.body',
  },
  {
    title: 'discoverybox.page.landing-faq-6.title',
    description: 'discoverybox.page.landing-faq-6.body',
  },
  {
    title: 'discoverybox.page.landing-faq-7.title',
    description: 'discoverybox.page.landing-faq-7.body',
  },
];
