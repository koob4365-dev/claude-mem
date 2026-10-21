# Windows 11 client

The reference Windows path is **WSL2 + Ubuntu 24.04**. Windows is a thin client;
the long-running claude-mem worker, memory database, and provider credentials
stay in the cloud environment.

From an elevated PowerShell prompt, install WSL2 once:

```powershell
wsl --install -d Ubuntu-24.04
```

After the requested restart, use the Ubuntu shell for Git and SSH tooling. Do
not copy `/tmp/claude-mem-runtime`, Claude login state, or cloud `.env` files to
Windows. Access GitHub through the normal repository URL and connect to the
future cloud WebSocket endpoint with a short-lived authorization header, never
a token in the query string.

Native Windows Node/Bun and Docker Desktop are not required for this design.
They can be added later for local development, but they are intentionally not
part of the cloud body's source of truth.
