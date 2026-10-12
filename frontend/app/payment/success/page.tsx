'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      router.push('/appointments');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchTransaction(token);
  }, [orderId, router]);

  const fetchTransaction = async (token: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/payments/${orderId}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTransaction(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="scanlines min-h-screen flex items-center justify-center">
        <div className="text-xs">[ LOADING PAYMENT STATUS... ]</div>
      </div>
    );
  }

  return (
    <div className="scanlines min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <div className="text-[#4AF626] text-8xl mb-4">✓</div>
          <h1 className="text-6xl mb-4">PAYMENT SUCCESS</h1>
          <div className="text-xs text-[#888888]">
            [ TRANSACTION COMPLETED ]
          </div>
        </div>

        {transaction && (
          <div className="bg-[#121212] border-2 border-[#4AF626] p-8 mb-8">
            <div className="grid gap-4 text-left">
              <div>
                <div className="text-xs text-[#888888] mb-1">[ ORDER ID ]</div>
                <div className="font-mono text-sm break-all">{transaction.id}</div>
              </div>
              <div>
                <div className="text-xs text-[#888888] mb-1">[ AMOUNT ]</div>
                <div className="text-xl">IDR {transaction.amount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-[#888888] mb-1">[ STATUS ]</div>
                <div className="text-[#4AF626]">{transaction.status}</div>
              </div>
              {transaction.paidAt && (
                <div>
                  <div className="text-xs text-[#888888] mb-1">[ PAID AT ]</div>
                  <div className="text-sm">{new Date(transaction.paidAt).toLocaleString('id-ID')}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => router.push('/appointments')}
            className="btn btn-primary w-full"
          >
            VIEW MY APPOINTMENTS
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn w-full"
          >
            BACK TO DASHBOARD
          </button>
        </div>

        <div className="mt-8 text-xs text-[#888888]">
          [ CONFIRMATION EMAIL SENT ]
        </div>
      </div>
    </div>
  );
}
