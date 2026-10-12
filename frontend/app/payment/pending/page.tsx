'use client';

import { useRouter } from 'next/navigation';

export default function PaymentPendingPage() {
  const router = useRouter();

  return (
    <div className="scanlines min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <div className="text-[#E61919] text-8xl mb-4 animate-pulse">⧗</div>
          <h1 className="text-6xl mb-4">PAYMENT PENDING</h1>
          <div className="text-xs text-[#888888]">
            [ AWAITING CONFIRMATION ]
          </div>
        </div>

        <div className="bg-[#121212] border-2 border-[#E61919] p-8 mb-8">
          <div className="text-sm text-[#888888] space-y-2">
            <div>Your payment is being processed.</div>
            <div>You will receive confirmation via email.</div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/appointments')}
            className="btn btn-primary w-full"
          >
            VIEW APPOINTMENTS
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn w-full"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
}
