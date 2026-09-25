export type Direction = 'ltr' | 'rtl';

export interface Language {
  code: string;
  name: string;
  dir: Direction;
}

export interface Keyword {
  id: string;
  key: string;
  translations: Record<string, string>;
}

export interface Dataset {
  languages: Language[];
  keywords: Keyword[];
}

export interface NewKeywordInput {
  key: string;
  lang: string;
  value: string;
}