'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Kullanıcıyı ve Rolünü Al
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }

    // 2. Etkinlikleri Çek
    fetch('http://localhost:3001/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload(); // Sayfayı yenile
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
           <a href="/" className="text-xl font-bold tracking-tight text-slate-800 hover:opacity-80">
             DevFest<span className="text-indigo-600">Bilet</span>
           </a>
        </div>
        
        <div className="flex gap-4 items-center">
            {/* SADECE ADMIN İSE GÖSTER */}
            {user?.role === 'ADMIN' && (
                <a href="/admin" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                    🔧 Yönetici Paneli
                </a>
            )}

            {user ? (
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hidden sm:inline-block">
                        {user.name}
                    </span>
                    <a href="/profile" className="text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                        Biletlerim
                    </a>
                    <button 
                        onClick={handleLogout} 
                        className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        Çıkış
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <a href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-3 py-2">
                        Giriş Yap
                    </a>
                    <a href="/register" className="text-sm font-bold text-indigo-600 border-2 border-indigo-600 px-4 py-1.5 rounded-full hover:bg-indigo-50 transition-colors">
                        Kayıt Ol
                    </a>
                </div>
            )}
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-slate-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Etkinlikleri Keşfet</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Konserler, tiyatrolar ve teknoloji buluşmaları. Yerini şimdiden ayırt.</p>
      </div>

      {/* Etkinlik Listesi */}
      <div className="max-w-6xl mx-auto p-6 lg:p-12 -mt-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow border border-slate-100 flex flex-col group">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold text-slate-800 shadow-sm">
                    {event.price} ₺
                </div>
                {/* Tarih Rozeti */}
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                    📅 {new Date(event.date).toLocaleDateString()}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{event.title}</h2>
                    <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                        📍 {event.location}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                        <span className="bg-slate-100 px-2 py-1 rounded">👤 {event.creator?.name || 'Admin'}</span>
                    </div>
                </div>
                
                <div className="mt-auto">
                    <a href={`/event/${event.id}`} className="block w-full py-3 text-center bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-1">
                        Bilet Al →
                    </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
            <div className="text-center py-20 text-slate-400">
                <p>Henüz aktif bir etkinlik bulunmuyor.</p>
            </div>
        )}
      </div>
    </div>
  );
}