'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
// import CreateTemplateModal from '@/components/templates/CreateTemplateModal'; // Removed this import

interface Node {
  id: string;
  title: string;
  details: string | null;
  position: number;
  tree_id: string;
}

interface TemplateNode {
  id: string;
  template_id: string;
  position: number;
  title: string;
  details_placeholder: string | null;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  template_nodes: TemplateNode[];
}

interface Tree {
  id: string;
  title: string;
  user_id: string;
  parent_node_id: string | null;
  nodes: Node[];
  templates: Template | null;
}

// Placeholder titles for nodes
const defaultNodePlaceholders = [
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

// Node positions based on the wireframe
const nodePositions: { [key: number]: { top: string; left: string; transform: string } } = {
  1: { top: '0%', left: '50%', transform: 'translateX(-50%)' },
  2: { top: '12%', left: '75%', transform: 'translateX(-50%)' },
  3: { top: '12%', left: '25%', transform: 'translateX(-50%)' },
  4: { top: '28%', left: '75%', transform: 'translateX(-50%)' },
  5: { top: '28%', left: '25%', transform: 'translateX(-50%)' },
  6: { top: '42%', left: '50%', transform: 'translateX(-50%)' },
  7: { top: '50%', left: '75%', transform: 'translateX(-50%)' },
  8: { top: '50%', left: '25%', transform: 'translateX(-50%)' },
  9: { top: '65%', left: '50%', transform: 'translateX(-50%)' },
  10: { top: '80%', left: '50%', transform: 'translateX(-50%)' },
};

// Connections between nodes for drawing lines
const connections = [
  [1, 2], [1, 3],
  [2, 3], [2, 4],
  [3, 5],
  [4, 5], [4, 6], [4, 7],
  [5, 6], [5, 8],
  [7, 8], [7, 9],
  [8, 9],
  [9, 10],
];

export default function TreeEditPage() {
  const params = useParams();
  const treeId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const treeContainerRef = useRef<HTMLDivElement>(null);

  const fetchTreeData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { session } = { session: null } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      router.push('/auth');
      return;
    }

    console.log('Fetching tree data for treeId:', treeId, 'and userId:', user.id);

    const { data, error: treeError } = await supabase
      .from('trees')
      .select(`
        *,
        nodes!fk_nodes_tree_id (*),
        templates (
          *,
          template_nodes (*)
        )
      `)
      .eq('id', treeId)
      .single();

    if (treeError) {
      setError(treeError.message);
      console.error('Error fetching tree:', treeError);
      setLoading(false);
      return;
    }

    if (!data || data.user_id !== user.id) {
      setError('ツリーが見つからないか、アクセス権がありません。');
      setLoading(false);
      return;
    }

    // Ensure nodes are sorted by position
    data.nodes.sort((a: Node, b: Node) => a.position - b.position);
    setTree(data as Tree);
    console.log('Fetched tree data:', data);
    console.log('Final tree state:', data);
    setLoading(false);
  }, [treeId, router, supabase]);

  useEffect(() => {
    fetchTreeData();
  }, [fetchTreeData]);

  const drawLines = useCallback(() => {
    const treeContainer = treeContainerRef.current;
    if (!treeContainer) {
      return;
    }

    // Clear existing lines
    treeContainer.querySelectorAll('.line').forEach(l => l.remove());

    connections.forEach(([fromPos, toPos]) => {
      const fromEl = document.getElementById(`node-${fromPos}`);
      const toEl = document.getElementById(`node-${toPos}`);

      if (!fromEl || !toEl) {
        return;
      }

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const containerRect = treeContainer.getBoundingClientRect();

      const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
      const x2 = toRect.left + toRect.width / 2 - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;

      const angleRad = Math.atan2(y2 - y1, x2 - x1);
      const angleDeg = angleRad * 180 / Math.PI;
      
      const nodeRadius = fromRect.width / 2;

      const new_x1 = x1 + nodeRadius * Math.cos(angleRad);
      const new_y1 = y1 + nodeRadius * Math.sin(angleRad);
      
      const original_length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const new_length = original_length - (nodeRadius * 2);

      const line = document.createElement('div');
      line.classList.add('line');
      line.style.width = `${new_length}px`;
      line.style.height = '2px';
      line.style.background = '#9ca3af';
      line.style.position = 'absolute';
      line.style.left = `${new_x1}px`;
      line.style.top = `${new_y1}px`;
      line.style.transformOrigin = '0 0';
      line.style.transform = `rotate(${angleDeg}deg)`;
      line.style.zIndex = '0';
      
      treeContainer.appendChild(line);
    });
  }, []);

  useEffect(() => {
    if (tree && treeContainerRef.current) {
      const animationFrame = requestAnimationFrame(() => {
        drawLines();
      });
      window.addEventListener('resize', drawLines);
      return () => {
        cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', drawLines);
      };
    }
  }, [tree, drawLines]);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setIsNodeModalOpen(true);
  };

  const handleModalSave = async (updatedTitle: string, updatedDetails: string) => {
    if (!selectedNode || !tree) return;

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('nodes')
      .update({ title: updatedTitle, details: updatedDetails })
      .eq('id', selectedNode.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setTree(prevTree => {
        if (!prevTree) return null;
        const updatedNodes = prevTree.nodes.map(node =>
          node.id === selectedNode.id ? { ...node, title: updatedTitle, details: updatedDetails } : node
        );
        return { ...prevTree, nodes: updatedNodes };
      });
      setIsNodeModalOpen(false);
      setSelectedNode(null);
    }
    setLoading(false);
  };

  const handleTreeTitleSave = async (newTitle: string) => {
    if (!tree) return;

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('trees')
      .update({ title: newTitle })
      .eq('id', tree.id);

    if (updateError) {
      setError(updateError.message);
    }
    else {
      setTree(prevTree => prevTree ? { ...prevTree, title: newTitle } : null);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-50">読み込み中...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-50 text-red-500">エラー: {error}</div>;
  }

  if (!tree) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-50">ツリーが見つかりません。</div>;
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-1">
            {/* 戻るボタン */}
            <button className="flex items-center text-gray-600 hover:text-blue-600" onClick={() => router.back()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>戻る</span>
            </button>
            
            {/* 樹のタイトル */}
            <input
              type="text"
              className="text-lg font-bold text-center bg-transparent border-none focus:outline-none focus:ring-0"
              value={tree.title}
              onChange={(e) => setTree(prev => prev ? { ...prev, title: e.target.value } : null)}
              onBlur={(e) => handleTreeTitleSave(e.target.value)}
            />

            {/* 保存ボタン */}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" onClick={() => handleTreeTitleSave(tree.title)}>
              保存
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-grow flex justify-center items-center p-4">
        <div ref={treeContainerRef} className="tree-container relative w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl" style={{ height: '800px' }}>
          {tree.nodes.map(node => (
            <div
              key={node.id}
              id={`node-${node.position}`}
              className="node absolute w-24 h-24 bg-white border-2 border-gray-500 rounded-full flex justify-center items-center text-center cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:border-blue-700 p-1"
              style={nodePositions[node.position]}
              onClick={() => handleNodeClick(node)}
            >
              <span className={`node-text text-sm font-medium pointer-events-none ${node.title && node.title.trim().length > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                {node.title || (tree.templates?.template_nodes.find(tn => tn.position === node.position)?.title) || defaultNodePlaceholders[node.position - 1]}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Edit Node Modal */}
      {isNodeModalOpen && selectedNode && (() => {
        const templateNode = tree.templates?.template_nodes.find(tn => tn.position === selectedNode.position) || null;
        return (
          <EditNodeModal
            isOpen={isNodeModalOpen}
            onClose={() => setIsNodeModalOpen(false)}
            node={selectedNode}
            templateNode={templateNode}
            onSave={handleModalSave}
          />
        );
      })()}
    </div>
  );
}

interface EditNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node;
  templateNode: TemplateNode | null;
  onSave: (title: string, details: string) => void;
}

function EditNodeModal({ isOpen, onClose, node, templateNode, onSave }: EditNodeModalProps) {
  const [title, setTitle] = useState(node.title || '');
  const [details, setDetails] = useState(node.details || '');
  const supabase = createClient();
  const router = useRouter();

  const titlePlaceholder = templateNode?.title || defaultNodePlaceholders[node.position - 1];
  const detailsPlaceholder = templateNode?.details_placeholder || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(title, details);
  };

  const handleCreateChildTree = async () => {
    await onSave(title, details);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ユーザーが認証されていません。');
      return;
    }

    const newTreeTitle = title || titlePlaceholder;
    const { data, error } = await supabase
      .from('trees')
      .insert({
        title: newTreeTitle,
        user_id: user.id,
        parent_node_id: node.id,
      })
      .select()
      .single();

    if (error) {
      alert(`新しい樹の作成に失敗しました: ${error.message}`);
    } else if (data) {
      const newTreeId = data.id;
      const nodesToInsert = Array.from({ length: 10 }, (_, i) => ({
        tree_id: newTreeId,
        title: '',
        position: i + 1,
        details: null,
      }));

      const { error: nodesError } = await supabase.from('nodes').insert(nodesToInsert);

      if (nodesError) {
        alert(`ノードの作成に失敗しました: ${nodesError.message}`);
      } else {
        onClose();
        router.push(`/trees/${newTreeId}/edit`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-bold mb-4">ノードを編集</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="node-text-input" className="block text-sm font-medium text-gray-700">タイトル</label>
            <input
              type="text"
              id="node-text-input"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder}
            />
          </div>
          <div>
            <label htmlFor="node-details-input" className="block text-sm font-medium text-gray-700">詳細</label>
            <textarea
              id="node-details-input"
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={detailsPlaceholder}
            ></textarea>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <button type="button" onClick={handleCreateChildTree} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新しい樹を作成
            </button>
            <div className="space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">キャンセル</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}