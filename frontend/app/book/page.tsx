'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultantId = searchParams.get('consultant');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    }

    if (!consultantId) {
      router.push('/consultants');
    }
  }, [router, consultantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const scheduledAt = new Date(`${date}T${time}`);

      const res = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          consultantId,
          scheduledAt: scheduledAt.toISOString(),
          duration
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      alert('Appointment created! Check your email for confirmation.');
      router.push('/appointments');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scanlines min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-xs text-[#888888] mb-4">
          /// APPOINTMENT BOOKING SYSTEM
        </div>

        <h1 className="text-6xl mb-12">BOOK APPOINTMENT</h1>

        {error && (
          <div className="border-2 border-[#E61919] bg-[#121212] p-4 mb-6">
            <div className="text-[#E61919] text-xs">
              [ ERROR ] {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs mb-2">
                [ DATE ]
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-xs mb-2">
                [ TIME ]
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-2">
              [ DURATION (MINUTES) ]
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={loading}
            >
              <option value={30}>30 MINUTES</option>
              <option value={60}>60 MINUTES</option>
              <option value={90}>90 MINUTES</option>
              <option value={120}>120 MINUTES</option>
            </select>
          </div>

          <hr />

          <div className="bg-[#121212] p-6 border-2 border-[#333333]">
            <div className="text-xs text-[#888888] mb-4">
              [ BOOKING CONFIRMATION ]
            </div>
            <div className="space-y-2 text-sm">
              <div>DATE: {date || '[ NOT SET ]'}</div>
              <div>TIME: {time || '[ NOT SET ]'}</div>
              <div>DURATION: {duration} MINUTES</div>
              <div className="text-[#E61919]">STATUS: PENDING PAYMENT</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? '[ CREATING APPOINTMENT... ]' : '[ CONFIRM BOOKING ]'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn"
              disabled={loading}
            >
              CANCEL
            </button>
          </div>
        </form>

        <div className="mt-8 text-xs text-[#888888] space-y-1">
          <div>[ PAYMENT REQUIRED AFTER BOOKING ]</div>
          <div>[ EMAIL CONFIRMATION WILL BE SENT ]</div>
          <div>[ CANCELLATION AVAILABLE UNTIL 24H BEFORE ]</div>
        </div>
      </div>
    </div>
  );
}
