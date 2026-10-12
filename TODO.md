# TeleConsult - Development Roadmap

**Status:** In Progress  
**Timeline:** 6 Weeks  
**Started:** 2026-10-12

---

## 📍 FASE 1: Setup & Auth (Week 1) ✅ COMPLETE

- [x] Setup auth system - JWT middleware, bcrypt password hashing
- [x] Buat auth controllers (register, login, refresh, logout)
- [x] Buat auth routes dan validation middleware
- [x] Setup Redis session management
- [x] Frontend - Industrial Brutalist base layout (nav, typography, grid)
- [x] Frontend - Auth pages (login, register) dengan Brutalist UI

---

## 📍 FASE 2: Appointment CRUD (Week 2)

- [ ] Backend - Appointment CRUD endpoints
- [ ] Backend - Consultant availability/slot management
- [ ] Backend - RabbitMQ email queue setup + worker
- [ ] Frontend - Appointment booking flow UI

---

## 📍 FASE 3: Payment Integration (Week 3)

- [ ] Midtrans integration - initiate payment endpoint
- [ ] Midtrans webhook handler via RabbitMQ
- [ ] Frontend - Payment status page

---

## 📍 FASE 4: Video Real-time (Week 4)

- [ ] Agora SDK integration - room creation + token generation
- [ ] Frontend - Video call UI dengan Agora SDK
- [ ] Redis - Track call duration dan presence

---

## 📍 FASE 5: Analytics & Polish (Week 5)

- [ ] Dashboard analytics - query optimization dengan indeks
- [ ] Rate limiting dengan Redis
- [ ] Input validation & error handling polish

---

## 📍 FASE 6: Deploy & CI/CD (Week 6)

- [ ] Docker production setup & optimization
- [ ] CI/CD pipeline dengan GitHub Actions
- [ ] Deployment script & documentation

---

## 📝 Notes

- Checklist ini mengikuti PRD yang sudah dioptimasi
- Skip: video recording, materialized views, separate analytics tables
- Focus: core learning objectives dengan minimal complexity
- Update checklist saat progress
