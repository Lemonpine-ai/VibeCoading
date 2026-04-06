# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CATvisor** — an AI-powered cat health and behavior monitoring app built with Next.js App Router. It analyzes feeding sessions via computer vision and logs care activities via voice commands.

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Auth & DB**: Supabase (Auth, PostgreSQL, Storage)
- **AI/Vision**: computer vision for feeding session analysis
- **Deployment**: Vercel
- **Package manager**: pnpm

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server (http://localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm format           # Prettier (writes in place)
pnpm typecheck        # tsc --noEmit

# After connecting a Supabase project:
pnpm supabase gen types typescript --local > src/types/database.ts
```

## Architecture

### Directory Structure (App Router)

```
src/
  app/                  # Next.js App Router pages and layouts
    (auth)/             # Route group: unauthenticated pages (login, signup)
    (dashboard)/        # Route group: authenticated app shell
      feeding/          # Feeding session analysis pages
      logs/             # Care activity log pages
    api/                # API route handlers
      vision/           # Computer vision endpoints (feeding analysis)
      voice/            # Voice command processing endpoints
  components/           # Shared UI components
  lib/
    supabase/           # Supabase client (browser + server variants)
    ai/                 # AI/vision utility wrappers
  hooks/                # Custom React hooks
  types/                # Shared TypeScript types/interfaces
```

### Key Architectural Patterns

**Supabase client split**: Use `lib/supabase/server.ts` (with `cookies()`) in Server Components and Route Handlers; use `lib/supabase/client.ts` in Client Components. Never use the server client in `'use client'` files.

**Auth**: Supabase Auth with Next.js middleware (`middleware.ts` at project root) to protect `(dashboard)` routes. Session is read from cookies server-side.

**AI pipeline**: Feeding session images are uploaded to Supabase Storage, then the Storage URL is passed to the vision API route (`/api/vision/analyze`). Results are persisted to the `feeding_sessions` table.

**Voice commands**: Captured via the Web Speech API on the client, normalized, then sent to `/api/voice/command` which maps commands to care log entries in Supabase.

**Server Actions vs Route Handlers**: Prefer Server Actions for form mutations (logging care activities). Use Route Handlers for AI/external API calls that need streaming or binary data (vision, voice processing).

## Supabase

- Use the Supabase CLI for migrations: `supabase db diff`, `supabase migration new`.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to client).
- Row-Level Security (RLS) must be enabled on all tables. Policies should scope data to `auth.uid()`.

## Deployment

Deployed on Vercel. Environment variables are set in the Vercel dashboard. The `SUPABASE_SERVICE_ROLE_KEY` must be marked as a server-only (non-`NEXT_PUBLIC_`) variable.
