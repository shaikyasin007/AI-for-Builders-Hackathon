# CodeGuardian AI

AI-powered code review dashboard: connect GitHub repos, import pull requests, and get Gemini-generated reviews stored in Supabase.

## Quick start

```bash
pnpm install   # or npm install
cp .env.example .env   # fill in Supabase + Google AI keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Hackathon demo account, GitHub push, and Vercel deploy:** see [HACKATHON.md](./HACKATHON.md).

## Stack

- Next.js 16 · React 19 · Tailwind · shadcn/ui  
- Supabase (auth + database)  
- Google Gemini (`gemini-2.5-flash-lite`) via Vercel AI SDK  

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `node scripts/create-demo-user.mjs` | Create hackathon demo login |

## Database

Apply schema in Supabase SQL Editor: `supabase-schema.sql`  
Optional alignment: `supabase-migrations/align-reviews-table.sql`
