'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EditTreeTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  treeId: string;
  currentTitle: string;
  onTitleUpdated: () => void;
}

export default function EditTreeTitleModal({
  isOpen,
  onClose,
  treeId,
  currentTitle,
  onTitleUpdated,
}: EditTreeTitleModalProps) {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    setNewTitle(currentTitle); // モーダルが開くたびに現在のタイトルをセット
  }, [currentTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!newTitle.trim()) {
      setError('タイトルは必須です。');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('trees')
      .update({ title: newTitle.trim() })
      .eq('id', treeId);

    if (updateError) {
      setError(`タイトルの更新に失敗しました: ${updateError.message}`);
    } else {
      onTitleUpdated(); // 親コンポーネントに更新を通知
      onClose(); // モーダルを閉じる
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-bold mb-4">ツリー名を変更</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tree-title-input" className="block text-sm font-medium text-gray-700">新しいツリー名</label>
            <input
              type="text"
              id="tree-title-input"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}