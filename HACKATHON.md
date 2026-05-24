# CodeGuardian — Hackathon setup

## Demo login (for judges)

| Field | Value |
|--------|--------|
| **Email** | `demo@codeguardian.app` |
| **Password** | `HackathonDemo2026!` |

Create the account once:

```bash
node scripts/create-demo-user.mjs
```

**Supabase auth settings (important):**

| Setting | What to do |
|---------|------------|
| **Providers → Email** | Must stay **ON** (enabled) |
| **Confirm email** | Turn **OFF** (so demo login works without inbox) |
| **Disable new signups** | Optional — judges use demo account only |

Do **not** disable the whole Email provider. That causes `Failed to fetch` on login/register.

1. [Supabase Dashboard](https://supabase.com/dashboard) → your project  
2. **Authentication** → **Providers** → **Email** → ensure enabled  
3. Turn off **Confirm email** only → Save  

If signup fails because the user already exists, use the credentials above on `/login` or click **Use hackathon demo account**.

---

## Push to your existing GitHub repo

**Do not delete the remote repo.** Pushing does not delete old files by itself — Git merges or updates files by path.

### Option A — Keep remote history (recommended)

```bash
cd d:\configure-and-run
git init
git add .
git commit -m "CodeGuardian AI: hackathon-ready app with Supabase and Gemini reviews"

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git pull origin main --allow-unrelated-histories
# Resolve any conflicts, then:
git push -u origin main
```

### Option B — Replace remote with this project only

Only if you want the GitHub repo to match this folder exactly (old files gone):

```bash
git init
git add .
git commit -m "CodeGuardian AI hackathon submission"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main --force
```

Use **Option B** only on a repo you own and do not need the old commits.

---

## Deploy on Vercel (recommended)

1. Push code to GitHub (`.env` is gitignored — secrets stay local).  
2. [vercel.com](https://vercel.com) → **Add New Project** → import your repo.  
3. Framework: **Next.js** (auto-detected).  
4. **Environment variables** (Project → Settings → Environment Variables):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio |
| `GEMINI_MODEL` | `gemini-2.5-flash-lite` |
| `MAX_AI_REVIEWS_PER_IMPORT` | `2` |

5. Deploy → copy the production URL.  
6. **Supabase** → Authentication → URL configuration → add your Vercel URL to **Site URL** and **Redirect URLs** (e.g. `https://your-app.vercel.app/auth/callback`).

Optional GitHub OAuth (Settings page):

- `NEXT_PUBLIC_GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

---

## Before you push — checklist

- [ ] `.env` is **not** committed (listed in `.gitignore`)  
- [ ] Demo user created (`node scripts/create-demo-user.mjs`)  
- [ ] Supabase email confirmation disabled for demo login  
- [ ] Vercel env vars set after deploy  
