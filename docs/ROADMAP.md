# Project Roadmap

**Status:** MVP Complete ✅  
**Last Updated:** December 9, 2024

---

## 🎉 MVP Complete (Phases 1-10)

All core features implemented and deployed-ready.

### Phase 1: Core Reliability + Smart Folders ✅
- [x] Fix tasks without due dates not showing
- [x] Behavioral/trauma-informed copy
- [x] AI Smart Folders (Database, Classification, API, UI)
- [x] Text-to-Speech (Read aloud)
- [x] Better time parsing
- [x] Loading states

### Phase 2: Push Notifications ✅
- [x] Service Worker setup for PWA
- [x] Push notification permission flow
- [x] Reminder scheduling system
- [x] Backend notification service
- [x] "Remind me" button on task cards

### Phase 3: Real Voice Recognition ✅
- [x] Web Speech API integration
- [x] Voice activity detection (start/stop)
- [x] Fallback for unsupported browsers
- [x] Voice feedback UI (waveform/pulse)

### Phase 4: AI Task Breakdown ✅
- [x] Gemini LLM integration
- [x] "Break this down" button
- [x] Subtask UI with checkboxes
- [x] Domain-specific templates

### Phase 5: Authentication ✅
- [x] Email/Password Signup & Login (JWT/Bcrypt)
- [x] Secure Session Persistence
- [x] Guest Mode (full access, no signup)
- [x] Account Purpose Selection (legal/school/work/custom)

### Phase 6: User Profiles ✅
- [x] Edit Name & Email
- [x] Change Password
- [x] Delete Account (Danger Zone)
- [x] Avatar/Initials UI

### Phase 7: Offline Mode ✅
- [x] IndexedDB setup
- [x] Task Caching (Read Offline)
- [x] Mutation Queue (Write Offline)
- [x] Background Sync (Replay)

### Phase 8: Mobile Polish & Quality of Life ✅
- [x] Dark mode with toggle
- [x] Swipe gestures (complete/delete)
- [x] Task search
- [x] Recurring tasks (daily/weekly/monthly/yearly)
- [x] Server-side recurrence with series tracking

### Phase 9: Integrations ✅
- [x] Google Calendar sync (one-way push)
- [x] Export tasks to PDF
- [x] Custom tags with purpose-based defaults
- [x] Photo OCR via Gemini (demo mode)

### Phase 10: Polish & Demo ✅
- [x] README and documentation
- [x] ARCHITECTURE.md
- [x] API reference (docs/API.md)
- [x] Deployment guide (docs/DEPLOYMENT.md)
- [x] DevOps configs (Docker, Render, Vercel, CI/CD)
- [x] Codebase refactoring (frontend/backend split)
- [x] Legal Mode behavioral copy
- [x] Toast component with supportive messaging

---

## 🚀 Phase 2 Features (Future)

Priority order for post-MVP development.

### Epic 1: Demo-Day Polish (P0)
- [ ] Demo mode with pre-seeded data (`?demo=legal`)
- [ ] Supportive first-task tooltip
- [ ] "DEMO DATA" badge

### Epic 2: Guest → Account Conversion (P1)
- [ ] Upgrade prompt after 10 tasks
- [ ] Seamless data migration
- [ ] Expired session handling

### Epic 3: Real OCR Provider (P2)
- [ ] AWS Textract or Google Vision
- [ ] OCR provider toggle via ENV
- [ ] Graceful failure handling

### Epic 4: Server-Side Voice (P2)
- [ ] Audio blob upload endpoint
- [ ] Gemini audio transcription
- [ ] Browser-agnostic voice input

### Epic 5: Tag Filters & Smart Folders (P3)
- [ ] Filter by tag in task list
- [ ] Save filtered view as folder
- [ ] Dynamic folder re-evaluation

---

## 📅 Phase 3 Features (Future)

- [ ] Two-way Google Calendar sync
- [ ] Apple Calendar support
- [ ] Multi-device sync with conflict resolution
- [ ] Case manager view (shared tasks)
- [ ] Court/agency quick links
- [ ] Native mobile app (React Native)

---

## 📊 Summary

| Category | Status | Count |
|----------|--------|-------|
| MVP Features | ✅ Complete | 40+ |
| Phase 2 Epics | 📋 Planned | 5 |
| Phase 3 Ideas | 💡 Future | 6 |

---

## 🎯 Demo Day Ready

**Hero Vertical:** Legal Mode  
**Demo Flow:**
1. Signup → Select "Legal Obligations"
2. Voice: "PO meeting Tuesday at 2pm"
3. Photo: Court document → OCR extracts task
4. Complete recurring task → Next auto-created
5. Export PDF → Push to Google Calendar
