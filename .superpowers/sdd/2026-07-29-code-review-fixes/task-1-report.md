# Task 1 Report — 服务端：创建者自动加入房间 + 消息 sender 服务端覆写

## Status: DONE ✅

## Commits Made
None — per instructions, files were modified but not staged or committed.

## Changes Applied

### File: `packages/server/src/socket.ts`

**Change A — Creator auto-joins room (lines 129-131)**
After `createRoom(d.code, password)`, added:
- `socket.join(d.code)` — creator joins the Socket.IO room
- `socketRoomMap.set(socket.id, d.code)` — tracks the mapping so disconnect cleanup works

This ensures the room creator is immediately present in the room, fixing the bug where creators had to manually re-join.

**Change B — Sender field forced on relay (lines 215-218)**
Changed the chat message forward from:
```typescript
if (partner) io.to(partner).emit("chat:message", d.message);
```
to:
```typescript
if (partner) {
  io.to(partner).emit("chat:message", { ...msg, sender: "partner" });
}
```

This prevents clients from forging the `sender` field — the receiving client always sees `sender: "partner"` regardless of what the sending client puts in the field.

## Build Verification
```
$ tsc
Exit code: 0
```
TypeScript compilation passed with no errors.

## Concerns
None. Both changes are minimal, scoped to existing code paths, and preserve the existing event names and payload structures. No new files or dependencies were introduced.
