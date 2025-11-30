'use client';
import { use } from "react";

import { useState, useEffect } from 'react';
import Link from 'next/link';



// ------------------ TYPES ------------------

interface Seat {
  id: number;
  label: string;
  price: number;
  status: 'AVAILABLE' | 'SOLD' | 'occupied';
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

// ------------------ ICON COMPONENT ------------------

const SeatIcon = ({ status, isSelected }: { status: string; isSelected: boolean }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`transition-all duration-300 transform ${
      status === 'occupied' || status === 'SOLD'
        ? 'text-gray-300'
        : isSelected
        ? 'text-indigo-600 scale-110'
        : 'text-current'
    }`}
  >
    <path d="M4 18v3h3v-3h10v3h3v-6a4 4 0 0 0-4-4h-8a4 4 0 0 0-4 4v3zm2-8h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2z" />
  </svg>
);

// ------------------ MODAL ------------------

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
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-emerald-500 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">İşlem Başarılı!</h2>
          <p className="text-emerald-100 text-sm">İyi seyirler dileriz.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Ziyaretçi</p>
            <p className="text-lg font-bold text-slate-800">{name}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Koltuklar</p>
              <p className="text-lg font-bold text-slate-800">{seats.join(', ')}</p>
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
          >
            Tamam, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------ PAGE ------------------

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  console.log("Event ID:", id);

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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    fetch(`http://localhost:3001/events/${id}`)
      .then(res => res.json())
      .then((data: EventDetail) => setEvent(data))
      .catch(() =>
        setStatus({ type: 'error', message: 'Etkinlik yüklenemedi.' })
      );
  }, [id]);

  if (!event) {
    return (
      <div className="text-center py-20 text-slate-500">Yükleniyor...</div>
    );
  }

  const seats = event.seats;
  const maxCol = Math.max(
    ...seats.map(s => parseInt(s.label.replace(/^\D+/g, '')) || 0)
  );
  const colCount = maxCol > 0 ? maxCol : 4;

  const isEventPast = new Date(event.date) < new Date();

  const totalPrice = selectedSeats.reduce((total, seatLabel) => {
    const seat = seats.find(s => s.label === seatLabel);
    return total + (seat?.price || 0);
  }, 0);


  // ------------------ ACTIONS ------------------

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'SOLD' || seat.status === 'occupied' || isEventPast) return;

    setSelectedSeats((prev) =>
      prev.includes(seat.label) ? prev.filter((s) => s !== seat.label) : [...prev, seat.label]
    );

    setStatus({ type: '', message: '' });
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return setStatus({ type: 'error', message: 'Giriş yapın.' });
    if (selectedSeats.length === 0)
      return setStatus({ type: 'error', message: 'Koltuk seçin.' });
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

  // ------------------ RENDER ------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            D
          </div>

          <Link href="/" className="text-xl font-bold text-slate-800 hover:opacity-80">
            DevFest<span className="text-indigo-600">Bilet</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-bold text-indigo-600">{user.name}</span>
              <Link href="/profile" className="text-sm underline text-slate-500">
                Biletlerim
              </Link>
            </>
          ) : (
            <Link href="/login" className="text-sm font-bold text-indigo-600">
              Giriş Yap
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Buraya koltuk grid + ödeme formu ekle (senin UI kullanılıyor) */}
        {/* ------------------ KOLTUKLAR ------------------ */}

        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* SOL TARAF */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

              <div className="flex flex-wrap gap-4 text-slate-500 text-sm mb-8">
                <span>📅 {new Date(event.date).toLocaleString()}</span>
                <span>📍 {event.location}</span>
                <span>💰 {event.price} ₺</span>
              </div>

              {/* GRID */}
              <div className="overflow-x-auto pb-4">
                <div className="flex justify-center min-w-max px-4">
                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
                  >
                    {seats.map((seat) => {
                      const isSelected = selectedSeats.includes(seat.label);
                      const isSold =
                        seat.status === 'SOLD' || seat.status === 'occupied';

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatSelect(seat)}
                          disabled={isSold || isEventPast}
                          className={`
                            relative flex flex-col items-center justify-center p-1 rounded-lg border-2
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
                            <SeatIcon
                              status={seat.status}
                              isSelected={isSelected}
                            />
                          </div>
                          <span className="text-[10px] font-bold">{seat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SAĞ TARAF — ÖDEME FORMU */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-50">
              <h2 className="text-lg font-bold mb-4">Bilet Özeti</h2>

              <form onSubmit={handleBuy} className="space-y-5">

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map((lbl) => {
                      const s = seats.find((x) => x.label === lbl);
                      return (
                        <div key={lbl} className="flex justify-between">
                          <span className="font-bold">{lbl}</span>
                          <span>{s?.price} ₺</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-400 text-center text-sm">
                      Henüz koltuk seçilmedi
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Toplam</span>
                  <span>{totalPrice} ₺</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                    Kart Numarası
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300"
                    maxLength={16}
                    placeholder="0000 0000 0000 0000"
                  />
                </div>

                {status.message && (
                  <div
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
                >
                  {loading ? 'İşleniyor...' : isEventPast ? 'Satış Kapalı' : 'Satın Al'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* ✔ MODAL */}
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
