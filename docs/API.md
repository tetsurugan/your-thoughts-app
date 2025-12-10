# API Reference

## Base URL

- **Local**: `http://localhost:3001/api`
- **Production**: `https://your-api.onrender.com/api`

---

## Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Login |
| POST | `/auth/guest` | ❌ | Guest login |
| GET | `/auth/me` | ✅ | Get current user |
| PATCH | `/auth/profile` | ✅ | Update profile |
| PATCH | `/auth/password` | ✅ | Change password |
| DELETE | `/auth/account` | ✅ | Delete account |

#### POST /auth/signup

```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "accountPurpose": "legal"  // legal, school, work, custom
}

// Response
{
  "token": "eyJhbG...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "accountPurpose": "legal"
  }
}
```

#### POST /auth/guest

```json
// Request (empty body)
{}

// Response
{
  "token": "eyJhbG...",
  "user": {
    "id": "uuid",
    "name": "Guest",
    "isGuest": true
  }
}
```

---

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | ✅ | List all tasks |
| PATCH | `/tasks/:id` | ✅ | Update task |
| POST | `/tasks/:id/breakdown` | ✅ | AI breakdown |
| POST | `/intent` | ✅ | Create from natural language |

#### POST /intent

Create task from natural language input.

```json
// Request
{
  "text": "Call my PO tomorrow at 2pm",
  "sourceType": "voice",  // text, voice, image
  "isRecurring": false,
  "recurrenceInterval": null  // daily, weekly, monthly, yearly
}

// Response
{
  "task": {
    "id": "uuid",
    "title": "Call my PO",
    "dueAt": "2024-12-10T14:00:00Z",
    "category": "legal",
    "status": "pending",
    "isRecurring": false
  },
  "clarification": null,
  "folders": ["Probation"]
}
```

#### PATCH /tasks/:id

```json
// Request
{
  "status": "completed"  // or "pending"
}

// Response
{
  "id": "uuid",
  "status": "completed",
  "...": "..."
}
```

---

### Tags

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tags` | ✅ | List user tags |
| POST | `/tags` | ✅ | Create tag |
| DELETE | `/tags/:id` | ✅ | Delete tag |

#### POST /tags

```json
// Request
{
  "name": "Court Date",
  "color": "#EF4444"
}

// Response
{
  "id": "uuid",
  "name": "Court Date",
  "color": "#EF4444"
}
```

---

### Calendar

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/calendar/google/connect` | ✅ | Start OAuth flow |
| GET | `/calendar/google/callback` | ❌ | OAuth callback |
| POST | `/calendar/events` | ✅ | Add task to calendar |
| DELETE | `/calendar/events/:taskId` | ✅ | Remove from calendar |

#### POST /calendar/events

```json
// Request
{
  "taskId": "uuid"
}

// Response
{
  "ok": true,
  "googleEventId": "google-event-id"
}
```

---

### Documents (OCR)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/documents` | ✅ | Init upload |
| POST | `/documents/:id/parse` | ✅ | OCR + create task |

---

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/notifications/subscribe` | ✅ | Register push subscription |
| POST | `/notifications/test` | ✅ | Send test notification |

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 500 | Server error |

---

## Rate Limiting

- 100 requests per minute per IP
- 10 requests per minute for `/intent` (AI endpoints)
