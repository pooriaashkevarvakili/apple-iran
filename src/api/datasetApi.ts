import { seedData } from '../data/sad';
import type { Dataset } from '../../type';
import { normalizeDataset } from '../utiles/normalize';

const STORAGE_KEY = 'translation-manager:dataset:v1';
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export async function fetchDataset(): Promise<Dataset> {
  await sleep(120);

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
  }

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeDataset(parsed);
      if (normalized) return normalized;
    } catch {
    }
  }

  const fresh = normalizeDataset(seedData);
  if (!fresh) {
    throw new Error('Seed dataset failed to normalize');
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
  
  }
  return fresh;
}

export async function saveDataset(dataset: Dataset): Promise<Dataset> {
  await sleep(80);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  return dataset;
}