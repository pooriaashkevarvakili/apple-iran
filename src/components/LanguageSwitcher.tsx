import { Segmented } from 'antd';
import type { Language } from '../../type';

interface Props {
  languages: Language[];
  active: string;
  onChange: (code: string) => void;
}

export default function LanguageSwitcher({ languages, active, onChange }: Props) {
  if (languages.length === 0) return null;

  const options = languages.map((l) => ({
    label: (
      <span className="inline-flex items-center gap-1.5">
        <span>{l.name}</span>
        <span className="hidden text-[10px] uppercase opacity-60 sm:inline">{l.code}</span>
      </span>
    ),
    value: l.code
  }));

  return (
    <Segmented<string>
      value={active}
      onChange={onChange}
      options={options}
      size="large"
    />
  );
}