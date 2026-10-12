# PRD: TeleConsult - Platform Konsultasi Video

## Ringkasan
Platform konsultasi online dengan video call, pembayaran, dan penjadwalan appointment. Proyek ini dirancang untuk mempelajari full-stack development dengan fokus pada integrasi komunikasi real-time dan payment gateway.

## Tech Stack

### Backend
- **Framework**: Node.js/Express
- **Database**: PostgreSQL (users, appointments, transactions, analytics)
- **Cache/Session**: Redis (manajemen sesi, rate limiting, real-time presence)
- **Message Queue**: RabbitMQ (notifikasi email, webhook pembayaran, rekaman video)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Real-time**: Socket.io client

### Infrastructure
- **Video/Voice**: Agora SDK
- **Payment**: Midtrans
- **Containerization**: Docker + Docker Compose

## Fitur Utama

### 1. Manajemen User
**Database: PostgreSQL**
```
Tabel:
- users (id, email, password_hash, role, created_at)
- profiles (user_id, name, specialty, hourly_rate, availability)
- sessions (Redis key-value: session_id -> user_data)
```

**Kebutuhan Keamanan:**
- Argon2 password hashing
- JWT dengan refresh token (disimpan di Redis)
- Rate limiting per IP (Redis counter)
- Proteksi CSRF
- Validasi & sanitasi input

### 2. Sistem Appointment
**Database: PostgreSQL**
```
Tabel:
- appointments (id, consultant_id, client_id, scheduled_at, status, duration)
- appointment_slots (consultant_id, day_of_week, start_time, end_time)
```

**Logika Bisnis:**
- Konsultan mengatur slot ketersediaan
- Klien booking waktu yang tersedia
- Auto-cancel setelah 15 menit tidak hadir (RabbitMQ delayed job)
- Pengingat email 1 jam sebelum (RabbitMQ scheduled job)

### 3. Integrasi Pembayaran
**Database: PostgreSQL + RabbitMQ**
```
Tabel:
- transactions (id, appointment_id, amount, payment_method, status, gateway_ref)
- payment_logs (transaction_id, event_type, payload, created_at)
```

**Alur:**
1. Klien booking → buat transaksi (status: pending)
2. Redirect ke payment gateway (Midtrans/Xendit)
3. Gateway webhook → RabbitMQ queue
4. Worker memproses pembayaran → update transaksi
5. Kirim email konfirmasi (via RabbitMQ)

**Keamanan:**
- Verifikasi signature webhook
- Idempotency keys untuk request pembayaran
- Kepatuhan PCI DSS (tidak menyimpan data kartu)

### 4. Integrasi Video Call
**Komunikasi Real-time: Agora/Daily.co**

**Alur:**
1. 5 menit sebelum appointment → generate room token (backend)
2. Simpan room_id di Redis (TTL: 2 jam)
3. Frontend join room dengan token
4. Track durasi call (Redis counter)
5. Akhiri call → log durasi ke PostgreSQL

**Redis Keys:**
```
room:{appointment_id} -> {token, expires_at, participants[]}
presence:{user_id} -> {status, last_seen}
```

### 5. Pemrosesan Async (RabbitMQ)
**Queue:**
- `email.notifications` - pengingat appointment, konfirmasi
- `payment.webhooks` - proses callback pembayaran

**Pola Worker:**
```javascript
// Contoh Consumer
channel.consume('email.notifications', async (msg) => {
  const { to, template, data } = JSON.parse(msg.content);
  await sendEmail(to, template, data);
  channel.ack(msg);
});
```

### 6. Analytics (PostgreSQL)
**Tujuan:** Query langsung ke tabel transaksional dengan optimasi indeks

**Implementasi:**
1. Query dengan indeks yang tepat (appointment_date, consultant_id, status)
2. Agregasi on-the-fly untuk dashboard
3. Tambah caching di Redis untuk query berat (jika diperlukan)

**Laporan:**
- Revenue per konsultan (harian/bulanan)
- Slot waktu populer
- Tingkat penyelesaian appointment
- Rata-rata durasi sesi

## API Endpoints

### Autentikasi
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
```

### Appointments
```
GET    /api/appointments              # Daftar appointment user
POST   /api/appointments              # Buat booking baru
GET    /api/appointments/:id          # Detail appointment
PATCH  /api/appointments/:id/cancel   # Batalkan appointment
GET    /api/consultants/:id/slots     # Slot waktu yang tersedia
```

### Pembayaran
```
POST   /api/payments/initiate         # Buat pembayaran
POST   /api/payments/webhook          # Callback gateway (tidak autentikasi via JWT)
GET    /api/payments/:id/status       # Cek status pembayaran
```

### Video Call
```
POST   /api/video/token               # Generate room token
GET    /api/video/room/:id            # Status room
POST   /api/video/end                 # Akhiri call & log durasi
```

## Checklist Keamanan

- [ ] Environment variables untuk secrets (jangan commit .env)
- [ ] Helmet.js untuk HTTP headers
- [ ] Rate limiting (express-rate-limit + Redis)
- [ ] Pencegahan SQL injection (parameterized queries)
- [ ] Pencegahan XSS (sanitasi input, CSP headers)
- [ ] Konfigurasi CORS yang tepat
- [ ] Kemampuan rotasi JWT secret
- [ ] Verifikasi signature webhook
- [ ] HTTPS only di production
- [ ] Database connection pooling dengan batas maksimal

## Target Performa

- Waktu respons API: < 200ms (p95)
- Latensi video call: < 150ms
- Redis cache hit rate: > 80%
- Waktu query PostgreSQL: < 50ms (p95)
- Pemrosesan pesan RabbitMQ: < 5 detik

## Fase Pengembangan

### Fase 1: Setup & Fondasi (Minggu 1)
- Setup Docker Compose (PostgreSQL, Redis, RabbitMQ)
- Struktur proyek (monorepo: backend + frontend)
- Skema Prisma + migrasi
- Auth dasar (register, login, JWT)
- Layout frontend Next.js dengan Industrial Brutalist UI

### Fase 2: Fitur Inti (Minggu 2)
- CRUD appointment
- Manajemen ketersediaan konsultan
- Alur booking frontend
- Email service dengan RabbitMQ queue

### Fase 3: Integrasi Pembayaran (Minggu 3)
- Integrasi Midtrans (sandbox)
- Handler webhook via RabbitMQ
- Pelacakan transaksi
- UI status pembayaran

### Fase 4: Video Real-time (Minggu 4)
- Integrasi Agora SDK
- Pembuatan room & generasi token
- UI video call frontend
- Pelacakan durasi call

### Fase 5: Analytics & Polish (Minggu 5)
- Dashboard analytics dengan query langsung
- Optimasi indeks PostgreSQL
- Rate limiting & security hardening
- Error handling & validasi input

### Fase 6: Deploy & CI/CD (Minggu 6)
- Docker production setup
- Pipeline CI/CD (GitHub Actions)
- Script deployment
- Documentation finalisasi

## Tujuan Pembelajaran

Dengan menyelesaikan proyek ini, Anda akan memiliki pengalaman langsung dengan:

✅ **Pola Backend**
- Repository pattern untuk akses database
- Service layer untuk logika bisnis
- Middleware untuk cross-cutting concerns
- Arsitektur event-driven (RabbitMQ)

✅ **Database**
- PostgreSQL: query kompleks, transaksi, indeks, materialized views
- Redis: strategi caching, session store, rate limiting

✅ **Integrasi Third-party**
- Payment gateway (Midtrans/Xendit)
- Video real-time (Agora/Daily.co)
- Penanganan webhook & idempotency

✅ **Frontend**
- Next.js App Router
- Update UI real-time (Socket.io)
- Penanganan & validasi form
- Integrasi WebRTC

✅ **Pemrosesan Asynchronous**
- Pola queue RabbitMQ
- Background workers
- Logika retry & dead-letter queues

✅ **Keamanan**
- Autentikasi & otorisasi
- Validasi & sanitasi input
- Rate limiting
- Penanganan pembayaran yang aman

## Sumber Daya

### Dokumentasi
- PostgreSQL: https://www.postgresql.org/docs/
- Redis: https://redis.io/docs/
- RabbitMQ: https://www.rabbitmq.com/tutorials
- Next.js: https://nextjs.org/docs
- Nuxt: https://nuxt.com/docs

### Payment Gateways
- Midtrans: https://docs.midtrans.com/

### Platform Video
- Agora: https://docs.agora.io/

### Tools
- Prisma (PostgreSQL ORM): https://www.prisma.io/
- ioredis (Redis client): https://github.com/redis/ioredis
- amqplib (RabbitMQ): https://github.com/amqp-node/amqplib

## Kriteria Sukses

Proyek dianggap selesai ketika:
- [ ] User bisa register dan login
- [ ] Konsultan bisa mengatur ketersediaan
- [ ] Klien bisa booking appointment
- [ ] Pembayaran diproses via gateway (sandbox)
- [ ] Video call berfungsi antara dua user
- [ ] Notifikasi email terkirim via queue
- [ ] Dashboard analytics menampilkan data akurat
- [ ] Semua item checklist keamanan terimplementasi
- [ ] Load test dasar lulus (100 concurrent users)
- [ ] Kode terdokumentasi dan siap deploy

## Catatan

- Mulai dengan MVP: pembayaran manual sebelum integrasi gateway
- Gunakan mock video service awalnya (socket.io saja)
- Jangan over-engineer: prinsip YAGNI
- Fokus pada pembelajaran, bukan kesempurnaan
- Dokumentasikan tantangan dan solusi untuk portofolio

---

**ponytail:** Skip video recording, materialized views, dan separate analytics tables di awal. Query langsung ke tabel transaksional cukup sampai ada bottleneck nyata. Fokus pada alur inti dulu - analytics bisa dioptimasi nanti ketika sudah punya data volume signifikan.
