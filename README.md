# MasterStrap - Next.js E-Commerce

## 快速开始

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env.local` 并填写：
- `DATABASE_URL` (Neon PostgreSQL)
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL`

## 部署到 Vercel

```bash
vercel --prod
```

Build Command: `prisma generate && next build`
