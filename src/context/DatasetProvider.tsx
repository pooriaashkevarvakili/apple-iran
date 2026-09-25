import { App as AntApp } from 'antd';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey
} from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren
} from 'react';
import { fetchDataset, saveDataset } from '../api/datasetApi';
import { seedData } from '../data/sad.ts';
import type { Dataset, NewKeywordInput } from '../../type.ts';
import * as ops from '../utiles/datasetOps.ts';
import { normalizeDataset } from '../utiles/normalize.ts';

const QUERY_KEY: QueryKey = ['dataset'];

interface DatasetContextValue {
  languages: Dataset['languages'];
  keywords: Dataset['keywords'];
  isLoading: boolean;
  isSaving: boolean;

  updateTranslation: (id: string, lang: string, value: string) => void;
  renameKeyword: (id: string, key: string) => void;
  addKeyword: (input: NewKeywordInput) => void;
  deleteKeyword: (id: string) => void;
  reorder: (fromId: string, toId: string) => void;
  addLanguage: (lang: { code: string; name?: string; dir?: 'ltr' | 'rtl' }) => void;
  removeLanguage: (code: string) => void;
  resetToSeed: () => void;
  exportDataset: () => void;
  importDataset: (json: unknown) => void;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);

interface MutationContext {
  previous: Dataset | undefined;
}

export function DatasetProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();

  const datasetQuery = useQuery<Dataset>({
    queryKey: QUERY_KEY,
    queryFn: fetchDataset,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  const { mutate, isPending: isSaving } = useMutation<Dataset, Error, Dataset, MutationContext>({
    mutationFn: saveDataset,

    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<Dataset>(QUERY_KEY);
      queryClient.setQueryData<Dataset>(QUERY_KEY, next);
      return { previous };
    },

    onError: (_err, _next, ctx) => {
      if (ctx?.previous) queryClient.setQueryData<Dataset>(QUERY_KEY, ctx.previous);
      message.error('Could not save changes');
    }
  });

  const apply = useCallback(
    (fn: (dataset: Dataset) => Dataset) => {
      const current = queryClient.getQueryData<Dataset>(QUERY_KEY);
      if (!current) return;
      const next = fn(current);
      if (next === current) return;
      mutate(next);
    },
    [queryClient, mutate]
  );

  const value = useMemo<DatasetContextValue>(() => {
    const dataset = datasetQuery.data;

    return {
      languages: dataset?.languages ?? [],
      keywords: dataset?.keywords ?? [],
      isLoading: datasetQuery.isLoading,
      isSaving,

      updateTranslation: (id, lang, val) =>
        apply((d) => ops.updateTranslation(d, id, lang, val)),
      renameKeyword: (id, key) => apply((d) => ops.renameKeyword(d, id, key)),
      addKeyword: (input) => apply((d) => ops.addKeyword(d, input)),
      deleteKeyword: (id) => apply((d) => ops.deleteKeyword(d, id)),
      reorder: (from, to) => apply((d) => ops.reorder(d, from, to)),
      addLanguage: (lang) => apply((d) => ops.addLanguage(d, lang)),
      removeLanguage: (code) => apply((d) => ops.removeLanguage(d, code)),

      resetToSeed: () => {
        const fresh = normalizeDataset(seedData);
        if (fresh) mutate(fresh);
      },

      exportDataset: () => {
        const data = queryClient.getQueryData<Dataset>(QUERY_KEY);
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translations-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },

      importDataset: (json) => {
        const normalized = normalizeDataset(json);
        if (!normalized) throw new Error('Invalid dataset');
        mutate(normalized);
      }
    };
  }, [datasetQuery.data, datasetQuery.isLoading, isSaving, apply, mutate, queryClient]);

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset(): DatasetContextValue {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error('useDataset must be used inside <DatasetProvider>');
  return ctx;
}