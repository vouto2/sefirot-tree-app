'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/trees');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      alert('登録が完了しました。メールを確認してください。');
      router.push('/trees');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-100">
      <div className="flex items-center mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
        <h1 className="text-3xl font-bold ml-3">生命の樹</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="flex border-b mb-6">
          <button
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${isLogin ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500'}`}
            onClick={() => setIsLogin(true)}
          >
            ログイン
          </button>
          <button
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${!isLogin ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500'}`}
            onClick={() => setIsLogin(false)}
          >
            新規登録
          </button>
        </div>

        <div>
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input
                  type="email"
                  id="login-email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">パスワード</label>
                <input
                  type="password"
                  id="login-password"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm">ログイン</button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input
                  type="email"
                  id="signup-email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">パスワード</label>
                <input
                  type="password"
                  id="signup-password"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">パスワード（確認用）</label>
                <input
                  type="password"
                  id="confirm-password"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm">アカウント作成</button>
            </form>
          )}
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <div className="mt-6">
            <button className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M47.52,24.54c0-1.72-0.16-3.38-0.44-5.04H24.48v9.48h13.08c-0.56,3.08-2.32,5.72-4.92,7.52v6.2h7.96 C45.4,39.3,47.52,32.38,47.52,24.54z" fill="#4285F4"/>
                <path d="M24.48,48c6.6,0,12.16-2.16,16.2-5.84l-7.96-6.2c-2.16,1.48-4.96,2.36-8.24,2.36c-6.4,0-11.8-4.28-13.72-10.04 H2.6v6.4C6.72,41.24,14.92,48,24.48,48z" fill="#34A853"/>
                <path d="M10.76,28.86c-0.64-1.92-1-3.96-1-6.1c0-2.14,0.36-4.18,1-6.1L2.6,10.26C0.96,13.88,0,18.54,0,23.5 c0,4.96,0.96,9.62,2.6,13.24L10.76,28.86z" fill="#FBBC05"/>
                <path d="M24.48,9.66c3.64,0,6.84,1.24,9.4,3.72l6.92-6.92C36.64,2.2,31.08,0,24.48,0C14.92,0,6.72,6.76,2.6,16.2 l8.16,6.4C12.68,13.94,18.08,9.66,24.48,9.66z" fill="#EA4335"/>
              </svg>
              Googleで続ける
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}