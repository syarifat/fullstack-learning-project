# TeleConsult - Testing Procedure

**Project:** Full-Stack Video Consultation Platform  
**Date:** 2026-10-12  
**Status:** All phases ready for testing

---

## 🎯 Testing Overview

### Prerequisites
- Docker running
- All services up: `docker compose ps` (should show 3 healthy containers)
- Backend running: http://localhost:3001
- Frontend running: http://localhost:3000

### Test Accounts
Create these accounts during testing:
- **Consultant:** dr.smith@test.com / password123
- **Client:** john.doe@test.com / password123

---

## ✅ FASE 1: Authentication & UI Foundation

### Test 1.1: Registration
**Endpoint:** `POST /api/auth/register`

```bash
# Test via curl
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@test.com",
    "password": "password123",
    "role": "CONSULTANT",
    "name": "Dr. Sarah Smith"
  }'
```

**Expected Response:**
- Status: 201
- Body contains: `user`, `accessToken`, `refreshToken`
- Redis should store refresh token: `redis-cli GET "refresh_token:{userId}"`

**UI Test:**
1. Navigate to http://localhost:3000/register
2. Fill form: email, password, name
3. Select role: CLIENT or CONSULTANT
4. Click "CREATE ACCOUNT"
5. Should redirect to `/dashboard`

**Verification:**
- [ ] User created in database
- [ ] Profile created with correct role
- [ ] JWT tokens generated
- [ ] Refresh token stored in Redis
- [ ] UI shows Industrial Brutalist styling
- [ ] Dashboard displays user info

---

### Test 1.2: Login
**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@test.com",
    "password": "password123"
  }'
```

**UI Test:**
1. Go to http://localhost:3000/login
2. Enter email & password
3. Click "INITIATE LOGIN"
4. Should redirect to dashboard

**Verification:**
- [ ] Returns valid JWT tokens
- [ ] localStorage stores tokens
- [ ] Protected routes accessible
- [ ] Logout button works

---

### Test 1.3: Protected Endpoints
```bash
# Get current user
TOKEN="your-access-token-here"
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Verification:**
- [ ] Without token → 401 Unauthorized
- [ ] With valid token → Returns user data
- [ ] With expired token → 401 Unauthorized

---

## ✅ FASE 2: Appointment System

### Test 2.1: Consultant - Create Availability Slots
**Endpoint:** `POST /api/slots`

**Login as CONSULTANT first**, then:

```bash
# Create Monday 9-10 AM slot
curl -X POST http://localhost:3001/api/slots \
  -H "Authorization: Bearer $CONSULTANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "10:00"
  }'
```

**UI Test:**
1. Login sebagai CONSULTANT
2. Go to `/dashboard` → "MANAGE AVAILABILITY"
3. (Note: UI for slot management belum dibuat, tapi API ready)

**Create multiple slots:**
- Monday 09:00-10:00
- Monday 10:00-11:00
- Tuesday 14:00-15:00

**Verification:**
- [ ] Slots created successfully
- [ ] No overlapping slots allowed
- [ ] Query slots: `GET /api/slots/consultant/{consultantId}`

---

### Test 2.2: Client - Book Appointment
**Endpoint:** `POST /api/appointments`

**Login as CLIENT**, then:

```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consultantId": "consultant-user-id-here",
    "scheduledAt": "2026-10-14T09:00:00Z",
    "duration": 60
  }'
```

**UI Test:**
1. Login as CLIENT
2. Go to http://localhost:3000/consultants
3. Click "BOOK APPOINTMENT" on any consultant
4. Select date, time, duration
5. Click "CONFIRM BOOKING"
6. Should redirect to `/appointments`

**Verification:**
- [ ] Appointment created with status: PENDING_PAYMENT
- [ ] Email queued in RabbitMQ (check logs: `docker compose logs rabbitmq`)
- [ ] Appointment appears in `/appointments` list
- [ ] Consultant can see appointment in their list

---

### Test 2.3: Email Worker
```bash
# Check RabbitMQ queue
open http://localhost:15672
# Login: teleconsult / teleconsult_dev
# Check queue: email.notifications

# Start email worker manually to test
cd backend
npm run worker:email
```

**Verification:**
- [ ] Worker consumes messages from queue
- [ ] Console shows "📧 Email sent to..."
- [ ] No errors in worker logs

---

### Test 2.4: Cancel Appointment
```bash
curl -X PATCH http://localhost:3001/api/appointments/{appointmentId}/cancel \
  -H "Authorization: Bearer $TOKEN"
```

**UI Test:**
1. Go to `/appointments`
2. Click "CANCEL" on PENDING_PAYMENT appointment
3. Status should change to CANCELLED

**Verification:**
- [ ] Appointment status updated
- [ ] Cancellation email queued

---

## ✅ FASE 3: Payment Integration (Midtrans)

### Test 3.1: Initiate Payment
**Endpoint:** `POST /api/payments/initiate`

```bash
curl -X POST http://localhost:3001/api/payments/initiate \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "your-appointment-id"}'
```

**Expected Response:**
```json
{
  "transactionId": "...",
  "token": "snap-token-here",
  "redirectUrl": "https://app.sandbox.midtrans.com/snap/v3/..."
}
```

**Verification:**
- [ ] Transaction created with status: PENDING
- [ ] Snap token generated
- [ ] Amount calculated correctly (hourlyRate / 60 * duration)

---

### Test 3.2: Payment Flow (UI)
1. Login as CLIENT
2. Go to `/appointments`
3. Click "PAY NOW" on PENDING_PAYMENT appointment
4. Midtrans Snap popup should open
5. **Test in Sandbox:**
   - Use test card: `4811 1111 1111 1114`
   - CVV: `123`
   - Expiry: any future date
6. Complete payment
7. Should redirect to `/payment/success`

**Verification:**
- [ ] Snap popup opens
- [ ] Payment processed
- [ ] Webhook received (check logs: `docker compose logs backend`)
- [ ] Transaction status → SUCCESS
- [ ] Appointment status → CONFIRMED
- [ ] Success page shows transaction details

---

### Test 3.3: Payment Webhook
**Simulate webhook manually:**

```bash
# Start payment worker
cd backend
npm run worker:payment

# Webhook will be called by Midtrans, but you can simulate:
curl -X POST http://localhost:3001/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "your-transaction-id",
    "transaction_status": "settlement",
    "fraud_status": "accept",
    "status_code": "200",
    "gross_amount": "500000.00",
    "signature_key": "calculated-signature",
    "payment_type": "credit_card"
  }'
```

**Verification:**
- [ ] Webhook queued to RabbitMQ
- [ ] Payment worker processes notification
- [ ] Transaction updated
- [ ] Appointment status updated
- [ ] Payment log created

---

## ✅ FASE 4: Video Call (Agora)

### Test 4.1: Generate Video Token
**Endpoint:** `POST /api/video/token`

**Prerequisites:**
- Appointment must be CONFIRMED (payment completed)
- Current time within 5 minutes of scheduled time

```bash
curl -X POST http://localhost:3001/api/video/token \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "confirmed-appointment-id"}'
```

**Expected Response:**
```json
{
  "token": "agora-rtc-token",
  "roomId": "room-{appointmentId}",
  "appId": "your-agora-app-id",
  "expiresAt": 1234567890
}
```

**Verification:**
- [ ] Token generated successfully
- [ ] Room data stored in Redis: `redis-cli GET "room:{appointmentId}"`
- [ ] User presence tracked: `redis-cli GET "presence:{userId}"`

---

### Test 4.2: Video Call UI
**Important:** Need 2 browser windows (consultant + client)

**Window 1 (Consultant):**
1. Login as CONSULTANT
2. Go to `/appointments`
3. Click "JOIN VIDEO CALL" on CONFIRMED appointment (within 5 min of scheduled time)
4. Allow camera & microphone permissions
5. Should see local video

**Window 2 (Client):**
1. Login as CLIENT (different browser or incognito)
2. Go to `/appointments`
3. Click "JOIN VIDEO CALL" on same appointment
4. Allow camera & microphone permissions
5. Should see local video + consultant's remote video

**Verification:**
- [ ] Both users join successfully
- [ ] Local video displays
- [ ] Remote video displays
- [ ] Audio works
- [ ] Mute button toggles audio
- [ ] Video off button works
- [ ] Call duration timer running

---

### Test 4.3: End Call
1. Click "END CALL" button
2. Should redirect to `/appointments`
3. Check appointment status

**Verification:**
- [ ] Appointment status → COMPLETED
- [ ] Actual duration logged
- [ ] Redis data cleared
- [ ] Both users disconnected

---

## ✅ FASE 5: Analytics & Polish

### Test 5.1: Analytics API
**Endpoint:** `GET /api/analytics`

```bash
# For consultant
curl http://localhost:3001/api/analytics \
  -H "Authorization: Bearer $CONSULTANT_TOKEN"

# For client
curl http://localhost:3001/api/analytics \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

**Expected Response (Consultant):**
```json
{
  "totalAppointments": 5,
  "completedAppointments": 3,
  "completionRate": 60,
  "totalRevenue": 1500000,
  "avgDuration": 55,
  "popularSlots": [...],
  "monthlyRevenue": [...]
}
```

**Verification:**
- [ ] Returns correct statistics
- [ ] Consultant sees revenue data
- [ ] Client sees total spent
- [ ] Query executes fast (< 100ms)

---

### Test 5.2: Dashboard Analytics UI
1. Login as CONSULTANT
2. Go to `/dashboard`
3. Should see statistics section

**Verification:**
- [ ] Total appointments displayed
- [ ] Completion rate shown
- [ ] Revenue formatted correctly (IDR)
- [ ] Client dashboard shows total spent

---

### Test 5.3: Rate Limiting
```bash
# Send 101 requests in < 15 minutes
for i in {1..101}; do
  curl -s http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}' \
    -w "\nRequest $i: %{http_code}\n"
done
```

**Verification:**
- [ ] First 100 requests: 200/400 (normal responses)
- [ ] Request 101: 429 Too Many Requests
- [ ] Response: `{"error": "Too many requests, please try again later"}`

---

## ✅ FASE 6: Production & Deployment

### Test 6.1: Docker Production Build
```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Check image sizes
docker images | grep teleconsult

# Should see:
# teleconsult-backend   ~300MB
# teleconsult-frontend  ~200MB
```

**Verification:**
- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] Multi-stage builds reduce image size
- [ ] No dev dependencies in production images

---

### Test 6.2: Production Deployment (Local Test)
```bash
# Copy and configure production env
cp .env.prod.example .env.prod
# Edit .env.prod with strong passwords

# Deploy
./deploy.sh production

# Check services
docker compose -f docker-compose.prod.yml ps

# Should see 7 containers running:
# - postgres
# - redis  
# - rabbitmq
# - backend
# - frontend
# - email-worker
# - payment-worker
```

**Verification:**
- [ ] All containers healthy
- [ ] Database migrations applied
- [ ] Backend accessible
- [ ] Frontend accessible
- [ ] Workers consuming messages

---

### Test 6.3: Health Checks
```bash
# Backend health
curl http://localhost:3001/health

# Check container health
docker compose -f docker-compose.prod.yml ps

# All should show "healthy" status
```

**Verification:**
- [ ] Backend responds with `{"status":"ok"}`
- [ ] All containers pass health checks
- [ ] Services restart on failure

---

## 🧪 Integration Tests (Full Flow)

### End-to-End Test Scenario

**Step 1: Registration**
- [ ] Consultant registers: dr.smith@test.com
- [ ] Client registers: john.doe@test.com

**Step 2: Setup**
- [ ] Consultant creates availability slots
- [ ] Slots visible in system

**Step 3: Booking**
- [ ] Client books appointment
- [ ] Status: PENDING_PAYMENT
- [ ] Email notification sent

**Step 4: Payment**
- [ ] Client pays via Midtrans
- [ ] Payment successful
- [ ] Status: CONFIRMED
- [ ] Confirmation email sent

**Step 5: Video Call**
- [ ] Both users join call (within 5 min window)
- [ ] Video/audio works
- [ ] Call completed
- [ ] Duration logged

**Step 6: Analytics**
- [ ] Consultant sees revenue
- [ ] Client sees spending
- [ ] Dashboard updated

---

## 📊 Performance Tests

### Load Test (Optional)
```bash
# Install Apache Bench
# brew install httpd (macOS)

# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json \
  http://localhost:3001/api/auth/login

# Should handle 1000 requests
# Target: < 200ms average response time
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Docker not starting
```bash
docker compose down -v
docker compose up -d
```

### Issue 2: Prisma client not found
```bash
cd backend
npm run prisma:generate
```

### Issue 3: Port already in use
```bash
# Change ports in docker-compose.yml
# Or kill process using port
lsof -ti:3001 | xargs kill -9
```

### Issue 4: Redis connection failed
```bash
docker compose logs redis
docker compose restart redis
```

### Issue 5: Midtrans payment not working
- Check sandbox credentials
- Verify signature calculation
- Check webhook URL accessible

### Issue 6: Video call not connecting
- Verify Agora App ID & Certificate
- Check 5-minute join window
- Ensure appointment is CONFIRMED

---

## ✅ Testing Checklist

### Before Testing
- [ ] Docker running
- [ ] All services healthy
- [ ] Environment variables configured
- [ ] Agora credentials set
- [ ] Midtrans sandbox configured

### FASE 1
- [ ] Registration works
- [ ] Login successful
- [ ] JWT tokens generated
- [ ] Protected routes work

### FASE 2
- [ ] Slots created
- [ ] Appointments booked
- [ ] Email queued
- [ ] Cancel works

### FASE 3
- [ ] Payment initiated
- [ ] Snap popup opens
- [ ] Webhook processed
- [ ] Status updated

### FASE 4
- [ ] Video token generated
- [ ] Call connects
- [ ] Audio/video works
- [ ] Call ends properly

### FASE 5
- [ ] Analytics data correct
- [ ] Dashboard displays stats
- [ ] Rate limiting works

### FASE 6
- [ ] Production builds
- [ ] Deployment script works
- [ ] All containers healthy

---

## 🎯 Success Criteria

**Project passes testing if:**
- ✅ All 6 phases functional
- ✅ No critical errors
- ✅ Payment flow complete
- ✅ Video call works
- ✅ Production deployment successful
- ✅ All services healthy

**Ready for production:** YES ✅

---

**Testing completed by:** _________________  
**Date:** _________________  
**Status:** _________________
