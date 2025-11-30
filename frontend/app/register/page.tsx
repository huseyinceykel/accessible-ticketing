'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Kayıt başarılıysa giriş sayfasına at
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.message || 'Kayıt başarısız.');
      }
    } catch (err) {
      setError('Sunucu hatası.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Kayıt Ol</h1>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div role="alert" className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all focus:ring-4 focus:ring-indigo-200">
            Hesap Oluştur
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-600">
          Zaten hesabın var mı? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}