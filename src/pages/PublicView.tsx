import { Empty, Skeleton, Tooltip } from 'antd';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useDataset } from '../context/DatasetProvider';
import { useUI } from '../context/UIProvider';
import type { Keyword } from '../../type';

export default function PublicView() {
  const { languages, keywords, isLoading } = useDataset();
  const { activePublicLang, setActivePublicLang } = useUI();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeCode = useMemo<string | null>(() => {
    if (languages.length === 0) return null;
    return languages.some((l) => l.code === activePublicLang)
      ? (activePublicLang as string)
      : languages[0].code;
  }, [languages, activePublicLang]);

  useEffect(() => {
    if (activeCode && activeCode !== activePublicLang) setActivePublicLang(activeCode);
  }, [activeCode, activePublicLang, setActivePublicLang]);

  const activeLanguage = languages.find((l) => l.code === activeCode) ?? languages[0];

  const copy = async (kw: Keyword): Promise<void> => {
    try {
      await navigator.clipboard.writeText(kw.key);
      setCopiedId(kw.id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
    }
  };

  if (isLoading || !activeLanguage) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  const missingCount = keywords.filter(
    (kw) => !(kw.translations[activeLanguage.code] ?? '').trim()
  ).length;

  const title =
    keywords.find((k) => k.key === 'app.title')?.translations[activeLanguage.code] ||
    'Translations';

  return (
    <div dir={activeLanguage.dir} className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {keywords.length} entries · {activeLanguage.name}
            {missingCount > 0 && (
              <>
                {' · '}
                <span className="font-medium text-amber-600">{missingCount} missing</span>
              </>
            )}
          </p>
        </div>

        <LanguageSwitcher
          languages={languages}
          active={activeLanguage.code}
          onChange={setActivePublicLang}
        />
      </header>

      <div className="mt-8">
        {keywords.length === 0 ? (
          <Empty description="No keywords have been added yet" />
        ) : (
          <ul key={activeLanguage.code} className="animate-fade-in space-y-3">
            {keywords.map((kw) => {
              const value = (kw.translations[activeLanguage.code] ?? '').trim();
              const isMissing = value.length === 0;
              return (
                <li
                  key={kw.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <code className="truncate rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">
                      {kw.key}
                    </code>
                    <Tooltip title={copiedId === kw.id ? 'Copied!' : 'Copy key'}>
                      <button
                        type="button"
                        onClick={() => void copy(kw)}
                        className="shrink-0 rounded-md px-2 py-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 focus:opacity-100 group-hover:opacity-100"
                        aria-label="Copy key"
                      >
                        {copiedId === kw.id ? <FiCheck size={14} /> : <FiCopy size={14} />}
                      </button>
                    </Tooltip>
                  </div>

                  <p
                    className={[
                      'mt-2 text-lg leading-relaxed sm:text-xl',
                      isMissing ? 'italic text-slate-400' : 'font-medium text-slate-900'
                    ].join(' ')}
                  >
                    {isMissing ? 'No translation yet' : value}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
        Order matches the dashboard exactly · Switch languages instantly
      </footer>
    </div>
  );
}