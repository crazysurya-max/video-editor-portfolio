# Deploy (GitHub + Vercel only)
1. `git push` this folder to your GitHub repo, then Import it in Vercel.
2. Vercel → Storage/Marketplace → add **Upstash Redis** → connect to the project. This auto-adds `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_*`).
3. Vercel → Settings → Environment Variables, add:
   - `ADMIN_PASSWORD` – your admin login password (long)
   - `SESSION_SECRET` – random 64+ char string (`openssl rand -hex 32`)
4. Redeploy. Admin lives at `/admin`.
Edit: `[YOUR NAME]`, `WHATSAPP_NUMBER` in `app/page.tsx`.
Local dev: copy `.env.example` to `.env.local`.
