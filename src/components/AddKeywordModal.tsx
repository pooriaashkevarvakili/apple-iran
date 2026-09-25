import { Button, Form, Input, Modal, Select } from 'antd';
import { useState } from 'react';
import type { Language, NewKeywordInput } from '../../type';

interface FormValues {
  key: string;
  lang: string;
  value?: string;
}

interface Props {
  open: boolean;
  languages: Language[];
  defaultLanguage?: string;
  existingKeys: Set<string>;
  onClose: () => void;
  onSubmit: (input: NewKeywordInput) => void;
}

export default function AddKeywordModal({
  open,
  languages,
  defaultLanguage,
  existingKeys,
  onClose,
  onSubmit
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [lang, setLang] = useState<string>(
    defaultLanguage ?? languages[0]?.code ?? ''
  );

  const handleOk = async (): Promise<void> => {
    const values = await form.validateFields();
    onSubmit({ key: values.key, lang: values.lang, value: values.value ?? '' });
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title="Add keyword"
      onCancel={onClose}
      onOk={handleOk}
      okText="Add keyword"
      destroyOnClose
    >
      <p className="mb-4 text-sm text-slate-500">
        The keyword is created for every language. Only the one you fill in here gets a value.
      </p>

      <Form<FormValues>
        form={form}
        layout="vertical"
        initialValues={{ lang: defaultLanguage ?? languages[0]?.code }}
        preserve={false}
      >
        <Form.Item
          name="key"
          label="Keyword"
          rules={[
            { required: true, message: 'Keyword name is required' },
            {
              pattern: /^[\w.-]+$/,
              message: 'Use letters, numbers, dots, dashes, underscores'
            },
            {
              validator: (_, value: unknown) =>
                typeof value === 'string' && existingKeys.has(value.trim())
                  ? Promise.reject(new Error('Keyword already exists'))
                  : Promise.resolve()
            }
          ]}
        >
          <Input placeholder="nav.profile" autoComplete="off" spellCheck={false} />
        </Form.Item>

        <Form.Item name="lang" label="Language for the initial translation">
          <Select<string>
            options={languages.map((l) => ({ value: l.code, label: `${l.name} (${l.code})` }))}
            onChange={setLang}
          />
        </Form.Item>

        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const current = languages.find((l) => l.code === getFieldValue('lang'));
            return (
              <Form.Item name="value" label="Translation">
                <Input dir={current?.dir ?? 'ltr'} placeholder="Profile" />
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}

export { Button };