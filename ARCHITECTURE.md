# Architecture Documentation - Your Thoughts App

This document outlines the technical architecture, component structure, and data flow of the "Your Thoughts" application.

## High-Level Architecture

The app is a **Client-Side Single Page Application (SPA)** built with React and Vite. 
It follows a **Context-based state management** pattern where data is held in React Context Providers and persisted synchronously to the browser's `localStorage`.

There is **no external database** for this MVP. All data resides in the user's browser.

## Component Structure

### Core Components (`src/components/`)
*   **Layout.tsx**: The main shell. Wraps pages with a consistent container and the `BottomNav`. Enforces the mobile-first (max-width) layout.
*   **BottomNav.tsx**: The primary navigation bar (Tasks | New Note | Profile).
*   **TaskCard.tsx**: The complex display unit for a task. Handles:
    *   Displaying title/desc/date.
    *   Badges (Category, Source).
    *   Urgency styling (Red/Yellow borders).
    *   Expansion logic for Subtasks.
*   **ProtectedRoute.tsx**: High-order component that checks `AuthContext`. Redirects unauthenticated users to `/login`.

### Pages (`src/pages/`)
*   **TaskList.tsx**: The main dashboard.
    *   **Logic**: Fetches tasks from `TaskContext`.
    *   **Sorting**: Sorts by Urgency (Overdue > Due Soon > Date > Creation).
    *   **Filtering**: Toggles between Active and Completed.
*   **NewNote.tsx**: The capture screen.
    *   **Logic**: Handles form input, validation, and simulated ambiguity checks ("Did you mean...?").
    *   **Integration**: Calls `parseTask` from `src/lib/taskParser.ts` before saving.
*   **Profile.tsx**: Simple user info display and Logout trigger.
*   **Login.tsx / Signup.tsx / ForgotPassword.tsx**: Authentication forms.

## Data Flow: Note to Task

The core unique logic of the app is how a "Note" becomes a "Task".

1.  **Input**: User enters text in `NewNote.tsx` (typed or simulated voice/photo).
2.  **Validation**: 
    *   Checks for empty input.
    *   Checks for ambiguity trigger words (e.g., "book" prompts a dialog).
3.  **Parsing (`src/lib/taskParser.ts`)**:
    *   The raw text is passed to `parseTask(text)`.
    *   **Category**: Regex checks for keywords (court -> Legal, doctor -> Appointment).
    *   **Subtasks**: Regex checks for process words (sign up -> [create account, verify, ...]).
4.  **Creation**:
    *   A new `Task` object is created with the generated metadata.
    *   `addTask` in `TaskContext` saves it to state and `localStorage`.

## State Management (`src/context/`)

### AuthContext
*   **State**: `user` object (id, name, email).
*   **Persistence**: Key `clarity_user` in `localStorage`.
*   **Methods**: `login`, `signup`, `logout`, `forgotPassword`.

### TaskContext
*   **State**: Array of `Task` objects.
*   **Persistence**: Key `clarity_tasks` in `localStorage` (mapped by userId).
*   **Methods**: `addTask`, `updateTask`, `deleteTask`, `toggleTaskCompletion`, `toggleSubtaskCompletion`.

## Future Extension Points

### 1. Smart Folder Browsing
*   **Current State**: Tasks have a `category` field ('Legal', 'Probation', etc.) but are only shown in a single list.
*   **Extension**: Create a new page `FolderView.tsx` that groups tasks by `task.category`.

### 2. Calendar View
*   **Current State**: Tasks have a `dueDate` string (YYYY-MM-DD).
*   **Extension**: Add a library like `react-calendar`. Map dates to task lists.

### 3. Real Backend
*   **Current State**: `src/lib/storage.ts` wraps `localStorage`.
*   **Extension**: specific implementations of `auth` and `storage` can be swapped out for Supabase/Firebase clients without changing the UI components significantly.

## Directory Map

```
src/
├── components/       # Reusable UI parts
├── context/          # React Context (State)
├── lib/              # Logic helpers (Storage, Parser)
├── pages/            # Route views
└── App.tsx           # Router configuration
```
