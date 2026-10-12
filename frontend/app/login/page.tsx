'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scanlines min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-xs text-[#888888] mb-4">
          /// AUTHENTICATION SYSTEM
        </div>

        <h1 className="text-6xl mb-8">LOGIN</h1>

        {error && (
          <div className="border-2 border-[#E61919] bg-[#121212] p-4 mb-6">
            <div className="text-[#E61919] text-xs">
              [ ERROR ] {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs mb-2">
              [ EMAIL ADDRESS ]
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-xs mb-2">
              [ PASSWORD ]
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? '[ AUTHENTICATING... ]' : '[ INITIATE LOGIN ]'}
          </button>
        </form>

        <hr className="my-8" />

        <div className="text-center text-xs">
          <span className="text-[#888888]">NO ACCOUNT?</span>{' '}
          <a href="/register" className="text-[#E61919] hover:underline">
            REGISTER HERE
          </a>
        </div>

        <div className="mt-8 text-xs text-[#888888] space-y-1">
          <div>[ SECURE CONNECTION / SSL ]</div>
          <div>[ SESSION TIMEOUT / 15 MIN ]</div>
        </div>
      </div>
    </div>
  );
}
