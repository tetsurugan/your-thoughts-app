# Demo Mode Testing Workflow

## Description
How to test the Legal Demo Mode feature in the Your Thoughts app.

## Prerequisites
- Backend running on port 3001
- Frontend running on port 5173
- Fresh database (no stale data)

## Quick Start
// turbo-all

1. Reset database and restart backend:
```bash
rm backend/prisma/dev.db && cd backend && npx prisma db push && pkill -f "ts-node-dev" && sleep 2 && npm run dev
```

2. Clear browser storage:
   - Open DevTools → Application → Storage → Click "Clear site data"
   - Also clear IndexedDB if you see any databases

3. Navigate to demo URL:
   - Open new tab: `http://localhost:5173/?demo=legal`
   - OR click "Try Demo Mode" button on landing page

## Expected Demo Data

### Legal Folders (7)
- Probation, Court, Benefits, Housing, Programs, Health, Personal

### Legal Tags (4)
- Court Date, PO Meeting, Document Due, Appointment

### Demo Tasks (5)
- Call Public Defender - Urgent (Today)
- Submit Income Verification (Today)
- PO Check-in with Officer Martinez
- Court Hearing - Case #2024-CR-1234
- Pay Court Fees - $150

## Troubleshooting

### "500 Internal Server Error" on login
- Backend needs restart after database reset
- Run: `pkill -f "ts-node-dev" && cd backend && npm run dev`

### Wrong folders showing (Events, Ideas, Personal)
- Browser has stale token from non-demo guest login
- Clear ALL site data and try again

### Duplicate tags
- Multiple guest accounts created from failed login attempts
- Reset database with step 1 above

### No tasks appearing
- Check "All" tab (not just "Today")
- Verify backend console shows `[DemoSeeding]` logs
