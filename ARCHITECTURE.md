# Architecture v2 Documentation

## Overview

**Your Thoughts** is a multimodal task capture PWA with 4 user personas: Legal, School, Work, Custom.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/PWA)                     │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite + TailwindCSS                     │
│  ├── Capture Screen (text, voice, camera)                       │
│  ├── Task List (Today, Upcoming, Smart Folders)                 │
│  ├── Settings (tags, purpose, integrations)                     │
│  ├── Offline Storage (IndexedDB)                                │
│  └── Sync Queue (useSync + offlineStorage)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (API)                            │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express + TypeScript + Prisma ORM                    │
│  ├── Auth Service (JWT, bcrypt, accountPurpose)                 │
│  ├── Task Service (CRUD, recurrence series)                     │
│  ├── AI Service (Gemini: intent, breakdown, OCR)                │
│  ├── Tag Service (purpose-based defaults)                       │
│  ├── Calendar Service (Google Calendar one-way)                 │
│  └── Notification Service (Web Push)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│  Google Gemini API (text + image processing)                    │
│  Google Calendar API (OAuth2)                                   │
│  Web Push (VAPID keys)                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Architecture Decisions (v2)

### 1. Category vs Purpose Model
- **Task.category** = per-task classification (string, AI-detected)
- **User.accountPurpose** = user-level context (legal/school/work/custom)
- Purpose influences AI classification bias via `CATEGORY_PRESETS_BY_PURPOSE`
- See: `/backend/src/config/categoryPresets.ts`

### 2. Recurrence Series
- **recurrenceSeriesId** links all tasks in a recurring series
- Next instance generated **server-side only** when completing a task
- Duplicate prevention via date range check
- See: `/backend/src/controllers/taskController.ts`

### 3. Offline Queue (Client-Only)
- OfflineQueue is **NOT** a Prisma model
- Stored in IndexedDB via `offlineStorage.ts`
- Processed by `useSync.ts` when back online
- Server is stateless regarding offline mutations

### 4. Calendar Integration (One-Way Push)
- MVP supports one-way push only
- `POST /api/calendar/events` → Creates Google Calendar event
- `DELETE /api/calendar/events/:taskId` → Removes event
- Edits/deletions in Google Calendar are NOT mirrored back
- Two-way sync is a future enhancement

### 5. OCR Pipeline (Demo Mode)
- Uses Gemini image-to-text API (simulated OCR)
- No dedicated OCR service (AWS Textract/Google Vision) yet
- See: `/backend/src/controllers/documentController.ts`

### 6. Voice Recognition
- Uses Web Speech API (browser-native)
- Works best on Chrome (Android/Desktop)
- Safari iOS has limitations
- Server-side fallback is a future enhancement

### 7. Guest Mode
- Full feature access (same as registered users)
- JWT valid for 7 days
- Data may be pruned in future (lower guarantee)
- "Convert to full account" CTA planned

---

## Data Model Summary

| Model | Key Fields | Notes |
|-------|-----------|-------|
| User | id, email?, accountPurpose, isGuest | Purpose drives defaults |
| Task | id, userId, category, recurrenceSeriesId | Series links recurring |
| Tag | id, userId, name, color | User-defined labels |
| Subtask | id, taskId, label, done | AI-generated breakdown |
| CalendarConnection | userId, accessToken | Google OAuth tokens |

---

## Service Boundaries

| Service | Routes | Concern |
|---------|--------|---------|
| Auth | /api/auth/* | JWT, signup, guest |
| Task | /api/tasks/*, /api/intent | CRUD, recurrence |
| Tag | /api/tags/* | User tags |
| Calendar | /api/calendar/* | Google sync |
| Notification | /api/notifications/* | Push subscriptions |

---

## Frontend Hooks

| Hook | Purpose |
|------|---------|
| useApi | Central fetch wrapper with auth |
| useTasks | Task list with scopes |
| useSync | Offline queue processor |
| useAuth | User + accountPurpose |
| useFolders | Smart folder management |

---

## Future Enhancements

- [ ] Two-way calendar sync
- [ ] Server-side voice processing (Whisper-style)
- [ ] Real OCR service (AWS Textract)
- [ ] Guest → Full account conversion flow
- [ ] Multi-device conflict resolution
