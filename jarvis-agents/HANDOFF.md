# HANDOFF: jarvis-agents

Read this first in a new chat. Last updated 22 October 2026 (template library session).

## Where the code is

- Repo: `zainkhurram06-rgb/portfolio`, branch `claude/exciting-ritchie-xwskss`, folder `jarvis-agents/`.
- It lives inside the portfolio repo only because GitHub blocked creating a new repo from
  the session. Zain is to create an empty private repo (suggested name `jarvis-agents`),
  then move the folder there.
- Jarvis himself (the voice assistant, `jarvis.py`) lives on Zain's Windows laptop at
  `C:\Users\zaink\.openclaw\jarvis\`. It is not in this repo. Its own HANDOFF.md covers it.

## The big picture (decided with Zain)

Jarvis becomes the product manager. Agents are his employees:

| Agent | Job | Status |
|---|---|---|
| JARVIS | Product manager. Zain talks to him, he assigns and checks work | Exists as voice assistant, not yet connected to agents |
| MARK | Developer. Lead in, demo website + booking + dashboard out | Built |
| EDITH | Lead tracker. Finds leads with no website, active on social, drops them in pipeline/1-leads | Built (samples only, needs APIFY_TOKEN) |
| FRIDAY | Sales caller. ElevenLabs voice agent + phone line, pitches the demo | Not started |
| HAPPY | Quality check. Verifies everyone's work before it reaches Zain | Not started |

Order agreed: build the agents first, connect them to Jarvis later.

## Decisions already made (don't reopen)

- **Brains:** code first (free), cheap API keys for repetitive jobs (Claude Haiku, DeepSeek),
  subscription CLIs (Codex first, then Claude) for heavy thinking. Not big models for small jobs.
- **Market:** global. Zain plans one country and city a day. Everything supports any
  language, currency and timezone.
- **Product:** one multi-tenant web platform like Shopify, not a backend per client, and
  not a mobile app. Owners get a simple dashboard. Charged monthly.
- **Skeleton first, skin later.** Zain said the current look can be much better, and that's fine
  for now. The structure matters, the designs get redone from his references.
- **Healthcare data:** dental, medical and dermatology accounts never store free-text notes,
  and their booking questions never ask about symptoms. Clinics that must keep data elsewhere
  use "external booking" mode.
- **The lead sheet is NOT ours to build.** Zain was clear: EDITH, the lead tracking agent,
  will own leads inside Jarvis. Don't build a lead sheet in the platform or MARK.
- **FRIDAY:** ElevenLabs agent. Legal guardrails as features (landline/mobile check,
  do-not-call lists, calling hours, says it's an AI). Test calls go to Zain's phone first.
- **Names are final:** JARVIS, EDITH, FRIDAY, MARK, HAPPY.
- **Pipeline (Zain, 23 Oct):** no CRM software. Folders arranged like a CRM: each business is
  a folder that moves through `pipeline/1-leads` ... `9-lost`. "Qualified" means FRIDAY pitched
  them and they're interested. HAPPY checks website quality against rules Zain will set, then Zain.
- **Leads have no website.** Their brand comes from social media (Instagram, Facebook, TikTok,
  Google listing). Research runs through Claude CLI (Sonnet) in Zain's own Chrome via the
  Claude in Chrome extension, not Apify.
- **EDITH's rules (Zain, 24 Oct):** 150 to 300 leads a city but never force it; no website;
  posted on social in the last 10 to 15 days; 50+ Google reviews; phone; complete street address
  for shopfront businesses (online/mobile ones skip that rule). First trade: beauty and hair salons
  (incl. nails, barbers, lash/brow). Lead finding uses Apify (volume would get his Instagram
  flagged through Chrome); MARK's research still uses his Chrome.
- **Build order (Zain, 22 Oct):** template library as far as it goes, get MARK's skeleton right,
  build, test, then the next agent, repeat. Making it beautiful comes last, from the 60 references.

## What's built

`jarvis-agents/platform/`: Next.js 16 + Postgres (Drizzle). One app for every business.
- Public site per business at `/s/<slug>`, a subdomain, or their own domain (`src/proxy.ts`).
- Booking page: service, person, day, time, then the trade's own questions. Business timezone,
  any language.
- Owner dashboard `/admin`: Today, Calendar (with walk-in bookings), Customers, Messages,
  Services, Team & hours (with time off), My website (no-code editor), Settings.
- Seven trades in `src/lib/niches.ts`: salon, dental, medical, dermatology, carwash,
  autorepair, homeservices. Each has its own booking questions (car wash: vehicle size,
  mechanic: make/model, mileage, wait or drop off, clinics: new or returning patient, insurance).
- **Template library** in `src/templates/` (replaced the 3 old themes). 18 section types
  with 1 to 6 versions each, and 24 templates in `library.json` (recipes: sections in order,
  version, tone, style settings, fonts, palette). Every trade has 4 or 5. Sections whose facts
  are missing hide themselves. Gallery of all of them at `/templates`. Skeleton quality on
  purpose: restyle the sections from the references later and every template improves.
- Every template also exists as a real HTML file: `jarvis-agents/templates/<trade>/<id>.html`,
  index at `templates/index.html` (`npm run export` regenerates them). Zain wants finished work
  shown as real HTML files he can open, not screenshots.
- Trade details on the content (facts only, from the lead): credentials, warranty, insurers,
  car wash packages priced by vehicle size, before/after photos. Editable in My website.
- All fixed site text lives in `src/lib/labels.en.json` (+ `labels.niches.en.json` for each
  trade's wording). MARK translates it into the lead's language.
- Double booking is impossible: database exclusion constraint plus an advisory lock per staff
  member. That lock fixed real deadlocks found under load.
- Private API for agents: `POST /api/internal/businesses` (Bearer `INTERNAL_API_TOKEN`).

`jarvis-agents/agents/pipeline.py`: the pipeline folders, `add`, `move`, `list`, and the board
page `pipeline/index.html`. `pipeline/` is git-ignored (real business data).

`jarvis-agents/agents/edith/`: EDITH. `edith.py` (search, rules, Instagram/Facebook recency,
score, add to pipeline, HTML report), `apify.py` (live client with maxTotalChargeUsd cap, or
samples from `samples/apify/` with `{days_ago:N}` dates), `rules.json` (Zain's rules, search terms,
links that don't count as a website). Plan in `pipeline/edith-plan.json`. Known gap: a business
whose Google listing has no social link at all is skipped; a later version can search Instagram
for them by name.

`jarvis-agents/agents/mark/`: Python. Pipeline work: `python -m agents.mark work` (research +
build every lead), or `research <key>` / `build <key>`. Old one-off: `demo --lead lead.json`.
- `research.py`: sources `sample` (samples/research/, matched by social handle) and `chrome`
  (claude -p --chrome --model sonnet, JSON schema output, downloads media, 25/day cap).
- `branding.py`: logo = profile picture, palette from logo then photos (black logos lead with
  black), photo picking (size, sharpness, brightness, duplicates), best reel = hero video.
- `work.py`: builds into `3-demo-built/<key>/site/index.html` + `site/media/`, uploads media to
  the platform (`POST /api/internal/media`, files in `platform/.media`), live demo still made,
  `build.json` records template, demo link and login. Export via `platform/scripts/export-site.ts`
  (Next.js can't render the contact form to a file inside a route).
- Samples: 3 no-website businesses in `samples/leads`, `samples/research`, `samples/plans`
  (`samples/make_research.py` regenerates the fake media).
- Picks the template in code (`templates.py`), not the AI: right trade, no photo-led design
  without a photo, scored by how much of the page the lead's facts fill, then least used in
  the same city (asks `/api/internal/themes?niche=&city=`), then a stable per-lead choice.
  Fonts come from the template; colours from brand colours if the lead has them, else the
  template's. `--template <id>` forces one, `python -m agents.mark templates` lists them.
- Brains tried in order: haiku, deepseek, codex, claude (`MARK_BRAINS`). `file:x.json` for tests.
- Facts (name, phone, address, real reviews, rating) come from the lead in code, never the AI.
- Demo logins never use the business's real email. Demo sites carry a "demo preview" bar and
  noindex.

Tests: `cd platform && npm test` (34 pass: booking engine with an 8-people-at-once stress test, media storage safety,
plus every template rendered for every trade it claims, with and without photos, in English,
German and Arabic). `python -m unittest agents.test_pipeline agents.mark.test_work agents.mark.test_mark` (56 pass, 11 of them EDITH).
Lint, types and production build clean.

Screenshots of every screen: `jarvis-agents/screenshots/`. Every template, desktop and phone:
`screenshots/templates/` (`npm run shoot` retakes them).

## Not done yet

1. **Real designs, last.** The template library skeleton is done. When it's time to make it
   beautiful: review the 60 reference sites below (a local session on Zain's laptop can open
   them), pick the best 3 per niche, and restyle the section versions in `src/templates/`.
   Home services has no references yet.
2. Reminders don't send yet (WhatsApp / SMS / email). The setting exists, nothing sends.
3. Google Calendar sync, deposits and payments, car wash memberships, photo uploads
   (owners paste image links for now).
4. Real research has never run: the Claude CLI on the laptop said "OAuth session expired" on
   23 Oct. Zain needs to run `claude` and `/login`, and have the Claude in Chrome extension on.
   MARK has never made a live AI call for the words either. No API key in the sandbox. Tested with sample files only.
5. EDITH has only run on samples: needs `APIFY_TOKEN` and a paid Apify plan for full cities.
   FRIDAY and HAPPY: not started. Connecting agents to Jarvis: later.
6. Hosting: runs locally only. Suggested Vercel + Supabase when Zain wants to click around.

## What Zain needs to do

1. Nothing for network access if work continues in a local session on the laptop (it has
   internet). Only needed for cloud sessions.
2. Create an empty private GitHub repo `jarvis-agents` and share the name.
3. Put a Claude or DeepSeek API key on his laptop for one live MARK test.
4. Apify: API token (and a paid plan for 150 to 300 leads a city, roughly $8 a city).
5. Log the Claude CLI back in (`claude`, then `/login`) for MARK's Chrome research.

## Running it on Zain's laptop (local session)

- Repo cloned at `C:\Users\zaink\portfolio`, branch `claude/exciting-ritchie-xwskss`.
- No Postgres install: `cd platform; npm run db` starts an embedded Postgres 16 on port 5433
  (data in `platform/.pgdata`, git-ignored). Leave it running, then `npm run db:migrate`,
  `npm run seed`, `npm run dev`.
- `platform/.env.local`: `DATABASE_URL=postgres://postgres:postgres@localhost:5433/platform`,
  plus the same ROOT_DOMAIN and INTERNAL_API_TOKEN as below.
- Python venv for MARK at `jarvis-agents/.venv` (git-ignored): `.venv\Scripts\python -m agents.mark ...`
- `npm run shoot` uses the Chrome or Edge already installed.

## Running it locally (cloud session notes)

- Postgres 16: data in `/var/lib/postgresql/devdata`, port 5433. After a container restart:
  `su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/devdata -o '-p 5433 -k /tmp' -l /var/lib/postgresql/devdata/server.log start"`
- `platform/.env.local` (not committed): `DATABASE_URL=postgres://postgres@localhost:5433/platform`,
  `ROOT_DOMAIN=localhost:3000`, `INTERNAL_API_TOKEN=dev-token-not-secret-0123456789`.
- `npm run db:migrate`, `npm run seed` (skips businesses that exist), `npx next build && npx next start`.
- Demo logins: `owner@luna.example`, `owner@harbour.example`, `owner@clearskin.example`,
  `owner@gleam.example`, `owner@northline.example`, `owner@coastline.example`, all
  password `demo-password`.
- Playwright: `/opt/node-tools/node_modules/playwright`, Chromium preinstalled.
- Windows setup for Zain's laptop is in `README.md`.

## How to work with Zain

- Casual, direct, fast. Plain language, he isn't a developer. Give exact commands and say which shell.
- **Never use em dashes**, anywhere.
- Honest over diplomatic. Push back once, clearly, then help.
- Plan with him before big moves. He was annoyed when I ran ahead and built a lead sheet he hadn't asked for.
- Big batches over small rounds. Skeleton now, polish later.
- He decides direction, Claude builds.

## The 60 reference sites

CAR WASHING & DETAILING: santapalmcarwash.com, silversponge.com.au, starcarwash.com.au,
mintecocarwash.com, oceanbluecarwash.com, quickquack.com, gocarwash.com, modwash.com,
scrubadub.com, tidalwaveautospa.com

MECHANICS & AUTO REPAIR: sageautorepair.com, autocorrectaz.com, themechanicspot.com,
mikesautobodynorth.com, ottohausofcharleston.com, marinosautorepair.com, phoenixautoshop.com,
mycarhurts.com, electrifiedgarage.com, carstar.com

GENERAL MEDICAL CLINICS: onemedical.com, asktia.com, parsleyhealth.com, halcyonhealthdpc.com,
synergyprivatehealth.com, mavenclinic.com, annafamilyhealthcare.com, centralmedurgentcare.com,
nextcare.com, kindbody.com

DENTAL CLINICS: smilecotampapalms.com, prismoralsurgery.com, hellotend.com/site/home,
dentaldesignsd.com, seattledentalco.com, abc.dental, dentalboutique.co.nz, huedentalca.com,
dentologie.com, smile2impress.com/uk/

DERMATOLOGY & SKIN CLINICS: rendermatology.com, 4bridgesderm.com, moderndermct.com,
smarterskindermatology.com, metropolisdermatology.com, cumberlandskin.com, dermic.com,
parkcitydermatology.com, riverchasedermatology.com, pacificcoastdermatology.com

BEAUTY & HAIR SALONS: thelanesalon.com, salonsck.com, suitecaroline.com, strangebirdsalon.com,
bijinsalon.com, hershesons.com, jonalansalon.com, grandnoirsalon.com, societysalons.com,
121-salon.com
