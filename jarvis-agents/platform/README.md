# platform

One Next.js app that serves every client business: their website, their
booking page and their dashboard. See the README one folder up for setup.

- `npm run dev` start locally
- `npm run db:migrate` apply database changes
- `npm run db:generate` after editing `src/db/schema.ts`, create the migration
- `npm run seed` add three example businesses
- `npm test` booking engine and database tests

Client sites are reached three ways, all handled in `src/proxy.ts`:
`/s/<slug>`, `<slug>.<ROOT_DOMAIN>`, or their own domain once
`businesses.custom_domain` is set.

To add a theme: copy a folder in `src/themes/`, change it, register it in
`src/themes/index.ts`. All fixed words come from `src/lib/labels.en.json`, so
new text must be added there too, never typed into the theme.
