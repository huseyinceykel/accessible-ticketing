'use client';

import { useState, useEffect, use } from 'react';
// import Link from 'next/link'; // Build hatası nedeniyle geçici olarak devre dışı
// import { useRouter } from 'next/navigation'; // Build hatası nedeniyle geçici olarak devre dışı

// --- ALT BİLEŞENLER (ICON & MODAL) ---

const SeatIcon = ({ status, isSelected }: { status: string, isSelected: boolean }) => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" 
    className={`transition-all duration-300 transform ${status === 'occupied' || status === 'SOLD' ? 'text-gray-300' : isSelected ? 'text-indigo-600 scale-110' : 'text-current'}`}
  >
    <path d="M4 18v3h3v-3h10v3h3v-6a4 4 0 0 0-4-4h-8a4 4 0 0 0-4 4v3zm2-8h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2z" />
  </svg>
);

const SuccessModal = ({ isOpen, onClose, seats, name, totalPrice }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-bounce-in">
        <div className="bg-emerald-500 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">İşlem Başarılı!</h2>
          <p className="text-emerald-100 text-sm">İyi seyirler dileriz.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Ziyaretçi</p>
            <p className="text-lg font-bold text-slate-800">{name}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Koltuklar</p>
              <p className="text-lg font-bold text-slate-800">{seats.join(', ')}</p>
            </div>
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Tutar</p>
              <p className="text-lg font-bold text-emerald-600">{totalPrice} ₺</p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">Tamam, Kapat</button>
        </div>
      </div>
    </div>
  );
};

// --- SAYFA ---

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Next.js 15 için params çözümü
  const [event, setEvent] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showModal, setShowModal] = useState(false);
  // const router = useRouter(); // Build hatası nedeniyle devre dışı

  // Veri Çekme
  useEffect(() => {
    // 1. Kullanıcı Kontrolü
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // 2. Etkinlik Detayı Çekme
    fetch(`http://localhost:3001/events/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Etkinlik bulunamadı');
        return res.json();
      })
      .then(data => setEvent(data))
      .catch(err => setStatus({ type: 'error', message: 'Etkinlik yüklenemedi.' }));
  }, [id]);

  // Koltuk Sütun Sayısını Hesapla (Dynamic Grid)
  const getColCount = (seats: any[]) => {
    if (!seats || seats.length === 0) return 4;
    // Label'ın sonundaki sayıyı al (A12 -> 12)
    const maxCol = Math.max(...seats.map(s => parseInt(s.label.replace(/^\D+/g, '')) || 0));
    return maxCol > 0 ? maxCol : 4;
  };

  const seats = event?.seats || [];
  const colCount = getColCount(seats);

  // Tarih Kontrolü: Etkinlik geçti mi?
  const isEventPast = event ? new Date(event.date) < new Date() : false;

  const totalPrice = selectedSeats.reduce((total, seatLabel) => {
    const seat = seats.find((s: any) => s.label === seatLabel);
    return total + (seat ? seat.price : 0);
  }, 0);

  const handleSeatSelect = (seat: any) => {
    if (seat.status === 'SOLD' || seat.status === 'occupied' || isEventPast) return;
    if (selectedSeats.includes(seat.label)) {
      setSelectedSeats(prev => prev.filter(l => l !== seat.label));
    } else {
      setSelectedSeats(prev => [...prev, seat.label]);
    }
    setStatus({ type: '', message: '' });
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setStatus({ type: 'error', message: 'Satın almak için lütfen giriş yapın.' });
    if (selectedSeats.length === 0) return setStatus({ type: 'error', message: 'Lütfen koltuk seçin.' });
    if (!cardNumber) return setStatus({ type: 'error', message: 'Kart numarasını girin.' });
    if (isEventPast) return setStatus({ type: 'error', message: 'Bu etkinlik sona erdi.' });

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/buy-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          seats: selectedSeats, 
          email: user.email, 
          cardNumber,
          eventId: Number(id) 
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setShowModal(true);
        setStatus({ type: '', message: '' });
      } else {
        setStatus({ type: 'error', message: `❌ ${data.message}` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Sunucu hatası.' });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSeats([]);
    setCardNumber('');
    // router.push('/profile'); yerine:
    window.location.href = '/profile';
  };

  if (!event) return <div className="text-center py-20 text-slate-500">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
           {/* Link yerine a etiketi */}
           <a href="/" className="text-xl font-bold tracking-tight text-slate-800 hover:opacity-80">
             DevFest<span className="text-indigo-600">Bilet</span>
           </a>
        </div>
        <div className="flex items-center gap-4">
            {user ? (
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-indigo-600">{user.name}</span>
                    <a href="/profile" className="text-sm underline text-slate-500 hover:text-indigo-600">Biletlerim</a>
                </div>
            ) : (
                <a href="/login" className="text-sm font-bold text-indigo-600">Giriş Yap</a>
            )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* SOL: KOLTUKLAR */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                
                {/* Etkinlik Başlığı */}
                <div className="mb-8 border-b pb-4">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.title}</h1>
                  <div className="flex flex-wrap gap-4 text-slate-500 text-sm">
                    <span className="flex items-center gap-1">📅 {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="flex items-center gap-1">📍 {event.location}</span>
                    <span className="flex items-center gap-1">💰 Taban Fiyat: {event.price} ₺</span>
                  </div>
                </div>
                
                {/* Sahne */}
                <div className="flex flex-col items-center mb-10">
                  <div className="w-2/3 h-12 bg-gradient-to-b from-indigo-50 to-white border-t-4 border-indigo-200 rounded-t-[50%] shadow-lg transform perspective-1000 rotate-x-12 flex items-center justify-center text-indigo-300 font-bold tracking-[0.5em] text-xs uppercase">SAHNE</div>
                </div>

                {/* Koltuk Grid Container (Scroll edilebilir) */}
                <div className="overflow-x-auto pb-4">
                    <div className="flex justify-center min-w-max px-4">
                    {/* DİNAMİK GRID */}
                    <div 
                        className="grid gap-2"
                        style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
                    >
                        {seats.map((seat: any) => {
                        const isSelected = selectedSeats.includes(seat.label);
                        const isSold = seat.status === 'SOLD' || seat.status === 'occupied';
                        
                        // Fiyat Kategorisi Rengi
                        let seatColorClass = 'text-slate-500 hover:text-indigo-500'; // Standart (Orta)
                        let borderColorClass = 'border-slate-200 bg-white';

                        if (seat.price > event.price) { 
                            // Ön (Pahalı)
                            seatColorClass = 'text-orange-600 hover:text-orange-500';
                            borderColorClass = 'border-orange-200 bg-orange-50';
                        } else if (seat.price < event.price) {
                            // Arka (Ucuz)
                            seatColorClass = 'text-emerald-600 hover:text-emerald-500';
                            borderColorClass = 'border-emerald-200 bg-emerald-50';
                        }

                        if (isSold) {
                            seatColorClass = 'text-slate-300';
                            borderColorClass = 'bg-slate-100 border-slate-200';
                        }

                        if (isEventPast) {
                            seatColorClass = 'text-slate-300';
                            borderColorClass = 'bg-slate-50 border-slate-200';
                        }

                        return (
                            <button key={seat.id} onClick={() => handleSeatSelect(seat)} disabled={isSold || isEventPast}
                            aria-label={`${seat.label}, Fiyat: ${seat.price} TL ${isSold ? '(Dolu)' : ''}`}
                            className={`
                                relative flex flex-col items-center justify-center p-1 rounded-lg border-2 transition-all
                                w-12 h-12
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                                ${isSold || isEventPast
                                    ? 'cursor-not-allowed opacity-60' 
                                    : isSelected 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-110 z-10' 
                                        : `${borderColorClass} ${seatColorClass} hover:shadow-md`}
                            `}
                            >
                            <div className="w-6 h-6">
                                <SeatIcon status={isSold ? 'occupied' : 'available'} isSelected={isSelected} />
                            </div>
                            <span className="text-[10px] font-bold mt-[-2px]">{seat.label}</span>
                            
                            {/* Hover Fiyat Tooltip */}
                            {!isSold && !isEventPast && (
                                <span className="absolute -top-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                {seat.price} ₺
                                </span>
                            )}
                            </button>
                        );
                        })}
                    </div>
                    </div>
                </div>
                
                {/* Lejant */}
                <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-slate-500 border-t pt-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded"></div> Ön ({Math.round(event.price * 1.5)}₺)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-slate-200 rounded"></div> Orta ({event.price}₺)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-50 border border-emerald-200 rounded"></div> Arka ({Math.round(event.price * 0.8)}₺)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 rounded"></div> Dolu</div>
                </div>

              </div>
            </div>

            {/* SAĞ: ÖDEME FORMU (Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-50">
                <h2 className="text-lg font-bold mb-6 text-slate-800 border-b pb-4">Bilet Özeti</h2>
                <form onSubmit={handleBuy} className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                    {selectedSeats.length > 0 ? (
                      <div className="space-y-2">
                          {selectedSeats.map(lbl => {
                            const s = seats.find((x: any) => x.label === lbl);
                            return (
                                <div key={lbl} className="flex justify-between text-sm items-center">
                                    <span className="font-bold text-slate-700 bg-white border px-2 rounded">{lbl}</span>
                                    <span className="text-slate-500">{s?.price} ₺</span>
                                </div>
                            );
                          })}
                      </div>
                    ) : (<p className="text-slate-400 text-center text-sm">Henüz koltuk seçilmedi</p>)}
                  </div>

                  <div className="flex justify-between items-center text-lg font-bold text-indigo-900 border-t pt-4">
                        <span>Toplam Tutar</span>
                        <span>{totalPrice} ₺</span>
                  </div>
                  
                  {!user && (
                    <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-100">
                      Ödeme yapmak için lütfen <a href="/login" className="underline font-bold">giriş yapın</a>.
                    </div>
                  )}

                  {isEventPast && (
                    <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200 font-bold text-center">
                      ⚠️ Bu etkinlik sona erdi.
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kart Numarası</label>
                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} disabled={!user || isEventPast} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-4 focus:ring-indigo-100 outline-none font-mono tracking-widest disabled:bg-slate-100" placeholder="0000 0000 0000 0000" maxLength={16} />
                  </div>

                  {status.message && (<div role="alert" className={`p-3 rounded-lg text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{status.message}</div>)}
                  
                  <button type="submit" disabled={loading || !user || selectedSeats.length === 0 || isEventPast} className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${loading || !user || selectedSeats.length === 0 || isEventPast ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'}`}>
                    {isEventPast ? 'Satış Kapandı' : (loading ? 'İşleniyor...' : 'Satın Al')}
                  </button>
                </form>
              </div>
            </div>
        </div>
      </main>

      <SuccessModal isOpen={showModal} onClose={handleModalClose} seats={selectedSeats} name={user?.name} totalPrice={totalPrice} />
    </div>
  );
}