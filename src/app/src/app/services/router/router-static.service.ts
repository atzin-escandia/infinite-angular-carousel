import {UrlMatcher, UrlSegment} from '@angular/router';

export class RouterStaticService {
  static matcher(urlsMatch: UrlsMatchType): UrlMatcher {
    return (url, group) => {
      const lang = group.segments[0].path;
      const segment = group.segments[1].path;

      const extraSegment = [];

      for (const [index, value] of group.segments.entries()) {
        if (index > 1) {
          extraSegment.push(value.path);
        }
      }

      if (urlsMatch[lang] && urlsMatch[lang] === segment) {
        return ({consumed: url});
      }

      if (urlsMatch[lang]) {
        for (const urlMatchKey in urlsMatch) {
          if (urlsMatch[urlMatchKey] && segment === urlsMatch[urlMatchKey]) {
            if (typeof window !== 'undefined') {
              url[0].path = urlsMatch[lang];
            }

            return ({
              consumed: url,
              posParams: {
                cfRedirURL: new UrlSegment(['', lang, urlsMatch[lang], ...extraSegment].join('/') , {})
              }
            });
          }
        }
      }

      return null;
    };
  }
}

export type UrlsMatchType = {
  es: string;
  de: string;
  fr: string;
  en: string;
  it: string;
  nl: string;
  sv: string;
};
