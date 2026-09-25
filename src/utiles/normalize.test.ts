import { describe, expect, it } from 'vitest';
import { isValidDataset, normalizeDataset } from './normalize';

describe('normalizeDataset', () => {
  it('rejects null, strings and missing arrays', () => {
    expect(normalizeDataset(null)).toBeNull();
    expect(normalizeDataset('nope')).toBeNull();
    expect(normalizeDataset({ languages: [] })).toBeNull();
    expect(normalizeDataset({ languages: [{ code: 'en' }] })).toBeNull();
  });

  it('rejects an empty language list', () => {
    expect(normalizeDataset({ languages: [], keywords: [] })).toBeNull();
  });

  it('backfills a translation slot for every language', () => {
    const result = normalizeDataset({
      languages: [{ code: 'en' }, { code: 'de' }],
      keywords: [{ id: 'x', key: 'k.x', translations: { en: 'hi' } }]
    });
    expect(result?.keywords[0].translations).toEqual({ en: 'hi', de: '' });
  });

  it('drops duplicate language codes and duplicate keyword ids', () => {
    const result = normalizeDataset({
      languages: [{ code: 'en' }, { code: 'en' }],
      keywords: [
        { id: 'x', key: 'k.x', translations: { en: '1' } },
        { id: 'x', key: 'k.y', translations: { en: '2' } }
      ]
    });
    expect(result?.languages).toHaveLength(1);
    expect(result?.keywords).toHaveLength(1);
  });

  it('drops unknown translation codes', () => {
    const result = normalizeDataset({
      languages: [{ code: 'en' }],
      keywords: [{ id: 'x', key: 'k.x', translations: { en: 'hi', fr: 'salut' } }]
    });
    expect(result?.keywords[0].translations).toEqual({ en: 'hi' });
  });

  it('coerces non-string translation values to empty string', () => {
    const result = normalizeDataset({
      languages: [{ code: 'en' }],
      keywords: [{ id: 'x', key: 'k.x', translations: { en: 42 } }]
    });
    expect(result?.keywords[0].translations.en).toBe('');
  });

  it('preserves keyword order', () => {
    const result = normalizeDataset({
      languages: [{ code: 'en' }],
      keywords: [
        { id: 'b', key: 'k.b', translations: { en: '' } },
        { id: 'a', key: 'k.a', translations: { en: '' } }
      ]
    });
    expect(result?.keywords.map((k) => k.id)).toEqual(['b', 'a']);
  });

  it('flags valid datasets via the type guard', () => {
    expect(isValidDataset({ languages: [{ code: 'en' }], keywords: [] })).toBe(true);
    expect(isValidDataset(null)).toBe(false);
  });
});