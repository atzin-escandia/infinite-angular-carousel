import {Inject, Injectable, Injector, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {Title, Meta} from '@angular/platform-browser';

import {BaseService} from '../base';
import {TextService} from '../text';

import * as seoES5 from '../../../assets/seo.json';
const seo: any = seoES5;

@Injectable({
  providedIn: 'root'
})
export class SeoService extends BaseService {
  private seoData: any;
  private _renderer2: Renderer2;

  public init(): void {
    if (typeof seo.data !== 'undefined') {
      this.seoData = seo;
    } else {
      this.seoData = seo.default;
    }
  }

  constructor(
    public injector: Injector,
    private meta: Meta,
    private title: Title,
    private textSrv: TextService,
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private _document: Document
  ) {
    super(injector);
    this._renderer2 = rendererFactory.createRenderer(null, null);
  }

  /**
   * Render a LD+JSON info for SEO and SearchEngines
   * https://schema.org/
   * https://developers.google.com/search/docs/advanced/structured-data/search-gallery
   *
   * @param key Json Key
   * @param value Json Content
   */
  public addJson(key: string, value: any): void {
    this.renderJson(key, JSON.stringify(value));
  }
  /**
   * Remove json bi ID
   */
  public removeJson(key: string): void {
    const id = `seo_lt_${key}`;

    try {
      const el = this._renderer2.selectRootElement(`#${id}`);

      this._renderer2.removeChild(this._document.body, el);
    } catch (e) {
      // Nothing
    }
  }

  /**
   * Add JSON to body.
   *
   * @param key Json Key
   * @param json
   */
  private renderJson(key: string, json: string): void {
    const id = `seo_lt_${key}`;

    try {
      const el = this._renderer2.selectRootElement(`#${id}`);

      el.text = json;
    } catch (e) {
      const script = this._renderer2.createElement('script');

      script.type = 'application/ld+json';
      script.id = id;
      script.text = json;
      this._renderer2.appendChild(this._document.body, script);
    }
  }

  /**
   * Function to set seo params
   */
  public set(page: string, extra?: any): void {
    const data = this.mapRoutes(page);

    if (extra || data) {
      this.setTitle(extra?.title || this.textSrv.getText('metaTitle.' + String(data?.title)));
      this.setMetaDescription(extra?.description || this.textSrv.getText('metaDescription.' + String(data?.description)));

      if ((extra?.og && Object.keys(extra.og).length > 0) || (data?.og && Object.keys(data.og).length > 0)) {
        this.setOpenGraph(this.getDataOg(data, extra));
      }
    }
  }

  private getDataOg(data: any, extra: any): any {
    const params: any = {};

    if (data?.og?.title || extra?.og?.title) {
      params.title = extra?.og?.title || this.textSrv.getText('metaTitle.' + String(data.og.title));
    }

    if (data?.og?.description || extra?.og?.description) {
      params.description = extra?.og?.description || this.textSrv.getText('metaDescription.' + String(data.og.description));
    }

    if (data?.og?.url || extra?.og?.url) {
      params.url = extra?.og?.url || data.og.url;
    }

    if (data?.og?.video || extra?.og?.video) {
      params.video = extra?.og?.video || data.og.video;
    }

    if (data?.og?.image || extra?.og?.image) {
      params.image = extra?.og?.image || data.og.image;
    }

    return params;
  }

  /**
   * Set open graph data
   */
  private setOpenGraph(OGdata: any): void {
    // Add default image
    if (OGdata.image === null || OGdata.image === undefined || OGdata.image === '') {
      OGdata.image = 'https://www.crowdfarming.com/assets/icon/ms-icon-new-310x310.png';
    }

    let imageArray = [];

    // SEt images
    if (Array.isArray(OGdata.image)) {
      OGdata.image.map(image => {
        if (image === '') {
          return;
        }

        imageArray.push({property: 'og:image', content: image}, {property: 'twitter:image', content: image});
      });
    } else {
      imageArray = [
        {property: 'og:image', content: OGdata.image},
        {property: 'twitter:image', content: OGdata.image}
      ];
    }

    const currentTags = this.meta.getTags('property');

    // Remove current tags if exists
    for (const tag of currentTags) {
      if (tag.attributes[0].value.includes('twitter') || tag.attributes[0].value.includes('og')) {
        this.meta.removeTagElement(tag);
      }
    }

    // Add meta tags
    this.meta.addTags([
      {property: 'twitter:title', content: OGdata.title},
      {property: 'twitter:description', content: OGdata.description},
      {property: 'twitter:site', content: '@crowdfarmingco'},
      {property: 'twitter:creator', content: '@crowdfarmingco'},
      {property: 'twitter:card', content: 'summary'},

      {property: 'og:title', content: OGdata.title},
      {property: 'og:description', content: OGdata.description},
      {property: 'og:type', content: 'website'}
    ]);

    this.meta.addTags(imageArray);

    if (OGdata.video) {
      this.meta.addTag({property: 'og:video', content: OGdata.video});
    }
  }

  /**
   * Set title
   */
  private setTitle(newTitle: string): void {
    this.title.setTitle(newTitle);
  }

  /**
   * Set meta description
   */
  private setMetaDescription(description: string): void {
    this.meta.updateTag({content: description}, 'name=description');
  }

  /**
   * Set canonical URL for better SEO
   */
  public addCanonical(url: string): void {
    const link = this._document.createElement('link');

    link.setAttribute('rel', 'canonical');
    this._document.head.appendChild(link);
    link.setAttribute('href', url);
  }

  /**
   * Map beetween routes and seo
   */
  private mapRoutes(route): any {
    route = route.split('?')[0].substr(4, route.length) || 'home';

    if (this.seoData) {
      // Iterate over mapper file
      for (const item of this.seoData.data) {
        if (item && item.page && route) {
          // Check against regex if defined
          if (item.regex) {
            // Regex is stored in base64 in json
            const rx = new RegExp(this._base64Decode(item.regex), 'g');

            if (rx.test(route)) {
              return item;
            }
          } else if (item.page.toLowerCase() === route.toLowerCase()) {
            return item;
          }
        }
      }
    }
  }

  /**
   * fix for universal :(
   */
  private _base64Decode(a): string {
    if (typeof atob !== 'undefined') {
      return atob(a);
    } else {
      /* eslint-disable */
      var b,
        c,
        d,
        e = {},
        f = 0,
        g = 0,
        h = '',
        i = String.fromCharCode,
        j = a.length;
      for (b = 0; 64 > b; b++) e['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.charAt(b)] = b;
      for (c = 0; j > c; c++)
        for (b = e[a.charAt(c)], f = (f << 6) + b, g += 6; g >= 8;) ((d = 255 & (f >>> (g -= 8))) || j - 2 > c) && (h += i(d));
      return h;
      /* eslint-enable */
    }
  }
}
