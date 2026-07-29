# Task 2 Report — 服务端：同步/宠物广播鉴权 + 房间人数上限

## Status: ✅ COMPLETE & VERIFIED

All three changes implemented and the server builds cleanly (`tsc` exit code 0).

---

## Changes Applied

### File A: `packages/server/src/socket.ts`

| Change | Location | What |
|--------|----------|------|
| **A1: sync:state auth** | Line 226 (after rate-limit + roomCode checks) | Added `if (socketRoomMap.get(socket.id) !== d.roomCode) return;` — prevents a socket from broadcasting sync state to a room it doesn't belong to. |
| **A2: pet:update auth** | Line 236 (after rate-limit + roomCode checks) | Added same gate: `if (socketRoomMap.get(socket.id) !== d.roomCode) return;` — prevents cross-room pet event injection. |

Both gates sit **after** rate limiting and roomCode format validation but **before** the payload validation (`isValidSyncState` / `isValidPetState`), consistent with the brief.

### File B: `packages/server/src/rooms.ts`

| Change | Location | What |
|--------|----------|------|
| **B1: 2-user room cap** | Lines 50-53 (before `room.users.add(socketId)`) | Added capacity check: if `room.users.size >= 2`, returns `{ error: "房间已满（最多 2 人）" }`. Comment documents the rationale (双人同步观影场景). |

The check is placed **after** password validation but **before** the user is added — a client presenting the wrong password still gets `NEED_PASSWORD` / `密码错误`, not `房间已满`, which avoids information leakage.

---

## Build Output

```
$ cd D:/clover-blue-planet && pnpm --filter server build
$ tsc
(exit code 0)
```

TypeScript compilation succeeded with no errors.

---

## Concerns

1. **Pass-through loophole on reconnect**: A socket that disconnects and reconnects with a new socketId can bypass the 2-user limit unless `leaveRoom` is always called on disconnect. `socket.ts` line 249-251 already handles disconnect cleanup via `socketRoomMap`, but it's worth verifying `leaveRoom` removes the user from `room.users` (confirmed: `rooms.ts` line 70 does `room.users.delete(socketId)`).

2. **No test coverage**: These changes are purely at the socket/room layer without corresponding unit or integration tests. The auth gates are straightforward but would benefit from at least one test per handler verifying that a socket in room A cannot broadcast to room B.

3. **Error surface**: The 2-user limit returns a Chinese error string inline with the existing pattern. If the client doesn't handle this specific error key, the user may see a generic failure message rather than the capacity-limit explanation.

---

## Files Modified

- `packages/server/src/socket.ts` — +2 lines (auth gates on sync:state and pet:update)
- `packages/server/src/rooms.ts` — +4 lines (capacity check in joinRoom)
