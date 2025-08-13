'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import CreateTreeModal from '@/components/trees/CreateTreeModal';

interface Tree {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function TreesPage() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null); // New state
  const supabase = createClient();
  const router = useRouter();

  const fetchTrees = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      router.push('/auth');
      return;
    }

    // Debugging: Log user ID
    console.log('Fetching trees for user ID:', user.id);

    const { data, error } = await supabase
      .from('trees')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id);

    if (error) {
      setError(`ツリーの取得中にエラーが発生しました: ${error.message}`);
      console.error('Error fetching trees:', error);
    } else {
      setTrees(data || []);
      // Debugging: Log fetched data
      console.log('Fetched trees data:', data);
    }
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside any dropdown
      // This is a simplified check, a more robust solution might involve refs
      if (showDropdownId && !(event.target as HTMLElement).closest('.relative')) { // Assuming .relative is the parent of the dropdown
        setShowDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdownId]);

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleTreeCreated = () => {
    fetchTrees(); // Re-fetch trees after a new one is created
  };

  const handleCardClick = (id: string) => {
    router.push(`/trees/${id}/edit`);
  };

  const handleUserMenuClick = () => {
    // Placeholder for user menu (e.g., logout)
    alert('ユーザーメニューがクリックされました。');
  };

  const handleDeleteTree = async (treeId: string) => { // New function
    if (window.confirm('本当にこのノートを削除しますか？関連するノードもすべて削除されます。')) {
      setLoading(true);
      setError(null);
      try {
        const { error } = await supabase
          .from('trees')
          .delete()
          .eq('id', treeId);

        if (error) {
          setError(`樹の削除中にエラーが発生しました: ${error.message}`);
          console.error('Error deleting tree:', error);
        } else {
          fetchTrees(); // Re-fetch trees after deletion
        }
      } catch (err: any) {
        setError(`予期せぬエラーが発生しました: ${err.message}`);
        console.error('Unexpected error during tree deletion:', err);
      } finally {
        setLoading(false);
        setShowDropdownId(null); // Close dropdown
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-50">読み込み中...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-50 text-red-500">エラー: {error}</div>;
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      {/* メインコンテンツ */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">あなたの「セフィロトノート」一覧</h2>
          {/* 新規作成ボタン (PCのみ表示) */}
          <button
            className="hidden sm:flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            onClick={handleCreateNew}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>新規作成</span>
          </button>
        </div>

        {trees.length === 0 ? (
          <p className="text-gray-600">まだ「セフィロトノート」がありません。新規作成ボタンから作成しましょう！</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trees.map((tree) => (
              <div
                key={tree.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer"
                onClick={() => handleCardClick(tree.id)}
              >
                <div className="p-5 flex-grow">
                  <h3 className="text-lg font-bold text-gray-900">{tree.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 sm:hidden">最終更新: {new Date(tree.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end relative"> {/* Added relative positioning */}
                  <button
                    className="p-2 rounded-full hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      setShowDropdownId(showDropdownId === tree.id ? null : tree.id);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                  {showDropdownId === tree.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleDeleteTree(tree.id);
                        }}
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* フッター (モバイルのみ表示) */}
      <footer className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <button
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          onClick={handleCreateNew}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-base font-medium">新規作成</span>
        </button>
      </footer>

      <CreateTreeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTreeCreated={handleTreeCreated}
      />
    </div>
  );
}