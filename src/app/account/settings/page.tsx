'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; // クライアントサイド用Supabaseクライアント
import { useRouter } from 'next/navigation';

export default function AccountSettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      } else {
        router.push('/auth'); // ユーザーがいない場合はログインページへリダイレクト
      }
    };
    getUser();
  }, [supabase, router]);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!newEmail) {
      setMessage({ type: 'error', text: '新しいメールアドレスを入力してください。' });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      setMessage({ type: 'error', text: `メールアドレスの更新に失敗しました: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: 'メールアドレスの更新リクエストを送信しました。確認メールをご確認ください。' });
      setEmail(newEmail); // 更新リクエスト成功後、現在のメールアドレスを更新
      setNewEmail(''); // 入力欄をクリア
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: '新しいパスワードと確認用パスワードを入力してください。' });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'パスワードと確認用パスワードが一致しません。' });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: `パスワードの更新に失敗しました: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: 'パスワードを更新しました。' });
      setPassword(''); // 入力欄をクリア
      setConfirmPassword(''); // 入力欄をクリア
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>

      {message && (
        <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* メールアドレスの変更フォーム */}
      <form onSubmit={handleEmailUpdate} className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">メールアドレスの変更</h2>
        <div className="mb-4">
          <label htmlFor="current-email" className="block text-sm font-medium text-gray-700">現在のメールアドレス</label>
          <input
            type="email"
            id="current-email"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 cursor-not-allowed"
            value={email}
            disabled
          />
        </div>
        <div className="mb-4">
          <label htmlFor="new-email" className="block text-sm font-medium text-gray-700">新しいメールアドレス</label>
          <input
            type="email"
            id="new-email"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? '更新中...' : 'メールアドレスを更新'}
        </button>
      </form>

      {/* パスワードの変更フォーム */}
      <form onSubmit={handlePasswordUpdate} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">パスワードの変更</h2>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">新しいパスワード</label>
          <input
            type="password"
            id="password"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">パスワード（確認用）</label>
          <input
            type="password"
            id="confirm-password"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? '更新中...' : 'パスワードを更新'}
        </button>
      </form>
    </div>
  );
}
