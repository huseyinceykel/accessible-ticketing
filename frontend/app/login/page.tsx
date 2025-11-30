'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.message || 'Giriş başarısız.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">

      {/* Skip Link — WCAG uyumlu */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   focus:bg-indigo-700 focus:text-white focus:px-4 focus:py-2 
                   rounded-md font-bold z-50 shadow-lg"
      >
        Ana içeriğe atla
      </a>

      {/* Main Content */}
      <main
        id="main-content"
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100"
        aria-labelledby="login-heading"
      >
        <h1
          id="login-heading"
          className="text-2xl font-bold text-slate-900 mb-6 text-center"
        >
          Giriş Yap
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              E-posta Adresi
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 
                         focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 
                         outline-none transition-all"
              required
              aria-describedby="email-help"
            />
            <p id="email-help" className="sr-only">
              E-posta adresinizi giriniz.
            </p>
          </div>
          
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 
                         focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 
                         outline-none transition-all"
              required
              aria-describedby="password-help"
            />
            <p id="password-help" className="sr-only">
              Şifrenizi giriniz.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100"
            >
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg 
                       hover:bg-indigo-700 transition-all 
                       focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            Giriş Yap
          </button>
        </form>
        
        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Hesabın yok mu?{' '}
          <Link
            href="/register"
            className="text-indigo-600 font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
          >
            Kayıt Ol
          </Link>
        </p>
      </main>
    </div>
  );
}
