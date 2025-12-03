'use client';
import { use } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ------------------ TYPES ------------------ */
interface Seat {
  id: number;
  label: string;
  price: number;
  status: 'AVAILABLE' | 'LOCKED' | 'SOLD' | 'occupied';
  lockedByUserId?: number | null;
  lockedUntil?: string | null;
}

interface EventDetail {
  id: number;
  title: string;
  location: string;
  date: string;
  price: number;
  seats: Seat[];
}

interface User {
  name: string;
  email: string;
}

/* ------------------ ICON ------------------ */
const SeatIcon = ({ status, isSelected }: { status: string; isSelected: boolean }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`transition-all duration-300 transform ${
      status === 'occupied' || status === 'SOLD' || status === 'LOCKED'
        ? 'text-gray-300'
        : isSelected
        ? 'text-indigo-600 scale-110'
        : 'text-current'
    }`}
    aria-hidden="true"
  >
    <path d="M4 18v3h3v-3h10v3h3v-6a4 4 0 0 0-4-4h-8a4 4 0 0 0-4 4v3zm2-8h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2z" />
  </svg>
);

/* ------------------ SUCCESS MODAL ------------------ */
const SuccessModal = ({
  isOpen,
  onClose,
  seats,
  name,
  totalPrice,
}: {
  isOpen: boolean;
  onClose: () => void;
  seats: string[];
  name: string;
  totalPrice: number;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
      aria-describedby="success-desc"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-emerald-500 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 id="success-title" className="text-2xl font-bold text-white">
            İşlem Başarılı!
          </h2>
          <p id="success-desc" className="text-emerald-100 text-sm">
            Koltuklarınız başarıyla satın alındı. İyi seyirler dileriz.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Ziyaretçi</p>
            <p className="text-lg font-bold text-slate-800">{name}</p>
          </div>

          <div className="flex gap-4" aria-label="Seçilen koltuk ve toplam tutar">
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Koltuklar</p>
              <p className="text-lg font-bold text-slate-800">
                {seats.length > 0 ? seats.join(', ') : 'Koltuk bilgisi yok'}
              </p>
            </div>

            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Tutar</p>
              <p className="text-lg font-bold text-emerald-600">{totalPrice} ₺</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
            aria-label="Bilet özetini kapat ve profil sayfasına dön"
          >
            Tamam, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------ PAGE ------------------ */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: string; message: string }>({
    type: '',
    message: '',
  });
  const [showModal, setShowModal] = useState(false);

  /* ------------------ LOAD USER + EVENT ------------------ */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    fetch(`http://localhost:3001/events/${id}`)
      .then((res) => res.json())
      .then((data: EventDetail) => setEvent(data))
      .catch(() => setStatus({ type: 'error', message: 'Etkinlik yüklenemedi.' }));
  }, [id]);

  /* 🔄 5 SANİYEDE BİR OTOMATİK YENİLEME */
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`http://localhost:3001/events/${id}`)
        .then((res) => res.json())
        .then((data: EventDetail) => setEvent(data));
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (!event) {
    return (
      <div
        className="text-center py-20 text-slate-500"
        role="status"
        aria-live="polite"
      >
        Yükleniyor...
      </div>
    );
  }

  const seats = event.seats;
  const maxCol = Math.max(...seats.map((s) => parseInt(s.label.replace(/^\D+/g, '')) || 0));
  const colCount = maxCol || 4;

  const isEventPast = new Date(event.date) < new Date();

  const totalPrice = selectedSeats.reduce((total, lbl) => {
    const seat = seats.find((s) => s.label === lbl);
    return total + (seat?.price || 0);
  }, 0);

  /* ------------------ HANDLE SEAT SELECT ------------------ */
  const handleSeatSelect = async (seat: Seat) => {
    if (seat.status === 'SOLD' || seat.status === 'occupied' || seat.status === 'LOCKED' || isEventPast) return;

    if (!user) {
      setStatus({ type: 'error', message: 'Koltuk seçmek için giriş yapın.' });
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/lock-seat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: Number(id),
          seatCode: seat.label,
          email: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', message: data.message });
        return;
      }

      setSelectedSeats((prev) =>
        prev.includes(seat.label) ? prev.filter((s) => s !== seat.label) : [...prev, seat.label]
      );

      setStatus({ type: '', message: '' });
    } catch {
      setStatus({ type: 'error', message: 'Koltuk seçimi sırasında hata oluştu.' });
    }
  };

  /* ------------------ BUY ------------------ */
  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return setStatus({ type: 'error', message: 'Giriş yapın.' });
    if (selectedSeats.length === 0) return setStatus({ type: 'error', message: 'Koltuk seçin.' });
    if (!cardNumber) return setStatus({ type: 'error', message: 'Kart numarası gerekli.' });

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/buy-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: selectedSeats,
          email: user.email,
          cardNumber,
          eventId: Number(id),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(true);
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch {
      setStatus({ type: 'error', message: 'Sunucu hatası.' });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSeats([]);
    setCardNumber('');
    window.location.href = '/profile';
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Skip link RootLayout'tan geliyorsa burada tekrar eklemiyoruz */}

      <nav
        className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0"
        aria-label="Üst menü"
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
            className="text-xl font-bold text-slate-800 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            aria-label="Ana sayfaya dön"
          >
            DevFest<span className="text-indigo-600">Bilet</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span
                className="text-sm font-bold text-indigo-600"
                aria-label={`Giriş yapan kullanıcı: ${user.name}`}
              >
                {user.name}
              </span>
              <Link
                href="/profile"
                className="text-sm underline text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                aria-label="Biletlerim sayfasına git"
              >
                Biletlerim
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              aria-label="Giriş yap"
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </nav>

      {/* Ana içerik — ikinci bir <main> kullanmıyoruz, RootLayout'taki main yeterli */}
      <section
        className="max-w-7xl mx-auto p-4 lg:p-8"
        aria-labelledby="event-title"
      >
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* SOL TARAF */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <h1 id="event-title" className="text-3xl font-bold mb-4">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-slate-500 text-sm mb-8" aria-label="Etkinlik bilgileri">
                <span>📅 {new Date(event.date).toLocaleString()}</span>
                <span>📍 {event.location}</span>
                <span>💰 {event.price} ₺</span>
              </div>

              {/* KOLTUK GRID */}
              <div className="overflow-x-auto pb-4" aria-label="Koltuk seçimi">
                <div className="flex justify-center min-w-max px-4">
                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
                    role="group"
                    aria-label="Koltuklar"
                  >
                    {seats.map((seat) => {
                      const isSelected = selectedSeats.includes(seat.label);
                      const isSold =
                        seat.status === 'SOLD' || seat.status === 'occupied' || seat.status === 'LOCKED';

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatSelect(seat)}
                          disabled={isSold || isEventPast}
                          aria-label={`Koltuk ${seat.label} — ${
                            isSold ? 'Dolu' : isSelected ? 'Seçili' : 'Müsait'
                          }`}
                          aria-pressed={isSelected}
                          className={`relative flex flex-col items-center justify-center p-1 rounded-lg border-2
                            w-12 h-12 transition-all
                            ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : isSold
                                ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                                : 'bg-white border-slate-200 hover:shadow-md'
                            }
                          `}
                        >
                          <div className="w-6 h-6">
                            <SeatIcon status={seat.status} isSelected={isSelected} />
                          </div>
                          {/* Görsel label, screen reader için gerek yok */}
                          <span className="text-[10px] font-bold" aria-hidden="true">
                            {seat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ TARAF */}
          <div className="lg:col-span-4">
            <section
              className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-50"
              aria-labelledby="ticket-summary-title"
            >
              <h2 id="ticket-summary-title" className="text-lg font-bold mb-4">
                Bilet Özeti
              </h2>

              <form onSubmit={handleBuy} className="space-y-5">
                {/* Seçili koltuk listesi */}
                <div
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto"
                  aria-label="Seçilen koltuklar"
                >
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map((lbl) => {
                      const seat = seats.find((x) => x.label === lbl);
                      return (
                        <div
                          key={lbl}
                          className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-slate-100"
                        >
                          <div>
                            <span className="font-bold">Koltuk {lbl}</span>
                            <span className="ml-2 text-slate-500 text-sm">{seat?.price} ₺</span>
                          </div>

                          {/* ❌ SİL BUTONU */}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSeats((prev) => prev.filter((s) => s !== lbl))
                            }
                            className="text-red-500 hover:text-red-700 text-lg font-bold"
                            aria-label={`Koltuk ${lbl} seçimden çıkar`}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-400 text-center text-sm">
                      Henüz koltuk seçilmedi.
                    </p>
                  )}
                </div>

                <div
                  className="flex justify-between items-center text-lg font-bold"
                  aria-live="polite"
                >
                  <span>Toplam</span>
                  <span>{totalPrice} ₺</span>
                </div>

                <div>
                  <label
                    htmlFor="card-number"
                    className="text-xs font-bold text-slate-500 uppercase mb-1 block"
                  >
                    Kart Numarası
                  </label>
                  <input
                    id="card-number"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300"
                    maxLength={16}
                    placeholder="0000 0000 0000 0000"
                    aria-required="true"
                  />
                </div>

                {status.message && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`p-3 rounded-lg text-sm font-medium ${
                      status.type === 'error'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || selectedSeats.length === 0 || isEventPast}
                  className={`w-full py-4 px-6 rounded-xl text-white font-bold ${
                    loading || selectedSeats.length === 0 || isEventPast
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  aria-disabled={loading || selectedSeats.length === 0 || isEventPast}
                  aria-label={
                    isEventPast
                      ? 'Etkinlik tarihi geçtiği için bilet satışı kapalı'
                      : 'Seçili koltuklar için satın alma işlemini tamamla'
                  }
                >
                  {loading ? 'İşleniyor...' : isEventPast ? 'Satış Kapalı' : 'Satın Al'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </section>

      {/* MODAL */}
      <SuccessModal
        isOpen={showModal}
        onClose={handleModalClose}
        seats={selectedSeats}
        name={user?.name || ''}
        totalPrice={totalPrice}
      />
    </div>
  );
}
