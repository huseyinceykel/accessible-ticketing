'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Profile() {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tickets, setTickets] = useState<any[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setLoading(false);
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    fetch(`http://localhost:3001/my-tickets/${userData.email}`)
      .then(res => res.json())
      .then(data => {
        setTickets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTickets([]);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="p-10 text-center text-slate-500">Yükleniyor...</div>;

  if (!user)
    return (
      <div className="p-10 text-center">
        <Link href="/login" className="text-indigo-600 font-bold underline">
          Lütfen giriş yapın.
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800">Biletlerim 🎟️</h1>

          <Link
            href="/"
            className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
          >
            <span>←</span> Ana Sayfaya Dön
          </Link>
        </div>

        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 mb-4">Henüz hiç biletiniz yok.</p>
              <Link
                href="/"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
              >
                Hemen Bilet Al
              </Link>
            </div>
          ) : (
            tickets.map(ticket => (
              <div
                key={ticket.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-bold text-xl text-slate-900 mb-1">
                    {ticket.seat?.event?.title || 'Etkinlik'}
                  </h3>

                  <div className="text-slate-500 text-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span>
                        📅{' '}
                        {ticket.seat?.event?.date
                          ? new Date(ticket.seat.event.date).toLocaleDateString()
                          : 'Tarih Yok'}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        📍 {ticket.seat?.event?.location || 'Konum Yok'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-bold border border-indigo-100">
                      Koltuk: {ticket.seat?.label || '?'}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {ticket.id.split('-')[0]}...
                    </span>
                  </div>
                </div>

                <div className="text-right w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 mt-2 md:mt-0 flex flex-row md:flex-col justify-between items-center md:items-end">
                  <div className="text-2xl font-bold text-slate-900">
                    {ticket.pricePaid} ₺
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mt-1">
                    <span>✓</span> ÖDENDİ
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
