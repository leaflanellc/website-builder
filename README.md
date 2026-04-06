# Website Builder Foundation (LEA-131 + LEA-133)

Shared Website Builder foundation with deterministic `ProjectSpec` generation, static template rendering, and preview/production deployment metadata automation.

## Foundation Components

- Typed `ProjectSpec` schema (`src/types.ts`)
- Deterministic draft generator (`src/generator.ts`)
- Shared static template renderer (`src/template.ts`)
- Preview/production deployment tracking (`src/deploy.ts`)
- CLI orchestration (`src/cli.ts`)

## Commands

- `npm run generate` - generate draft JSON artifacts into `.generated/site`
- `npm run render` - render static site template into `.generated/site-static`
- `npm run preview` - write preview deployment record
- `npm run publish` - promote latest preview to production record
- `npm run deploy:preview` - generate + render + preview flow
- `npm run deploy:production` - generate + render + publish flow
- `npm run build` - type-check source
- `npm test` - run unit tests

## Netlify Wiring

- `netlify.toml` is configured with:
  - build command: `npm run generate && npm run render`
  - publish dir: `.generated/site-static`
  - deploy-preview context calling `npm run preview`
  - production context calling `npm run publish`

## Environment Conventions

Use `.env.example` as the baseline for local + CI setup:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `PROJECT_SPEC_PATH`
- `DRAFT_OUTPUT_DIR`
- `STATIC_OUTPUT_DIR`
