'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Consultant {
  id: string;
  email: string;
  profile: {
    name: string;
    specialty?: string;
    hourlyRate?: number;
  };
}

export default function ConsultantsPage() {
  const router = useRouter();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - will fetch from API later
    setConsultants([
      {
        id: 'demo-1',
        email: 'dr.smith@example.com',
        profile: {
          name: 'DR. SARAH SMITH',
          specialty: 'CARDIOLOGY',
          hourlyRate: 500000
        }
      },
      {
        id: 'demo-2',
        email: 'dr.jones@example.com',
        profile: {
          name: 'DR. MICHAEL JONES',
          specialty: 'NEUROLOGY',
          hourlyRate: 600000
        }
      }
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="scanlines min-h-screen flex items-center justify-center">
        <div className="text-xs">[ LOADING CONSULTANTS... ]</div>
      </div>
    );
  }

  return (
    <div className="scanlines">
      <div className="container mx-auto px-4 py-12">
        <div className="text-xs text-[#888888] mb-4">
          /// AVAILABLE CONSULTANTS
        </div>

        <h1 className="text-6xl mb-12">SPECIALISTS</h1>

        <div className="grid gap-1 bg-[#333333]">
          {consultants.map((consultant) => (
            <div key={consultant.id} className="bg-[#121212] p-8">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div>
                  <div className="text-xs text-[#888888] mb-2">[ NAME ]</div>
                  <h3 className="text-2xl mb-2">{consultant.profile.name}</h3>
                  <div className="text-xs text-[#E61919]">
                    {consultant.profile.specialty || 'GENERAL'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#888888] mb-2">[ RATE / HOUR ]</div>
                  <div className="text-xl">
                    IDR {consultant.profile.hourlyRate?.toLocaleString() || '0'}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => router.push(`/book?consultant=${consultant.id}`)}
                    className="btn btn-primary"
                  >
                    BOOK APPOINTMENT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {consultants.length === 0 && (
          <div className="text-center py-12 text-[#888888]">
            [ NO CONSULTANTS AVAILABLE ]
          </div>
        )}
      </div>
    </div>
  );
}
