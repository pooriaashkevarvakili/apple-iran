import { NavLink } from 'react-router-dom';
import { Badge, Spin } from 'antd';
import { FiLayers } from 'react-icons/fi';
import { useDataset } from '../context/DatasetProvider';

function navClass({ isActive }: { isActive: boolean }): string {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
  ].join(' ');
}

export default function Navbar() {
  const { keywords, isSaving, isLoading } = useDataset();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            <FiLayers size={18} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">Translation Manager</p>
            <p className="text-[11px] text-slate-500">
              {isLoading ? 'Loading…' : `${keywords.length} keywords`}
            </p>
          </div>
        </div>

        <nav className="order-3 flex w-full gap-1 sm:order-none sm:ml-6 sm:w-auto">
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/public" className={navClass}>
            Public view
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
          {isSaving ? <Spin size="small" /> : <Badge status="success" />}
          <span className="text-xs font-medium text-slate-600">
            {isSaving ? 'Saving…' : 'Saved'}
          </span>
        </div>
      </div>
    </header>
  );
}