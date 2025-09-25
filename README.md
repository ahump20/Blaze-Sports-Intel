# Blaze Sports Intelligence

A unified React + TypeScript experience that merges every Blaze Intelligence microsite into a single, secure platform for coaches, executives, and partners. The application distills the strongest ideas from the Command Center, Neural Coach, Experience Center, and revenue dashboards into one maintainable codebase.

## Getting Started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:5173](http://localhost:5173) with strict port settings to avoid conflicts.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and emit a production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run test` | Execute the Vitest suite (runs in CI). |
| `npm run test:watch` | Watch mode for local development. |
| `npm run lint` | ESLint using the strict TypeScript + React config. |
| `npm run format` | Format the repository with Prettier. |

## Architecture Overview

- **TypeScript + Vite** – strict typing, fast HMR, and bundle-friendly output.
- **React Components** – hero, capability grids, and Experience Center cards built as composable units.
- **Design System** – lightweight CSS modules with high contrast, accessible focus states, and mobile-first layouts.
- **Runtime Validation** – Zod schemas verify that section data stays aligned with the supported icons and sport order.
- **Testing** – Vitest + Testing Library cover data integrity and rendering of the sport showcase grid.

## Security & Compliance

- No secrets are stored in the codebase; configuration lives in environment variables during deployment.
- ESLint security plugin scans for common injection vulnerabilities.
- Accessible navigation with skip links, semantic headings, and WCAG AA-compliant contrast.

## Deployment

The project outputs static assets through `npm run build`. Host the contents of the `dist` directory on any CDN (Netlify, Cloudflare Pages, Vercel, S3). For containerized deployments, serve the `dist` folder behind an HTTPS CDN and front-door WAF.

## Content Strategy

1. **Command Center** – consolidates roster health, scouting intel, and win probability.
2. **Experience Center** – Baseball → Football → Basketball → Track & Field showcases curated from legacy microsites.
3. **AI Pipeline** – data fusion, model operations, and storytelling studio capabilities in one stack diagram.
4. **Insights** – executive metrics highlighting adoption, decision velocity, and platform consolidation.

## License

MIT © Blaze Intelligence
