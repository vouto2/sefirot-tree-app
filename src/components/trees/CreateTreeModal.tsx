'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CreateTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTreeCreated: () => void;
}

export default function CreateTreeModal({ isOpen, onClose, onTreeCreated }: CreateTreeModalProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      .insert({ title, user_id: user.id })
      .select()
      .single();

    if (insertTreeError) {
      setError(insertTreeError.message);
      setLoading(false);
      return;
    }

    // Create 10 default nodes for the new tree
    const defaultNodeTitles = [
      'ケテル (王冠)',
      'コクマー (知恵)',
      'ビナー (理解)',
      'ケセド (慈悲)',
      'ゲブラー (峻厳)',
      'ティファレト (美)',
      'ネツァク (勝利)',
      'ホド (栄光)',
      'イェソド (基礎)',
      'マルクト (王国)',
    ];

    const nodesToInsert = defaultNodeTitles.map((_, index) => ({
      title: '',
      position: index + 1,
      tree_id: treeData.id,
    }));

    const { error: insertNodesError } = await supabase
      .from('nodes')
      .insert(nodesToInsert);

    if (insertNodesError) {
      setError(insertNodesError.message);
      // Consider rolling back tree creation here if nodes are essential
      setLoading(false);
      return;
    }

    setTitle('');
    onTreeCreated(); // Notify parent component that a tree was created
    onClose(); // Close the modal

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">新しい「生命の樹」を作成</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              disabled={loading}
            >
              {loading ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
