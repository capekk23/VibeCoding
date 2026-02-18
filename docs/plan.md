# OpenChat Plan - Discord Alternative

## Goals
Self-hosted Discord clone: DMs, Servers (guilds), channels, roles/permissions, file sharing (images/files), screensharing (WebRTC), voice (later), reactions/emojis, typing indicators.
- Web app + Native apps (Windows/Mac/Linux/iOS/Android) via Tauri/Electron.
- Readable code: JavaScript/TypeScript (Node backend, React frontend).

## MVP Features
1. **Auth**: Register/login (JWT), OAuth later.
2. **Servers**: Create/join, channels (text/voice).
3. **Messages**: Send/receive real-time (Socket.io), history.
4. **DMs**: 1:1/group.
5. **Files**: Upload/share (Multer/S3-like).
6. **Screenshare**: WebRTC peer-to-peer.
7. **Roles/Perms**: Basic admin/mod.
8. **Notifications**: Web push.

## Tech Stack
- **Backend**: Node/Express + Socket.io + MongoDB (Mongoose).
- **Frontend**: Vite + React + Tailwind + Socket.io-client.
- **Native**: Tauri (Rust shell + WebView, cross-platform).
- **DB**: Mongo (dev), Postgres prod.
- **WebRTC**: Simple-Peer or native.
- **Deploy**: Docker, PM2/ systemd.

## Architecture
```
Clients (Web/Native) <-> Socket.io Gateway <-> Express API <-> MongoDB
                          |
                       Redis (sessions/pubsub)
```

## Phases
1. Backend skeleton + Auth.
2. Real-time messaging (servers/channels/DMs).
3. File upload/screenshare.
4. Frontend MVP.
5. Native wrappers.
6. Polish/deploy.

No VC bloat. Privacy-first, E2E optional.