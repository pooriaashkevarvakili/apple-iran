import type { Dataset, Direction, Keyword, Language } from '../../type';


export function normalizeDataset(input: unknown): Dataset | null {
  if (!input || typeof input !== 'object') return null;

  const raw = input as { languages?: unknown; keywords?: unknown };
  if (!Array.isArray(raw.languages) || !Array.isArray(raw.keywords)) return null;

  const seenLang = new Set<string>();
  const languages: Language[] = [];
  for (const lang of raw.languages) {
    if (!lang || typeof lang !== 'object') continue;
    const candidate = lang as Partial<Language>;
    const code = typeof candidate.code === 'string' ? candidate.code.trim() : '';
    if (!code || seenLang.has(code)) continue;
    seenLang.add(code);
    languages.push({
      code,
      name:
        typeof candidate.name === 'string' && candidate.name.trim()
          ? candidate.name.trim()
          : code,
      dir: candidate.dir === 'rtl' ? 'rtl' : ('ltr' satisfies Direction)
    });
  }

  if (languages.length === 0) return null;

  const seenId = new Set<string>();
  const keywords: Keyword[] = [];
  for (const kw of raw.keywords) {
    if (!kw || typeof kw !== 'object') continue;
    const candidate = kw as Partial<Keyword>;
    const id = typeof candidate.id === 'string' && candidate.id ? candidate.id : null;
    const key =
      typeof candidate.key === 'string' && candidate.key.trim()
        ? candidate.key.trim()
        : null;
    if (!id || !key || seenId.has(id)) continue;
    seenId.add(id);

    const src =
      candidate.translations && typeof candidate.translations === 'object'
        ? (candidate.translations as Record<string, unknown>)
        : {};

    const translations: Record<string, string> = {};
    for (const lang of languages) {
      const value = src[lang.code];
      translations[lang.code] = typeof value === 'string' ? value : '';
    }

    keywords.push({ id, key, translations });
  }

  return { languages, keywords };
}

export function isValidDataset(input: unknown): input is Dataset {
  return normalizeDataset(input) !== null;
}