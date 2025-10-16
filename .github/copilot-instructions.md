# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a Next.js app using the `/app` directory structure, bootstrapped with `create-next-app`.
- Main entry point: `app/page.js`. Global styles: `app/globals.css`. Layout: `app/layout.js`.
- Configuration files: `next.config.mjs`, `jsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`.
- Static assets are in `public/`.

## Developer Workflows
- **Start development server:**
  - `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`)
  - App runs at [http://localhost:3000](http://localhost:3000)
- **Edit main page:**
  - Modify `app/page.js` for homepage changes. Hot reload is enabled.
- **Global styles:**
  - Edit `app/globals.css` for CSS changes.
- **Font optimization:**
  - Uses `next/font` for automatic font loading (Geist).

## Patterns & Conventions
- Uses Next.js [App Router](https://nextjs.org/docs/app) conventions.
- All pages/components are in the `app/` directory. Avoid using the legacy `pages/` directory.
- Use ES modules (`.js`, `.mjs`).
- Configuration files use `.mjs` for ESM compatibility.
- No custom API routes or server-side logic detected in this codebase.
- No test or build scripts beyond Next.js defaults.

## External Integrations
- No custom integrations or external services detected.
- Deployment is recommended via Vercel (see README.md).

## Example: Adding a New Page
1. Create a new file in `app/`, e.g. `app/about.js`.
2. Export a React component from the file.
3. Access it at `/about` in the browser.

## References
- See `README.md` for basic setup and deployment instructions.
- See Next.js docs for advanced features: https://nextjs.org/docs

---

**If you need to implement new features, follow the Next.js App Router conventions and keep all new pages/components in the `app/` directory.**
