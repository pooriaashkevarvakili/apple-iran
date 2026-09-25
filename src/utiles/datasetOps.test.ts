import { describe, expect, it } from 'vitest';
import type { Dataset } from '../../type';
import {
  addKeyword,
  addLanguage,
  deleteKeyword,
  removeLanguage,
  renameKeyword,
  reorder,
  updateTranslation
} from './datasetOps';

const base: Dataset = {
  languages: [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'fa', name: 'فارسی', dir: 'rtl' }
  ],
  keywords: [
    { id: 'a', key: 'k.a', translations: { en: 'A', fa: 'آ' } },
    { id: 'b', key: 'k.b', translations: { en: 'B', fa: 'ب' } }
  ]
};

describe('datasetOps.updateTranslation', () => {
  it('updates one field and leaves siblings intact', () => {
    const next = updateTranslation(base, 'a', 'en', 'Updated');
    expect(next.keywords[0].translations.en).toBe('Updated');
    expect(next.keywords[1].translations.en).toBe('B');
  });

  it('returns the same reference when nothing changes', () => {
    expect(updateTranslation(base, 'a', 'en', 'A')).toBe(base);
  });

  it('returns the same reference for an unknown id', () => {
    expect(updateTranslation(base, 'zzz', 'en', 'x')).toBe(base);
  });
});

describe('datasetOps.renameKeyword', () => {
  it('trims and applies a new key', () => {
    const next = renameKeyword(base, 'a', '  new.key  ');
    expect(next.keywords[0].key).toBe('new.key');
  });

  it('rejects empty input', () => {
    expect(renameKeyword(base, 'a', '   ')).toBe(base);
  });
});

describe('datasetOps.addKeyword', () => {
  it('creates empty slots for every language', () => {
    const next = addKeyword(base, { key: 'k.c', lang: 'fa', value: 'ج' });
    expect(next.keywords).toHaveLength(3);
    expect(next.keywords[2].translations).toEqual({ en: '', fa: 'ج' });
  });

  it('rejects duplicate keys', () => {
    expect(addKeyword(base, { key: 'k.a', lang: 'en', value: 'x' })).toBe(base);
  });

  it('rejects an empty key', () => {
    expect(addKeyword(base, { key: '   ', lang: 'en', value: 'x' })).toBe(base);
  });
});

describe('datasetOps.deleteKeyword', () => {
  it('removes a keyword', () => {
    const next = deleteKeyword(base, 'a');
    expect(next.keywords.map((k) => k.id)).toEqual(['b']);
  });
});

describe('datasetOps.reorder', () => {
  it('moves the dragged item to the target index', () => {
    const next = reorder(base, 'b', 'a');
    expect(next.keywords.map((k) => k.id)).toEqual(['b', 'a']);
  });

  it('no-ops on identical ids', () => {
    expect(reorder(base, 'a', 'a')).toBe(base);
  });

  it('no-ops on unknown ids', () => {
    expect(reorder(base, 'zzz', 'a')).toBe(base);
  });
});

describe('datasetOps languages', () => {
  it('adds a language and backfills every keyword', () => {
    const next = addLanguage(base, { code: 'de', name: 'Deutsch' });
    expect(next.languages).toHaveLength(3);
    expect(next.keywords.every((k) => 'de' in k.translations)).toBe(true);
  });

  it('rejects a duplicate language code', () => {
    expect(addLanguage(base, { code: 'en' })).toBe(base);
  });

  it('removes a language and its translation slots', () => {
    const next = removeLanguage(base, 'fa');
    expect(next.languages.map((l) => l.code)).toEqual(['en']);
    expect(next.keywords.every((k) => !('fa' in k.translations))).toBe(true);
  });

  it('refuses to remove the last remaining language', () => {
    const single: Dataset = {
      languages: [{ code: 'en', name: 'English', dir: 'ltr' }],
      keywords: [{ id: 'a', key: 'k.a', translations: { en: 'A' } }]
    };
    expect(removeLanguage(single, 'en')).toBe(single);
  });
});