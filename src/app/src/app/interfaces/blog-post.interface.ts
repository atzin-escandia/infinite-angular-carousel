export interface IBlogPost {
  id: number;
  link: string;
  title: IBlogPostRender;
  excerpt: IBlogPostRender;
  _links: IBlogPostLinks;
  _embedded: IBlogPostEmbedded;
}

interface IBlogPostEmbedded {
  'wp:featuredmedia': IBlogPostEmbeddedWpFeaturedMedia[];
}

interface IBlogPostEmbeddedWpFeaturedMedia {
  id: number;
  date: Date;
  slug: string;
  type: string;
  link: string;
  title: any;
  author: number;
  yoast_head: string;
  caption: any;
  alt_text: string;
  media_type: string;
  mime_type: any;
  media_details: any;
  source_url: string;
  _links: IBlogPostEmbeddedWpFeaturedMediaLinks;
}

interface IBlogPostEmbeddedWpFeaturedMediaLinks {
  self: any[];
  collection: any[];
  about: any[];
  author: any[];
  replies: any[];
}

interface IBlogPostLinks {
  'wp:featuredmedia': IBlogPostLinkAuthorElement[];
}

interface IBlogPostLinkAuthorElement {
  embeddable: boolean;
  href: string;
}

interface IBlogPostRender {
  rendered: string;
  protected?: boolean;
}
