export default function Home() {
  return (
    <div className="scanlines">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl">
          <div className="text-xs text-[#888888] mb-4">
            /// REMOTE MEDICAL CONSULTATION SYSTEM
          </div>
          
          <h1 className="mb-8">
            SECURE<br />
            VIDEO<br />
            CONSULTATION
          </h1>

          <div className="grid grid-cols-3 gap-1 bg-[#333333] mb-8 max-w-3xl">
            <div className="bg-[#0A0A0A] p-6">
              <div className="text-4xl font-black mb-2 text-[#E61919]">24/7</div>
              <div className="text-xs">AVAILABILITY</div>
            </div>
            <div className="bg-[#0A0A0A] p-6">
              <div className="text-4xl font-black mb-2 text-[#E61919]">256-BIT</div>
              <div className="text-xs">ENCRYPTION</div>
            </div>
            <div className="bg-[#0A0A0A] p-6">
              <div className="text-4xl font-black mb-2 text-[#E61919]">&lt;150MS</div>
              <div className="text-xs">LATENCY</div>
            </div>
          </div>

          <div className="flex gap-4 mb-12">
            <a href="/register" className="btn btn-primary">
              START CONSULTATION
            </a>
            <a href="/consultants" className="btn">
              BROWSE SPECIALISTS
            </a>
          </div>

          <div className="text-xs text-[#888888] space-y-1">
            <div>[ INTEGRATED PAYMENT GATEWAY / MIDTRANS ]</div>
            <div>[ REAL-TIME VIDEO / AGORA SDK ]</div>
            <div>[ HIPAA COMPLIANT INFRASTRUCTURE ]</div>
          </div>
        </div>
      </section>

      <hr />

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-xs text-[#888888] mb-8">
          /// SYSTEM CAPABILITIES
        </div>

        <div className="grid grid-cols-2 gap-1 bg-[#333333]">
          <div className="bg-[#121212] p-8">
            <div className="text-[#E61919] mb-4">[ 01 ]</div>
            <h3 className="mb-4">APPOINTMENT SCHEDULING</h3>
            <p className="text-xs normal-case leading-relaxed text-[#888888]">
              Real-time availability matrix. Automated reminder system via message queue. 
              15-minute auto-cancellation protocol.
            </p>
          </div>

          <div className="bg-[#121212] p-8">
            <div className="text-[#E61919] mb-4">[ 02 ]</div>
            <h3 className="mb-4">SECURE PAYMENT</h3>
            <p className="text-xs normal-case leading-relaxed text-[#888888]">
              Integrated Midtrans gateway. Webhook-driven transaction processing. 
              Idempotency-protected payment flow.
            </p>
          </div>

          <div className="bg-[#121212] p-8">
            <div className="text-[#E61919] mb-4">[ 03 ]</div>
            <h3 className="mb-4">HD VIDEO CALL</h3>
            <p className="text-xs normal-case leading-relaxed text-[#888888]">
              Agora WebRTC infrastructure. Adaptive bitrate streaming. 
              Redis-backed presence tracking.
            </p>
          </div>

          <div className="bg-[#121212] p-8">
            <div className="text-[#E61919] mb-4">[ 04 ]</div>
            <h3 className="mb-4">ASYNC PROCESSING</h3>
            <p className="text-xs normal-case leading-relaxed text-[#888888]">
              RabbitMQ message broker. Email notification queue. 
              Background worker pool for heavy operations.
            </p>
          </div>
        </div>
      </section>

      <hr />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="mb-8">
            REGISTER NOW
          </h2>
          
          <div className="flex justify-center gap-8 mb-8">
            <a href="/register?role=CLIENT" className="btn">
              I AM A CLIENT
            </a>
            <a href="/register?role=CONSULTANT" className="btn btn-primary">
              I AM A CONSULTANT
            </a>
          </div>

          <div className="text-xs text-[#888888]">
            SYSTEM STATUS: <span className="status-active">OPERATIONAL</span>
          </div>
        </div>
      </section>
    </div>
  );
}
