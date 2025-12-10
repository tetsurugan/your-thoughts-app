# Phase 2 Backlog

**Product:** Your Thoughts  
**Focus:** Legal Mode as hero vertical  
**Status:** MVP Complete ✅

---

## Epic 1: Demo-Day Polish (Legal Mode) 🎯

**Priority:** P0 (Before demo)  
**Goal:** Make the Legal Mode demo bulletproof and emotionally resonant.

### User Stories

#### 1.1 Clear Legal Purpose Explanation
**As a** Legal user signing up  
**I want** to see "Legal / Probation" clearly explained  
**So that** I know I'm in the right place

**Acceptance Criteria:**
- [ ] Signup purpose button has subtext: "Track PO meetings, court dates, and deadlines"
- [ ] Icon matches legal context (gavel/scale)

**Files:** `frontend/src/routes/SignupScreen.tsx`

---

#### 1.2 Supportive First-Task Tooltip
**As a** Legal user creating my first PO-related task  
**I want** a supportive tooltip message  
**So that** I feel encouraged, not overwhelmed

**Acceptance Criteria:**
- [ ] First task with "legal" category triggers tooltip
- [ ] Message: "You're doing the right thing by tracking this — I'll help you remember."
- [ ] Tooltip appears once, never again

**Files:** `frontend/src/routes/CaptureScreen.tsx`, `frontend/src/hooks/useFirstTaskTooltip.ts`

---

#### 1.3 Demo Mode with Pre-Seeded Data
**As a** demo presenter  
**I want** a "Demo Mode" that pre-seeds sample tasks  
**So that** I can show the app without manual setup

**Acceptance Criteria:**
- [ ] Secret gesture or URL param (`?demo=legal`) activates demo mode
- [ ] Seeds: 1 PO meeting, 1 court date, 1 completed task with recurrence
- [ ] Clearly labeled "DEMO DATA" badge

**Files:** `frontend/src/utils/demoMode.ts`, `backend/src/controllers/authController.ts`

---

## Epic 2: Guest → Account Conversion 🔄

**Priority:** P1  
**Goal:** Retain guest users by offering seamless upgrade path.

### User Stories

#### 2.1 Gentle Upgrade Prompt
**As a** guest user after creating 10 tasks  
**I want** a gentle prompt to create an account  
**So that** I can save my data if I lose my phone

**Acceptance Criteria:**
- [ ] Prompt appears after 10th task creation
- [ ] Message: "Want to save this? Create a free account."
- [ ] Dismiss option (don't show again for 24h)

**Files:** `frontend/src/hooks/useTasks.ts`, `frontend/src/components/UpgradePrompt.tsx`

---

#### 2.2 Seamless Data Migration
**As a** guest user converting to full account  
**I want** my tasks, tags, and settings to migrate  
**So that** I don't lose anything

**Acceptance Criteria:**
- [ ] All tasks remain associated with new user ID
- [ ] Tags and folder assignments preserved
- [ ] Old guest JWT invalidated, new JWT issued

**Files:** `backend/src/controllers/authController.ts`, `frontend/src/context/AuthContext.tsx`

---

#### 2.3 Expired Guest Session Handling
**As a** returning user with expired guest token  
**I want** a clear message explaining what happened  
**So that** I understand and can start fresh

**Acceptance Criteria:**
- [ ] Expired token shows: "Guest session ended. Create an account to keep things saved."
- [ ] Option to start new guest session

**Files:** `frontend/src/context/AuthContext.tsx`

---

## Epic 3: Real OCR Provider 📸

**Priority:** P2  
**Goal:** Replace Gemini OCR demo with production-grade OCR.

### User Stories

#### 3.1 Accurate Document Extraction
**As a** user photographing a court letter  
**I want** accurate text extraction with line breaks  
**So that** key dates and details are captured correctly

**Acceptance Criteria:**
- [ ] AWS Textract or Google Vision integration
- [ ] Preserve document structure (paragraphs, dates)
- [ ] 95%+ accuracy on typed documents

**Files:** `backend/src/services/ocrService.ts`

---

#### 3.2 OCR Failure Graceful Handling
**As a** user when OCR fails  
**I want** a helpful fallback message  
**So that** I can retry or enter manually

**Acceptance Criteria:**
- [ ] Message: "This was hard to read. Try another photo or enter details manually."
- [ ] Manual entry form with title/due date fields

**Files:** `frontend/src/routes/CaptureScreen.tsx`

---

#### 3.3 OCR Provider Toggle
**As a** developer  
**I want** to toggle between Gemini (demo) and Textract (prod)  
**So that** I can test without breaking demo

**Acceptance Criteria:**
- [ ] ENV variable: `OCR_PROVIDER=gemini|textract|vision`
- [ ] Factory pattern in ocrService.ts

**Files:** `backend/src/services/ocrService.ts`, `.env.example`

---

## Epic 4: Server-Side Voice Fallback 🎤

**Priority:** P2  
**Goal:** Make voice input work on all browsers.

### User Stories

#### 4.1 Record-and-Send for Unsupported Browsers
**As a** user on Safari or Firefox  
**I want** to hold-to-record audio sent to server  
**So that** voice input still works for me

**Acceptance Criteria:**
- [ ] Detect Web Speech API availability
- [ ] Fallback: record audio blob → POST /api/voice/intent
- [ ] Server transcribes via Gemini audio API

**Files:** `frontend/src/components/VoiceRecorder.tsx`, `backend/src/controllers/voiceController.ts`

---

#### 4.2 Single Voice Endpoint
**As a** developer  
**I want** one POST /api/voice/intent endpoint  
**So that** all voice processing is centralized

**Acceptance Criteria:**
- [ ] Accepts audio blob (webm/wav)
- [ ] Returns transcribed text + parsed intent
- [ ] Uses intentController.processIntent internally

**Files:** `backend/src/controllers/voiceController.ts`, `backend/src/routes/api.ts`

---

## Epic 5: Tag Filters & Smart Folders 🏷️

**Priority:** P3  
**Goal:** Help power users organize and filter tasks.

### User Stories

#### 5.1 Filter by Tag
**As a** user  
**I want** to tap a tag to filter my task list  
**So that** I only see related tasks

**Acceptance Criteria:**
- [ ] Tag chips appear above task list
- [ ] Tapping tag filters to matching tasks
- [ ] Clear filter button

**Files:** `frontend/src/routes/TaskListScreen.tsx`

---

#### 5.2 Save Filtered View as Smart Folder
**As a** user  
**I want** to save a filter as a Smart Folder  
**So that** I can access it quickly later

**Acceptance Criteria:**
- [ ] "Save as folder" button when filter active
- [ ] Folder appears in FolderTabs
- [ ] Dynamic: re-evaluates on each view

**Files:** `frontend/src/hooks/useFolders.ts`, `backend/src/controllers/folderController.ts`

---

## Risks & Notes

| Epic | Risk | Mitigation |
|------|------|------------|
| Guest Conversion | Duplicate user records | Use transaction, validate email unique |
| Real OCR | Cost per call | Cache results, rate limit |
| Server Voice | Audio size limits | Max 30 sec, compress |
| Tag Filters | Performance with many tasks | Client-side filter first |

---

## Next: Behavioral (Mary)

After backlog creation, run **Mary (Behavioral)** to refine:
- Legal Mode copy and tone
- Supportive micro-interactions
- Error message compassion
