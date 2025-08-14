'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface CreateTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTreeCreated: () => void;
  initialTemplateId?: string;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  template_nodes: TemplateNode[];
}

interface TemplateNode {
  id: string;
  template_id: string;
  position: number;
  title: string;
  details_placeholder: string | null;
}

export default function CreateTreeModal({ isOpen, onClose, onTreeCreated, initialTemplateId }: CreateTreeModalProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || '');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const fetchTemplates = async () => {
        const { data, error: fetchError } = await supabase
          .from('templates')
          .select(`
            *,
            template_nodes(*)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError(`テンプレートの取得中にエラーが発生しました: ${fetchError.message}`);
          console.error('Error fetching templates:', fetchError);
        } else {
          setTemplates(data || []);
        }
      };
      fetchTemplates();
    } else {
      setTitle('');
      setError(null);
      setTemplates([]);
      setSelectedTemplateId('');
    }
  }, [isOpen, supabase, initialTemplateId]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('タイトルは必須です。');
      return;
    }
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setError('ユーザーが認証されていません。');
      setLoading(false);
      return;
    }

    const { data: treeData, error: insertTreeError } = await supabase
      .from('trees')
      .insert({ title, user_id: user.id, template_id: selectedTemplateId || null })
      .select()
      .single();

    if (insertTreeError) {
      setError(insertTreeError.message);
      setLoading(false);
      return;
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    const nodesToInsert = selectedTemplate?.template_nodes.map(node => ({
      title: '',
      details: null,
      position: node.position,
      tree_id: treeData.id,
    })) || [];

    if (nodesToInsert.length === 0) {
      const defaultNodeTitles = [
        'ケテル (王冠)', 'コクマー (知恵)', 'ビナー (理解)', 'ケセド (慈悲)', 'ゲブラー (峻厳)',
        'ティファレト (美)', 'ネツァク (勝利)', 'ホド (栄光)', 'イェソド (基礎)', 'マルクト (王国)',
      ];
      for (let i = 0; i < 10; i++) {
        nodesToInsert.push({
          title: defaultNodeTitles[i],
          details: null,
          details_placeholder: null, // Add details_placeholder for default nodes
          position: i + 1,
          tree_id: treeData.id,
        });
      }
    }

    const { error: insertNodesError } = await supabase
      .from('nodes')
      .insert(nodesToInsert);

    if (insertNodesError) {
      setError(insertNodesError.message);
      setLoading(false);
      return;
    }

    setTitle('');
    setSelectedTemplateId('');
    onTreeCreated();
    onClose();

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">新しい「生命の樹」を作成</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">
              テンプレートを選択:
            </label>
            <select
              id="template-select"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              disabled={loading}
            >
              <option value="">テンプレートなし</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tree-title" className="block text-sm font-medium text-gray-700">タイトル</label>
            <input
              type="text"
              id="tree-title"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading || !title.trim()}
            >
              {loading ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
