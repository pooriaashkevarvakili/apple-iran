import type { Dataset, Keyword, NewKeywordInput } from '../../type';
import { createId } from './id';


export function updateTranslation(
  dataset: Dataset,
  id: string,
  lang: string,
  value: string
): Dataset {
  const target = dataset.keywords.find((k) => k.id === id);
  if (!target || target.translations[lang] === value) return dataset;

  return {
    ...dataset,
    keywords: dataset.keywords.map((kw) =>
      kw.id === id
        ? { ...kw, translations: { ...kw.translations, [lang]: value } }
        : kw
    )
  };
}

export function renameKeyword(dataset: Dataset, id: string, key: string): Dataset {
  const trimmed = key.trim();
  const target = dataset.keywords.find((k) => k.id === id);
  if (!target || !trimmed || target.key === trimmed) return dataset;

  return {
    ...dataset,
    keywords: dataset.keywords.map((kw) =>
      kw.id === id ? { ...kw, key: trimmed } : kw
    )
  };
}

export function addKeyword(dataset: Dataset, input: NewKeywordInput): Dataset {
  const trimmed = input.key.trim();
  if (!trimmed) return dataset;
  if (dataset.keywords.some((k) => k.key === trimmed)) return dataset;

  const translations: Record<string, string> = {};
  for (const lang of dataset.languages) translations[lang.code] = '';
  if (input.lang && input.lang in translations) {
    translations[input.lang] = input.value ?? '';
  }

  const keyword: Keyword = { id: createId('kw'), key: trimmed, translations };
  return { ...dataset, keywords: [...dataset.keywords, keyword] };
}

export function deleteKeyword(dataset: Dataset, id: string): Dataset {
  if (!dataset.keywords.some((k) => k.id === id)) return dataset;
  return { ...dataset, keywords: dataset.keywords.filter((k) => k.id !== id) };
}

export function reorder(dataset: Dataset, fromId: string, toId: string): Dataset {
  if (fromId === toId) return dataset;

  const list = dataset.keywords.slice();
  const from = list.findIndex((k) => k.id === fromId);
  const to = list.findIndex((k) => k.id === toId);
  if (from === -1 || to === -1) return dataset;

  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  return { ...dataset, keywords: list };
}

export function addLanguage(
  dataset: Dataset,
  language: { code: string; name?: string; dir?: 'ltr' | 'rtl' }
): Dataset {
  const code = language.code.trim();
  if (!code || dataset.languages.some((l) => l.code === code)) return dataset;

  return {
    ...dataset,
    languages: [
      ...dataset.languages,
      {
        code,
        name: language.name?.trim() || code,
        dir: language.dir === 'rtl' ? 'rtl' : 'ltr'
      }
    ],
    keywords: dataset.keywords.map((kw) => ({
      ...kw,
      translations: { ...kw.translations, [code]: '' }
    }))
  };
}

export function removeLanguage(dataset: Dataset, code: string): Dataset {
  if (dataset.languages.length <= 1) return dataset;
  if (!dataset.languages.some((l) => l.code === code)) return dataset;

  return {
    ...dataset,
    languages: dataset.languages.filter((l) => l.code !== code),
    keywords: dataset.keywords.map((kw) => {
      const next = { ...kw.translations };
      delete next[code];
      return { ...kw, translations: next };
    })
  };
}