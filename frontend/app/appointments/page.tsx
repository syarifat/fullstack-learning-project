'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  consultant?: {
    profile: { name: string };
  };
  client?: {
    profile: { name: string };
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchAppointments(token);
  }, [router]);

  const fetchAppointments = async (token: string) => {
    try {
      const res = await fetch('http://localhost:3001/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/appointments/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to cancel');

      fetchAppointments(token);
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="scanlines min-h-screen flex items-center justify-center">
        <div className="text-xs">[ LOADING APPOINTMENTS... ]</div>
      </div>
    );
  }

  return (
    <div className="scanlines">
      <div className="container mx-auto px-4 py-12">
        <div className="text-xs text-[#888888] mb-4">
          /// APPOINTMENT MANAGEMENT
        </div>

        <h1 className="text-6xl mb-12">MY APPOINTMENTS</h1>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#888888] mb-8">[ NO APPOINTMENTS FOUND ]</div>
            <a href="/consultants" className="btn btn-primary">
              BOOK YOUR FIRST APPOINTMENT
            </a>
          </div>
        ) : (
          <div className="grid gap-1 bg-[#333333]">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-[#121212] p-8">
                <div className="grid md:grid-cols-4 gap-8 items-center">
                  <div>
                    <div className="text-xs text-[#888888] mb-2">
                      [ {user?.role === 'CLIENT' ? 'CONSULTANT' : 'CLIENT'} ]
                    </div>
                    <div className="text-lg">
                      {user?.role === 'CLIENT' 
                        ? apt.consultant?.profile.name 
                        : apt.client?.profile.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#888888] mb-2">[ SCHEDULED ]</div>
                    <div className="text-sm">
                      {new Date(apt.scheduledAt).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#888888] mb-2">[ STATUS ]</div>
                    <div className={`text-sm ${
                      apt.status === 'CONFIRMED' ? 'text-[#4AF626]' :
                      apt.status === 'CANCELLED' ? 'text-[#888888]' :
                      'text-[#E61919]'
                    }`}>
                      {apt.status}
                    </div>
                  </div>

                  <div className="text-right">
                    {apt.status === 'PENDING_PAYMENT' || apt.status === 'CONFIRMED' ? (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="btn text-sm"
                      >
                        CANCEL
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
