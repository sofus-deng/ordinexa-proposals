This is Ordinexa Proposals, a premium light-first B2B proposal workspace built on [Next.js](https://nextjs.org).

## Getting Started

### Local Development

First, install dependencies and set up the environment:

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

### Environment Setup

The app uses mock data by default. To enable AI-powered proposal generation with Gemini:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. The app will automatically use Gemini when the key is available

See `.env.example` for all available environment variables.

## Available routes

- `/`
- `/dashboard`
- `/proposals/new`
- `/proposals/[id]`
- `/settings/pricing`

## Validation Commands

Run these commands before pushing changes:

```bash
# Individual checks
pnpm typecheck   # TypeScript type checking
pnpm lint        # ESLint code linting
pnpm test:unit   # Unit tests
pnpm test:e2e    # End-to-end tests (requires dev server)
pnpm build       # Production build

# Combined commands
pnpm test        # Run unit + e2e tests
pnpm validate    # Run all checks (typecheck + lint + tests + build)
```

### Pre-push Checklist

Run `pnpm validate` to ensure all checks pass before pushing.

## Project Notes

- Planning docs live under `plans/`
- UI is powered by mock domain data in Step 1
- Prisma and PostgreSQL are scaffolded as the persistence foundation for later steps

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load Geist for a calm enterprise UI baseline.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Vercel Demo Deployment

For demo deployments on Vercel Hobby:

1. Connect your repository to Vercel
2. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_APP_URL`: Your deployed URL (e.g., `https://your-app.vercel.app`)
   - `GEMINI_API_KEY`: Optional, for AI-powered generation
   - Other variables from `.env.example` as needed
3. Deploy

The app will use mock data when `GEMINI_API_KEY` is not set.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
