'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'CONSULTANT'>('CLIENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'CLIENT' || roleParam === 'CONSULTANT') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
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
    <div className="scanlines min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-xs text-[#888888] mb-4">
          /// USER REGISTRATION SYSTEM
        </div>

        <h1 className="text-6xl mb-8">REGISTER</h1>

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
              [ ACCOUNT TYPE ]
            </label>
            <div className="grid grid-cols-2 gap-1 bg-[#333333]">
              <button
                type="button"
                onClick={() => setRole('CLIENT')}
                className={`p-4 transition-colors ${
                  role === 'CLIENT'
                    ? 'bg-[#E61919] text-[#0A0A0A]'
                    : 'bg-[#121212] text-[#888888] hover:bg-[#1A1A1A]'
                }`}
              >
                CLIENT
              </button>
              <button
                type="button"
                onClick={() => setRole('CONSULTANT')}
                className={`p-4 transition-colors ${
                  role === 'CONSULTANT'
                    ? 'bg-[#E61919] text-[#0A0A0A]'
                    : 'bg-[#121212] text-[#888888] hover:bg-[#1A1A1A]'
                }`}
              >
                CONSULTANT
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs mb-2">
              [ FULL NAME ]
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="JOHN DOE"
            />
          </div>

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
              minLength={8}
              disabled={loading}
              placeholder="••••••••"
            />
            <div className="text-xs text-[#888888] mt-1">
              MINIMUM 8 CHARACTERS
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? '[ CREATING ACCOUNT... ]' : '[ CREATE ACCOUNT ]'}
          </button>
        </form>

        <hr className="my-8" />

        <div className="text-center text-xs">
          <span className="text-[#888888]">ALREADY REGISTERED?</span>{' '}
          <a href="/login" className="text-[#E61919] hover:underline">
            LOGIN HERE
          </a>
        </div>

        <div className="mt-8 text-xs text-[#888888] space-y-1">
          <div>[ PASSWORD ENCRYPTED / BCRYPT ]</div>
          <div>[ DATA PROTECTED / GDPR COMPLIANT ]</div>
        </div>
      </div>
    </div>
  );
}
