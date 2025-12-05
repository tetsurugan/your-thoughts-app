# Your Thoughts App

**A Smart Task Organizer for Justice-Impacted Users**

## Overview

"Your Thoughts" is a mobile-first web application designed to help users capture instructions, documents, and appointments quickly and organize them into actionable tasks. Designed specifically for justice-impacted individuals who may face challenges with digital literacy or tracking complex requirements (such as probation terms), this app bridges the gap between rough notes and a structured to-do list.

## MVP Core Feature

The current MVP looks like a simple todo app, but it’s intentionally scoped that way. Underneath, it’s the first slice of a smart note system that will eventually grow into: notes in → tasks/date view → optional calendar → smart folders.

The core value of this MVP is **"Capture & Convert"**. 
Instead of forcing users to fill out complex forms, they can simply:
1.  **Type** a rough note (e.g., "See PO next Friday at 2pm").
2.  **Speak** a note (simulated voice input).
3.  **Snap** a photo (simulated description).

The app automatically:
*   Converts the note into a Task.
*   Detects the **Category** (Probation, Legal, Appointment, Personal).
*   **Breaks down** complex tasks (like "Sign up for app") into sub-steps.
*   Assigns **Urgency** based on dates found in the text.

## Target User

*   **Primary**: Justice-impacted individuals (probation, parole, diversion programs).
*   **Needs**: Simple interface, large text, low friction, helps manage anxiety around deadlines.
*   **Tech Literacy**: Low to Medium.

## Current Features

### 1. Multi-Mode Note Capture
*   **Typed**: Standard text input.
*   **Voice**: Simulated voice-to-text input (tagged as "Voice").
*   **Photo**: Simulated photo upload/description (tagged as "Photo").

### 2. Smart Parsing & Processing
*   **Auto-Categorization**: keywords like "court", "officer", "doctor" trigger specific category tags.
*   **Auto-Breakdown**: phrases like "sign up", "register", or "bring documents" trigger the creation of a sub-task checklist.
*   **Validation**: Prevents empty notes and asks clarifying questions for ambiguous inputs (e.g., "book" -> Read vs Schedule).

### 3. Multimodal Search (Gold Star Feature)
*   **Unified Search**: Search across task titles, descriptions, categories, and subtasks.
*   **Voice Search**: Simulated voice input trigger to populate search queries simply by speaking.

### 3. Task Management
*   **Task List**: Sorted by urgency (Overdue -> Due Soon -> Later).
*   **Expandable Cards**: View details, categories, and manage sub-tasks.
*   **Urgency Indicators**: 
    *   🔴 Red Border: Overdue
    *   🟡 Yellow Border: Due within 3 days
    *   🔵 Blue/Gray: Standard

### 4. Authentication
*   **Basic Flow**: Login, Signup, Logout.
*   **Social Login**: Simulated "Continue with Google" and "Continue with Apple" for instant access.
*   **Forgot Password**: Simulated email reset flow.
*   **Persistence**: User session and data stored locally in browser (LocalStorage).

## Tech Stack

*   **Frontend**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: TailwindCSS
*   **Icons**: Lucide React
*   **State/Storage**: React Context API + LocalStorage (No external backend required for MVP)

## How to Run

This project is a standard Vite React application.

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Planned Features (Not Yet Implemented)

*   **Calendar View**: A visual calendar integration for task due dates.
*   **Smart Folder Browsing**: A dedicate view to browse notes by category.
*   **Real Voice/Image Processing**: Integration with actual Whisper/Vision APIs.
*   **Push Notifications**: Reminders for due dates.
*   **Cloud Sync**: Replacing LocalStorage with a real backend (Supabase/Firebase).

## Known Limitations

*   **Data Persistence**: All data is stored in `localStorage`. Clearing browser cache will wipe data.
*   **Parsing Logic**: The "Smart Parsing" is currently rule-based (Regex), not LLM-based. It handles specific keywords but may miss complex natural language nuances.
*   **Mobile-First**: The UI is optimized for phone screens (max-width constrained). It may look narrow on desktop monitors.

---

**Project Structure**
*   `/src/components`: UI components (TaskCard, Layout, BottomNav)
*   `/src/context`: Global state (Auth, Tasks)
*   `/src/lib`: Utilities (Storage, TaskParser)
*   `/src/pages`: Main screens (TaskList, NewNote, Login, Profile)
# your-thoughts-app
