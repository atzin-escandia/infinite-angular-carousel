import { Component, Injector, ViewEncapsulation } from '@angular/core';

import { BaseComponent } from '../base';
import { RouterService } from '@app/services';

declare let window: any;

@Component({
  selector: 'footer-component',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FooterComponent extends BaseComponent {
  public socialLinks = [
    {
      href: 'https://www.facebook.com/crowdfarmingco',
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAD0lEQVR42mNkwAIYh7IgAAVVAAuInjI5AAAAAElFTkSuQmCC',
      alt: 'facebook icon',
      id: 'footer-facebook-link',
      class: 'eva eva-facebook',
    },
    {
      href: 'https://www.instagram.com/crowd_farming/',
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAD0lEQVR42mNkwAIYh7IgAAVVAAuInjI5AAAAAElFTkSuQmCC',
      alt: 'instagram icon',
      id: 'footer-instagram-link',
      class: 'cf-icon-instagram',
    },
    {
      href: 'https://twitter.com/crowdfarmingco',
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAD0lEQVR42mNkwAIYh7IgAAVVAAuInjI5AAAAAElFTkSuQmCC',
      alt: 'twitter icon',
      id: 'footer-twitter-link',
      class: 'eva eva-twitter',
    },
    {
      href: 'https://www.youtube.com/channel/UC3lDppAvJP6vHK04oELV3EQ',
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAD0lEQVR42mNkwAIYh7IgAAVVAAuInjI5AAAAAElFTkSuQmCC',
      alt: 'youtube icon',
      id: 'footer-youtube-link',
      class: 'cf-icon-youtube-play',
    },
  ];

  public contact = {
    es: '/contacto',
    en: '/contact',
    fr: '/contact',
    de: '/kontakt',
    nl: '/contact',
    it: '/contatto',
    sv: '/kontakt',
  };

  constructor(public injector: Injector, public routerSrv: RouterService) {
    super(injector);
  }

  /**
   * Opens 'comeInFarmerLanding' page
   */
  public farmerLanding(): void {
    window.open(this.textSrv.getText('comeInFarmerLanding'));
  }

  /**
   * Opens blog page
   */
  public goToBlog(): void {
    let lang = this.langSrv.getCurrentLang();

    if (['nl', 'it', 'sv'].includes(lang)) {
      lang = 'en';
    }

    window.open('https://www.crowdfarming.com/' + 'blog/' + lang);
  }

  /**
   * impactReport open
   */
  public impactReport(): void {
    switch (this.langSrv.getCurrentLang()) {
      case 'es':
        window.open('https://common.crowdfarming.com/transparency/es/ES%20-%20Informe%20de%20Impacto%20y%20Transparencia.pdf');
        break;
      case 'en':
        window.open('https://common.crowdfarming.com/transparency/en/EN%20-%20Impact%20and%20Transparency%20Report.pdf');
        break;
      case 'de':
        window.open('https://common.crowdfarming.com/transparency/de/DE%20-%20Wirkungs-%20und%20Transparenzbericht.pdf');
        break;
      case 'fr':
        window.open('https://common.crowdfarming.com/transparency/fr/FR%20-%20Rapport%20d\'impact%20et%20de%20transparence.pdf');
        break;
      default:
        window.open('https://common.crowdfarming.com/transparency/en/EN%20-%20Impact%20and%20Transparency%20Report.pdf');
        break;
    }
  }
}
