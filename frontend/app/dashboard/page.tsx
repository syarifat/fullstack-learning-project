'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
  profile: {
    name: string;
    specialty?: string;
    hourlyRate?: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchAnalytics(token);
  }, [router]);

  const fetchAnalytics = async (token: string) => {
    try {
      const res = await fetch('http://localhost:3001/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="scanlines min-h-screen flex items-center justify-center">
        <div className="text-xs">[ LOADING SYSTEM... ]</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="scanlines">
      <div className="container mx-auto px-4 py-12">
        <div className="text-xs text-[#888888] mb-4">
          /// USER CONTROL PANEL
        </div>

        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-6xl mb-4">DASHBOARD</h1>
            <div className="text-xs text-[#888888]">
              LOGGED IN AS: <span className="text-[#EAEAEA]">{user.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn">
            [ LOGOUT ]
          </button>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-3 gap-1 bg-[#333333] mb-12">
          <div className="bg-[#121212] p-6">
            <div className="text-xs text-[#888888] mb-2">[ USER ID ]</div>
            <div className="font-mono text-sm break-all">{user.id}</div>
          </div>
          <div className="bg-[#121212] p-6">
            <div className="text-xs text-[#888888] mb-2">[ NAME ]</div>
            <div className="font-mono text-sm">{user.profile.name}</div>
          </div>
          <div className="bg-[#121212] p-6">
            <div className="text-xs text-[#888888] mb-2">[ ROLE ]</div>
            <div className={`font-mono text-sm ${user.role === 'CONSULTANT' ? 'text-[#E61919]' : 'text-[#4AF626]'}`}>
              {user.role}
            </div>
          </div>
        </div>

        <hr />

        {/* Analytics */}
        {analytics && (
          <>
            <div className="py-12">
              <h2 className="text-4xl mb-8">STATISTICS</h2>

              <div className="grid grid-cols-4 gap-1 bg-[#333333]">
                <div className="bg-[#121212] p-6 text-center">
                  <div className="text-4xl font-black mb-2 text-[#E61919]">
                    {analytics.totalAppointments || 0}
                  </div>
                  <div className="text-xs">TOTAL APPOINTMENTS</div>
                </div>
                <div className="bg-[#121212] p-6 text-center">
                  <div className="text-4xl font-black mb-2 text-[#4AF626]">
                    {analytics.completedAppointments || 0}
                  </div>
                  <div className="text-xs">COMPLETED</div>
                </div>
                {user?.role === 'CONSULTANT' ? (
                  <>
                    <div className="bg-[#121212] p-6 text-center">
                      <div className="text-4xl font-black mb-2 text-[#E61919]">
                        {analytics.completionRate || 0}%
                      </div>
                      <div className="text-xs">COMPLETION RATE</div>
                    </div>
                    <div className="bg-[#121212] p-6 text-center">
                      <div className="text-2xl font-black mb-2">
                        IDR {(analytics.totalRevenue || 0).toLocaleString()}
                      </div>
                      <div className="text-xs">TOTAL REVENUE</div>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#121212] p-6 text-center col-span-2">
                    <div className="text-2xl font-black mb-2">
                      IDR {(analytics.totalSpent || 0).toLocaleString()}
                    </div>
                    <div className="text-xs">TOTAL SPENT</div>
                  </div>
                )}
              </div>
            </div>

            <hr />
          </>
        )}

        {/* Quick Actions */}
        <div className="py-12">
          <h2 className="text-4xl mb-8">QUICK ACTIONS</h2>

          <div className="grid grid-cols-2 gap-4">
            {user.role === 'CLIENT' ? (
              <>
                <a href="/consultants" className="btn btn-primary text-center py-8">
                  BOOK APPOINTMENT
                </a>
                <a href="/appointments" className="btn text-center py-8">
                  MY APPOINTMENTS
                </a>
              </>
            ) : (
              <>
                <a href="/appointments" className="btn btn-primary text-center py-8">
                  VIEW APPOINTMENTS
                </a>
                <a href="/availability" className="btn text-center py-8">
                  MANAGE AVAILABILITY
                </a>
              </>
            )}
          </div>
        </div>

        <hr />

        {/* System Status */}
        <div className="py-12">
          <div className="text-xs text-[#888888] mb-4">
            /// SYSTEM STATUS
          </div>
          <div className="grid grid-cols-4 gap-1 bg-[#333333]">
            <div className="bg-[#121212] p-4 text-center">
              <div className="status-active text-2xl mb-2">●</div>
              <div className="text-xs">API ONLINE</div>
            </div>
            <div className="bg-[#121212] p-4 text-center">
              <div className="status-active text-2xl mb-2">●</div>
              <div className="text-xs">DATABASE OK</div>
            </div>
            <div className="bg-[#121212] p-4 text-center">
              <div className="status-active text-2xl mb-2">●</div>
              <div className="text-xs">REDIS CACHE</div>
            </div>
            <div className="bg-[#121212] p-4 text-center">
              <div className="status-active text-2xl mb-2">●</div>
              <div className="text-xs">QUEUE ACTIVE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
