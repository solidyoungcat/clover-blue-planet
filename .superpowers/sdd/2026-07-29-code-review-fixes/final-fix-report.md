# Final Fix Report — 2026-07-29 Code Review

## Fix: Room Creator Missing from `room.users` Set

**File:** `packages/server/src/socket.ts`
**Commit:** `fix(server): add room creator to room.users Set`

### Problem

During the final review, a critical bug was discovered: Task 1 added `socket.join()` and `socketRoomMap.set()` for the room creator, but did **not** add the creator to `room.users` Set. This silently broke all partner-dependent features:

- `partnerId` always `null`
- `room:partner-joined` event never fires
- All chat, sync, and pet relay silently fails

### Root Cause

The `room:create` handler called `createRoom(d.code, password)` as a fire-and-forget call without capturing the return value, so there was no way to access the `room.users` Set to add the creator.

### Fix

A 3-line change (net +2 lines) that captures `createRoom()`'s return value and adds the creator's socket ID to the room:

```diff
-      createRoom(d.code, password);
+      const room = createRoom(d.code, password);

       // 创建者自动加入房间
+      room.users.add(socket.id);
       socket.join(d.code);
       socketRoomMap.set(socket.id, d.code);
```

### Build Status

✅ `pnpm --filter server build` passed successfully.

### Impact

| Before | After |
|--------|-------|
| Creator not in `room.users` | Creator properly registered |
| `partnerId` always `null` | Partner discovery works |
| All chat/sync/pet relay broken | Full functionality restored |
