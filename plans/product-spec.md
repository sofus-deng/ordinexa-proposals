# Ordinexa Product Specification

## Overview

**Ordinexa** is a B2B AI proposal workspace designed to help businesses create, manage, and refine professional proposals with AI assistance. The first module, **Ordinexa Proposals**, focuses on streamlining the proposal creation workflow with intelligent pricing estimation and content generation.

## Product Vision

Build a professional, premium, light-first B2B interface that enables:
- Rapid proposal creation with AI-assisted content generation
- Flexible pricing rule management
- Professional proposal preview and export
- Clean, structured workflow for B2B sales teams

## Target Users

- B2B sales teams
- Proposal managers
- Business development professionals
- Agency account managers

## Core Modules

### 1. Ordinexa Proposals (MVP)

The first module focused on proposal creation and management:

**Key Features:**
- Dashboard with proposal overview and status tracking
- New proposal creation with structured form UI
- Proposal detail/preview view
- Pricing rule configuration
- AI-assisted content generation (future)
- PDF export (future)

### 2. Future Modules (Post-MVP)

- CRM integration
- Template library
- Collaboration features
- Analytics and insights

## Design Direction

### Visual Philosophy

- **Professional & Premium**: Clean, structured interface that conveys trust and competence
- **Light-First**: Near-white neutral base with blue/teal accents
- **Calm & Structured**: Avoid visual noise, prioritize clarity
- **Enterprise-Friendly**: Strong contrast, accessible colors

### Color Palette

| Token | Light Mode | Usage |
|-------|------------|-------|
| `--color-canvas` | `#F8FAFC` | Background/canvas |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-primary` | `#0066FF` | Primary accent (luminous blue) |
| `--color-secondary` | `#0D9488` | Secondary accent (teal) |
| `--color-text-primary` | `#0F172A` | Primary text (deep slate/ink) |
| `--color-text-secondary` | `#475569` | Secondary text |
| `--color-text-muted` | `#94A3B8` | Muted text |
| `--color-border` | `#E2E8F0` | Borders |
| `--color-border-subtle` | `#F1F5F9` | Subtle borders |

### Typography Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-xs` | 12px | 400 | Labels, captions |
| `--text-sm` | 14px | 400 | Body small, metadata |
| `--text-base` | 16px | 400 | Body text |
| `--text-lg` | 18px | 500 | Emphasis |
| `--text-xl` | 20px | 600 | Section headers |
| `--text-2xl` | 24px | 700 | Page titles |
| `--text-3xl` | 30px | 700 | Display headings |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Compact spacing |
| `--space-3` | 12px | Default small |
| `--space-4` | 16px | Default medium |
| `--space-5` | 20px | Comfortable |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Large spacing |
| `--space-10` | 40px | Section gaps |
| `--space-12` | 48px | Major sections |

### Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |

### Radii Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Buttons, inputs |
| `--radius-md` | 8px | Cards |
| `--radius-lg` | 12px | Large containers |
| `--radius-full` | 9999px | Pills, avatars |

## Technical Stack

### Frontend
- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Playwright (E2E)

### Backend
- **Database**: PostgreSQL 18.x
- **ORM**: Prisma 7.x

### Development
- **Node.js**: 20.x+
- **Package Manager**: npm/pnpm

## Project Structure

```
ordinexa/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with shell
│   ├── page.tsx             # Redirect to /dashboard
│   ├── dashboard/           # Dashboard route
│   ├── proposals/           # Proposals routes
│   │   ├── new/            # New proposal form
│   │   └── [id]/           # Proposal detail
│   └── settings/           # Settings routes
│       └── pricing/        # Pricing rules
├── components/              # React components
│   ├── ui/                 # UI primitives
│   ├── layout/             # Layout components
│   └── domain/             # Domain-specific components
├── lib/                     # Utilities and helpers
├── types/                   # TypeScript type definitions
├── data/                    # Mock data and seeds
├── prisma/                  # Prisma schema and migrations
├── tests/                   # Playwright tests
│   └── e2e/
└── plans/                   # Planning documentation
```

## Domain Model

### Core Entities

#### Proposal
- Unique identifier
- Title and description
- Client information
- Status (draft, pending, sent, accepted, rejected)
- Line items with estimates
- Created/updated timestamps
- Total estimate

#### PricingRuleSet
- Active pricing configuration
- Base rates
- Effective date range
- Rules and multipliers

#### PricingProjectType
- Project category (e.g., web app, mobile, consulting)
- Base rate multiplier
- Description

#### PricingStyleMultiplier
- Engagement style (e.g., fixed bid, time & materials, retainer)
- Risk adjustment factor

#### PricingAdjustment
- Custom adjustments
- Rush fees, discounts, etc.

## MVP Scope (Step 1)

### In Scope
- Project foundation and baseline setup
- App shell with navigation
- Design token system
- Domain types and mock data
- Route implementations (dashboard, proposals, settings)
- Prisma schema foundation
- Playwright smoke tests

### Out of Scope (Future Steps)
- AI content generation (OpenAI integration)
- PDF export
- Authentication
- CRM integration
- Real database persistence (using mock data initially)
- Estimation engine logic

## Success Criteria

1. Clean, professional UI that reflects the design direction
2. All routes functional with mock data
3. Responsive layout working across desktop and mobile
4. All tests passing
5. Code is well-organized and maintainable
6. Design tokens properly structured for future dark mode

## Future Roadmap

### Step 2: Estimation Engine
- Implement pricing calculation logic
- Real-time estimate updates
- Formula-based pricing

### Step 3: AI Integration
- OpenAI integration for content generation
- Proposal section suggestions
- Smart templates

### Step 4: Export & Sharing
- PDF generation
- Email integration
- Public proposal links

### Step 5: Authentication & Multi-tenancy
- User authentication
- Organization management
- Role-based access

### Step 6: CRM Integration
- Salesforce integration
- HubSpot integration
- Contact sync
