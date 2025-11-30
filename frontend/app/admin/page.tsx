'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [form, setForm] = useState({ 
    id: null,
    title: '', location: '', date: '', price: '', imageUrl: '',
    rowCount: 5, colCount: 8 
  });
  
  const [events, setEvents] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // GÜNCELLEME: Sadece giriş yapan kullanıcının etkinliklerini çek
  const fetchEvents = (email?: string) => {
    if (!email) return;
    
    fetch(`http://localhost:3001/events?creatorEmail=${email}`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Etkinlikler yüklenemedi:", err));
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/login'; 
        return;
    }
    const user = JSON.parse(userStr);
    
    if (user.role !== 'ADMIN') {
       // Opsiyonel yetki kontrolü
    }
    
    setCurrentUser(user);
    // Sayfa açılınca bu kullanıcının etkinliklerini getir
    fetchEvents(user.email);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('İşleniyor...');

    const isEditing = !!form.id; 
    const url = isEditing 
        ? `http://localhost:3001/events/${form.id}` 
        : 'http://localhost:3001/create-event';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: currentUser?.email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        // İşlem bitince listeyi güncelle
        fetchEvents(currentUser?.email);
        resetForm();
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage('❌ Sunucu hatası.');
    }
  };

  const handleEditClick = (ev: any) => {
    const formattedDate = new Date(ev.date).toISOString().slice(0, 16);
    setForm({
        id: ev.id,
        title: ev.title,
        location: ev.location,
        date: formattedDate,
        price: ev.price,
        imageUrl: ev.imageUrl || '',
        rowCount: 0, 
        colCount: 0
    });
    setMessage('✏️ Düzenleme modu aktif.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Bu etkinliği silmek istediğine emin misin?")) return;
    
    const res = await fetch(`http://localhost:3001/events/${id}?email=${currentUser?.email}`, { 
        method: 'DELETE' 
    });
    
    const data = await res.json();
    if(res.ok) {
        // Silinince listeyi güncelle
        fetchEvents(currentUser?.email);
        setMessage('🗑️ Etkinlik silindi.');
    } else {
        alert("HATA: " + data.message);
    }
  };

  const resetForm = () => {
    setForm({ id: null, title: '', location: '', date: '', price: '', imageUrl: '', rowCount: 5, colCount: 8 });
    setMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Yönetici Paneli</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {currentUser?.name || 'Yönetici'}
            </span>
            <a href="/" className="text-slate-600 font-bold hover:underline">Siteye Dön</a>
            <button onClick={handleLogout} className="text-red-600 font-bold hover:underline">Çıkış Yap</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
            
            {/* SOL: Form */}
            <div className="lg:col-span-5">
                <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">
                            {form.id ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}
                        </h2>
                        {form.id && (
                            <button onClick={resetForm} className="text-xs text-red-500 underline">Vazgeç</button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input required placeholder="Etkinlik Adı" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-2">
                            <input required placeholder="Konum" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                                value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                            <input required type="number" placeholder="Fiyat" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                                value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                        </div>
                        
                        <input required type="datetime-local" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                        
                        <input placeholder="Resim URL" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
                        
                        {!form.id && (
                            <div className="p-3 bg-indigo-50 rounded border border-indigo-100 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-bold text-indigo-800">Sıra Sayısı</label>
                                    <input type="number" className="w-full p-1 border rounded" 
                                        value={form.rowCount} onChange={e => setForm({...form, rowCount: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-indigo-800">Koltuk/Sıra</label>
                                    <input type="number" className="w-full p-1 border rounded" 
                                        value={form.colCount} onChange={e => setForm({...form, colCount: Number(e.target.value)})} />
                                </div>
                            </div>
                        )}

                        <button type="submit" className={`w-full text-white py-3 rounded-lg font-bold transition-all ${form.id ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-900 hover:bg-slate-800'}`}>
                            {form.id ? 'Güncelle' : 'Oluştur'}
                        </button>

                        {message && <div className="p-3 bg-slate-100 rounded text-center text-sm font-bold animate-pulse">{message}</div>}
                    </form>
                </div>
            </div>

            {/* SAĞ: Liste (Sadece Benim Etkinliklerim) */}
            <div className="lg:col-span-7">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Etkinliklerim</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {events.map(ev => (
                            <div key={ev.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-indigo-100 bg-indigo-50/30 rounded-lg hover:shadow-md transition-all">
                                <div className="mb-2 sm:mb-0">
                                    <div className="font-bold text-slate-800 text-lg">{ev.title}</div>
                                    <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                        <span>📅 {new Date(ev.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => handleEditClick(ev)} className="flex-1 sm:flex-none bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                                        Düzenle
                                    </button>
                                    <button onClick={() => handleDelete(ev.id)} className="flex-1 sm:flex-none bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && <p className="text-slate-400 text-center py-10">Henüz oluşturduğunuz bir etkinlik yok.</p>}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}