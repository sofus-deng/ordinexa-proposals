This is Ordinexa Proposals, a premium light-first B2B proposal workspace built on [Next.js](https://nextjs.org).

## Getting Started

First, install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

## Available routes

- `/`
- `/dashboard`
- `/proposals/new`
- `/proposals/[id]`
- `/settings/pricing`

## Local notes

- Planning docs live under `plans/`
- UI is powered by mock domain data in Step 1
- Prisma and PostgreSQL are scaffolded as the persistence foundation for later steps
- Use `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` before shipping

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load Geist for a calm enterprise UI baseline.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
