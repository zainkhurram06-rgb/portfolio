# platform

One Next.js app that serves every client business: their website, their
booking page and their dashboard. See the README one folder up for setup.

- `npm run db` a local Postgres 16 with nothing to install (leave it running)
- `npm run dev` start locally
- `npm run db:migrate` apply database changes
- `npm run db:generate` after editing `src/db/schema.ts`, create the migration
- `npm run seed` add six example businesses
- `npm test` booking engine, database and template tests
- `npm run shoot` screenshot every template into `../screenshots/templates/` (needs `npm run dev`)

Client sites are reached three ways, all handled in `src/proxy.ts`:
`/s/<slug>`, `<slug>.<ROOT_DOMAIN>`, or their own domain once
`businesses.custom_domain` is set.

## Website templates

`src/templates/` is a library of sections, and templates are recipes made from them.

- `sections/` the building blocks: menu, hero, services, about, steps, team,
  gallery, reviews, FAQ, areas, insurance, guarantee, call to action, contact,
  footer. Most come in a few versions (the hero has six).
- `library.json` every template: which sections in which order, which version
  of each, plus style settings (corners, buttons, spacing, light/tinted/dark,
  heading style), fonts and a default palette. MARK reads this same file.
- `css.ts` the styles. Start/end only, never left/right, so Arabic sites mirror.
- `samples.ts` made-up businesses for the gallery and the tests.

See them all at `/templates` (add `?niche=dental`, and on a template
`&photos=0`, `&lang=ar` or `&lang=de` to stress it).

Sections that need facts the business doesn't have (reviews, photos, insurers,
packages, a guarantee) hide themselves, and the menu skips them.

To add a template: add an entry to `library.json`. To add a section version:
handle it in the component, list it in `sections/index.ts`, style it in
`css.ts`. All fixed words come from `src/lib/labels.en.json` (and
`labels.niches.en.json` for each trade's wording), never typed into a section.
