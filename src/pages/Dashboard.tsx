import { App as AntApp, Button, Input, Progress, Space, Tooltip, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { FiDownload, FiPlus, FiRotateCcw, FiSearch, FiUpload } from 'react-icons/fi';
import { useCallback, useMemo, useState } from 'react';
import AddKeywordModal from '../components/AddKeywordModal';
import KeywordTable from '../components/KeywordTable';
import { useDataset } from '../context/DatasetProvider';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { NewKeywordInput } from '../../type';

export default function Dashboard() {
  const {
    languages,
    keywords,
    isLoading,
    updateTranslation,
    addKeyword,
    deleteKeyword,
    renameKeyword,
    reorder,
    exportDataset,
    importDataset,
    resetToSeed
  } = useDataset();

  const { message } = AntApp.useApp();

  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 180);
  const isSearching = debouncedQuery.trim().length > 0;

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return keywords;
    return keywords.filter(
      (kw) =>
        kw.key.toLowerCase().includes(q) ||
        Object.values(kw.translations).some((v) => v.toLowerCase().includes(q))
    );
  }, [keywords, debouncedQuery]);

  const existingKeys = useMemo(() => new Set(keywords.map((k) => k.key)), [keywords]);

  const completion = useMemo(() => {
    const total = keywords.length * languages.length;
    if (total === 0) return 0;
    const filled = keywords.reduce(
      (sum, k) =>
        sum + languages.filter((l) => (k.translations[l.code] ?? '').trim()).length,
      0
    );
    return Math.round((filled / total) * 100);
  }, [keywords, languages]);

  const handleImport: UploadProps['beforeUpload'] = useCallback(
    async (file) => {
      try {
        const text = await file.text();
        const parsed: unknown = JSON.parse(text);
        importDataset(parsed);
        message.success('Dataset imported');
      } catch {
        message.error('That file is not a valid dataset');
      }
      return false; // prevent antd auto-upload
    },
    [importDataset, message]
  );

  const handleAdd = useCallback(
    (payload: NewKeywordInput) => {
      addKeyword(payload);
      setAddOpen(false);
      message.success(`“${payload.key}” added`);
    },
    [addKeyword, message]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Translation dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {keywords.length} keywords · {languages.length} languages ·{' '}
            <span className="font-medium text-slate-700">{completion}% complete</span>
          </p>
        </div>

        <Space wrap>
          <Button type="primary" icon={<FiPlus />} onClick={() => setAddOpen(true)}>
            Add keyword
          </Button>
          <Tooltip title="Download the dataset as JSON">
            <Button icon={<FiDownload />} onClick={exportDataset}>
              Export
            </Button>
          </Tooltip>
          <Upload
            beforeUpload={handleImport}
            showUploadList={false}
            accept=".json,application/json"
          >
            <Button icon={<FiUpload />}>Import</Button>
          </Upload>
          <Tooltip title="Restore the bundled seed dataset">
            <Button
              icon={<FiRotateCcw />}
              onClick={() => {
                resetToSeed();
                message.info('Reset to the seed dataset');
              }}
            />
          </Tooltip>
        </Space>
      </div>

      <Progress
        percent={completion}
        showInfo={false}
        strokeColor="#4f46e5"
        trailColor="#e2e8f0"
        className="mt-5"
      />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          allowClear
          size="large"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword or translation…"
          prefix={<FiSearch className="text-slate-400" />}
          className="max-w-md"
        />
        {isSearching && (
          <span className="text-xs font-medium text-amber-600">
            Reordering is disabled while a filter is active.
          </span>
        )}
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-200/70" />
            ))}
          </div>
        ) : (
          <KeywordTable
            keywords={isSearching ? filtered : keywords}
            languages={languages}
            onUpdateTranslation={updateTranslation}
            onRename={renameKeyword}
            onDelete={deleteKeyword}
            onReorder={reorder}
          />
        )}
      </div>

      <AddKeywordModal
        open={addOpen}
        languages={languages}
        existingKeys={existingKeys}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
}