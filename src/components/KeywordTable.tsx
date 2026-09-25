import { Button, Input, Popconfirm, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode
} from 'react';
import { FiMenu, FiTrash2 } from 'react-icons/fi';
import type { Keyword, Language } from '../../type';

interface DragHandleApi {
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
  setActivatorNodeRef: ReturnType<typeof useSortable>['setActivatorNodeRef'];
}

const DragRowContext = createContext<DragHandleApi | null>(null);

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

function SortableRow({ children, ...props }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: props['data-row-key'] });

  const style: CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999, background: '#eef2ff' } : {})
  };

  const api: DragHandleApi = { attributes, listeners, setActivatorNodeRef };

  return (
    <DragRowContext.Provider value={api}>
      <tr {...props} ref={setNodeRef} style={style}>
        {children}
      </tr>
    </DragRowContext.Provider>
  );
}

function DragHandle(): ReactNode {
  const api = useContext(DragRowContext);
  if (!api) return null;

  return (
    <Tooltip title="Drag to reorder">
      <button
        ref={api.setActivatorNodeRef}
        {...api.attributes}
        {...api.listeners}
        type="button"
        aria-label="Reorder keyword"
        className="flex h-7 w-7 cursor-grab items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
      >
        <FiMenu size={16} />
      </button>
    </Tooltip>
  );
}


interface EditableCellProps {
  value: string;
  onCommit: (value: string) => void;
  dir?: 'ltr' | 'rtl';
  placeholder?: string;
  mono?: boolean;
  status?: '' | 'warning' | 'error';
}

function EditableCell({ value, onCommit, dir, placeholder, mono, status }: EditableCellProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  const commit = (): void => {
    if (local !== value) onCommit(local);
  };

  return (
    <Input
      dir={dir}
      value={local}
      status={status || undefined}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onPressEnter={(e) => e.currentTarget.blur()}
      placeholder={placeholder}
      spellCheck={false}
      className={mono ? 'font-mono' : undefined}
    />
  );
}

interface Props {
  keywords: Keyword[];
  languages: Language[];
  onUpdateTranslation: (id: string, lang: string, value: string) => void;
  onRename: (id: string, key: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
}

export default function KeywordTable({
  keywords,
  languages,
  onUpdateTranslation,
  onRename,
  onDelete,
  onReorder
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns: ColumnsType<Keyword> = [
    {
      key: 'drag',
      width: 48,
      render: () => <DragHandle />
    },
    {
      title: 'Keyword',
      dataIndex: 'key',
      key: 'key',
      width: 220,
      render: (_: unknown, record) => (
        <EditableCell
          value={record.key}
          onCommit={(v) => onRename(record.id, v)}
          placeholder="nav.profile"
          mono
        />
      )
    },
    ...languages.map<ColumnsType<Keyword>[number]>((lang) => ({
      title: (
        <span className="inline-flex items-center gap-1.5">
          <span>{lang.name}</span>
          <span className="text-[10px] uppercase text-slate-400">{lang.code}</span>
        </span>
      ),
      key: lang.code,
      render: (_: unknown, record) => {
        const value = record.translations[lang.code] ?? '';
        return (
          <EditableCell
            dir={lang.dir}
            value={value}
            onCommit={(v) => onUpdateTranslation(record.id, lang.code, v)}
            placeholder={`${lang.name}…`}
            status={value.trim() ? '' : 'warning'}
          />
        );
      }
    })),
    {
      key: 'actions',
      width: 64,
      align: 'center',
      render: (_: unknown, record) => (
        <Popconfirm
          title="Delete keyword?"
          description="All translations for this keyword will be removed."
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(record.id)}
        >
          <Button
            type="text"
            danger
            icon={<FiTrash2 size={16} />}
            aria-label={`Delete ${record.key}`}
          />
        </Popconfirm>
      )
    }
  ];

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={keywords.map((k) => k.id)} strategy={verticalListSortingStrategy}>
        <Table<Keyword>
          rowKey="id"
          columns={columns}
          dataSource={keywords}
          pagination={false}
          components={{ body: { row: SortableRow as never } }}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </SortableContext>
    </DndContext>
  );
}