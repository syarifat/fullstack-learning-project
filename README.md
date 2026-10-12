# TeleConsult - Platform Konsultasi Video

Full-stack learning project: video consultation platform dengan payment gateway integration, real-time video call, dan async job processing.

## Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (Prisma ORM)
- Redis (sessions + cache)
- RabbitMQ (async jobs)

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Industrial Brutalist UI
- Agora SDK (video call)

**Services:**
- Midtrans (payment gateway)
- Agora (video/voice)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- npm

### 1. Clone & Setup

```bash
cd fullstack-learning-project

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, RabbitMQ
docker compose up -d

# Check services running
docker compose ps
```

**Services:**
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ: `localhost:5672`
- RabbitMQ Management UI: `http://localhost:15672` (user: `teleconsult`, pass: `teleconsult_dev`)

### 3. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env - update credentials jika perlu

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env - update API URL jika perlu
```

### 4. Database Migration

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 5. Run Development

```bash
# Terminal 1: Backend
cd backend
npm run dev
# → http://localhost:3001

# Terminal 2: Frontend
cd frontend
npm run dev
# → http://localhost:3000
```

## Project Structure

```
fullstack-learning-project/
├── backend/
│   ├── src/
│   │   ├── config/        # Database, Redis, RabbitMQ
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth, validation, rate limiting
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helpers
│   │   └── index.ts       # Express app
│   ├── schema.prisma      # Database schema
│   └── package.json
│
├── frontend/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utils, API client
│   └── package.json
│
├── docker-compose.yml     # Infrastructure services
├── PRD.md                 # Product Requirements Document
└── README.md
```

## Development Workflow

### Database Changes

```bash
cd backend

# Create migration
npx prisma migrate dev --name description_of_changes

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio (DB GUI)
npm run prisma:studio
```

### RabbitMQ Management

Access management UI: `http://localhost:15672`
- Username: `teleconsult`
- Password: `teleconsult_dev`

Monitor queues:
- `email.notifications`
- `payment.webhooks`

### Redis CLI

```bash
docker exec -it teleconsult-redis redis-cli

# Common commands
> PING
> KEYS *
> GET key_name
> FLUSHALL  # Clear all data (dev only)
```

## API Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```

### Auth (coming soon)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Appointments (coming soon)
- `GET /api/appointments`
- `POST /api/appointments`
- `GET /api/appointments/:id`
- `PATCH /api/appointments/:id/cancel`

### Payments (coming soon)
- `POST /api/payments/initiate`
- `POST /api/payments/webhook`
- `GET /api/payments/:id/status`

### Video (coming soon)
- `POST /api/video/token`
- `GET /api/video/room/:id`
- `POST /api/video/end`

## External Services Setup

### Midtrans (Payment Gateway)

1. Register: https://dashboard.midtrans.com/register
2. Get credentials (Sandbox mode):
   - Server Key
   - Client Key
3. Update `backend/.env` dan `frontend/.env`

Docs: https://docs.midtrans.com/

### Agora (Video SDK)

1. Register: https://console.agora.io/
2. Create project
3. Get App ID dan App Certificate
4. Update `backend/.env` dan `frontend/.env`

Docs: https://docs.agora.io/

## Troubleshooting

### Docker services tidak start

```bash
# Check logs
docker compose logs postgres
docker compose logs redis
docker compose logs rabbitmq

# Restart services
docker compose restart

# Full reset
docker compose down -v
docker compose up -d
```

### Prisma migration error

```bash
# Reset database (DEV ONLY - akan hapus semua data)
cd backend
npx prisma migrate reset

# Generate client ulang
npx prisma generate
```

### Port sudah digunakan

Ubah port di:
- `backend/.env` → `PORT=3002`
- `frontend/package.json` → script `"dev": "next dev -p 3001"`
- `docker-compose.yml` → ports mapping

## Learning Path

Ikuti fase pengembangan di `PRD.md`:

1. **Week 1**: Setup + Auth
2. **Week 2**: Appointments CRUD
3. **Week 3**: Payment Integration
4. **Week 4**: Video Call
5. **Week 5**: Analytics + Polish
6. **Week 6**: Deploy + CI/CD

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [Midtrans Docs](https://docs.midtrans.com/)
- [Agora Docs](https://docs.agora.io/)

## License

MIT - Learning project
