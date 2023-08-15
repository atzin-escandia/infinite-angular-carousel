import {Injectable} from '@angular/core';

import {ApiResource} from '../api';
import {BaseResource} from '../base';

@Injectable({
  providedIn: 'root'
})
export class BlogResource extends BaseResource {
  public blogPosts: any;
  public categoriesBlog: any = {};
  private baseUrl = 'https://www.crowdfarming.com/blog/{l}/wp-json/wp/v2/';

  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public getPosts(lang: string): Promise<any> {
    let link = `${this.baseUrl}posts?orderby=date&per_page=3&_embed=wp:featuredmedia`;

    link += '&_fields=id,excerpt,title,link,_links.wp:featuredmedia.0';

    return this.apiRsc.get({
      service: (link).replace('{l}', this._fixLang(lang)),
      loader: false
    });
  }

  public getCategories(lang: string): Promise<any> {
    return this.apiRsc.get({
      service: (`${this.baseUrl}categories`).replace('{l}', this._fixLang(lang)),
      loader: false
    });
  }

  private _fixLang(lang): string {
    switch (lang) {
      case 'nl':
      case 'it':
      case 'sv':
        lang = 'en';
    }

    return lang;
  }
}
