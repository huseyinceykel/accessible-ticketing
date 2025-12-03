'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  imageUrl: string;
  creator?: {
    name: string;
  };
};

type UserData = {
  name: string;
  role: string;
};

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setUser(JSON.parse(storedUser));
    }

    fetch('http://localhost:3001/events')
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* SKIP LINK (WCAG) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        focus:bg-indigo-700 focus:text-white focus:px-4 focus:py-2 
        rounded-md font-bold z-50 shadow-lg"
      >
        Ana içeriğe atla
      </a>

      {/* NAVBAR */}
      <nav
        aria-label="Ana Menü"
        className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold"
            aria-hidden="true"
          >
            D
          </div>

          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-slate-800 hover:opacity-80 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
          >
            DevFest<span className="text-indigo-600">Bilet</span>
          </Link>
        </div>

        <ul className="flex gap-4 items-center" role="menubar">
          {user?.role === 'ADMIN' && (
            <li role="none">
              <Link
                href="/admin"
                role="menuitem"
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
              >
                🔧 Yönetici Paneli
              </Link>
            </li>
          )}

          {user ? (
            <>
              <li role="none">
                <span
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hidden sm:inline-block"
                  aria-label={`Giriş yapan kullanıcı: ${user.name}`}
                >
                  {user.name}
                </span>
              </li>

              <li role="none">
                <Link
                  href="/profile"
                  role="menuitem"
                  className="text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-full 
                  hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Biletlerim
                </Link>
              </li>

              <li role="none">
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 
                  px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Çıkış Yap"
                >
                  Çıkış
                </button>
              </li>
            </>
          ) : (
            <>
              <li role="none">
                <Link
                  href="/login"
                  role="menuitem"
                  className="text-sm font-bold text-slate-600 hover:text-indigo-600 
                  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                >
                  Giriş Yap
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/register"
                  role="menuitem"
                  className="text-sm font-bold text-indigo-600 border-2 border-indigo-600 
                  px-4 py-1.5 rounded-full hover:bg-indigo-50 transition-colors 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Kayıt Ol
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* HERO */}
      <header className="bg-slate-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Etkinlikleri Keşfet</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Konserler, tiyatrolar ve teknoloji buluşmaları. Yerini şimdiden ayırt.
        </p>
      </header>

      {/* MAIN CONTENT */}
      <section
        className="max-w-6xl mx-auto p-6 lg:p-12 -mt-16"
        aria-label="Etkinlik Listesi"
      >

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <article
              key={event.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl 
              transition-shadow border border-slate-100 flex flex-col group 
              focus-within:ring-4 focus-within:ring-indigo-500"
            >
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.imageUrl}
                  alt={`${event.title} etkinlik afişi`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm 
                  font-bold text-slate-800 shadow-sm"
                  aria-label={`Fiyat: ${event.price} Türk Lirası`}
                >
                  {event.price} ₺
                </div>

                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                  <time dateTime={event.date}>
                    {new Date(event.date).toLocaleDateString()}
                  </time>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">
                    <Link
                      href={`/event/${event.id}`}
                      className="focus:outline-none before:absolute before:inset-0"
                    >
                      {event.title}
                    </Link>
                  </h2>

                  <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                    <span aria-hidden="true">📍</span> {event.location}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <span className="bg-slate-100 px-2 py-1 rounded">
                      👤 {event.creator?.name || 'Admin'}
                    </span>
                  </div>
                </div>

                <div className="mt-auto relative z-10">
                  <Link
                    href={`/event/${event.id}`}
                    className="block w-full py-3 text-center bg-indigo-600 text-white 
                    font-bold rounded-xl hover:bg-indigo-700 transition-colors 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Bilet Al →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-20 text-slate-400" role="status">
            <p>Henüz aktif bir etkinlik bulunmuyor.</p>
          </div>
        )}
      </section>
    </div>
  );
}
