# HANDOFF: jarvis-agents

Read this first in a new chat. Last updated 22 October 2026.

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
| EDITH | Lead tracker. Finds and qualifies leads. Owns the lead sheet | Not started |
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
- Three placeholder skins in `src/themes/` (clinic, homeservices, salon), shared across the trades.
- All fixed site text lives in `src/lib/labels.en.json` (+ `labels.niches.en.json` for each
  trade's wording). MARK translates it into the lead's language.
- Double booking is impossible: database exclusion constraint plus an advisory lock per staff
  member. That lock fixed real deadlocks found under load.
- Private API for agents: `POST /api/internal/businesses` (Bearer `INTERNAL_API_TOKEN`).

`jarvis-agents/agents/mark/`: Python. `python -m agents.mark demo --lead lead.json`.
- Brains tried in order: haiku, deepseek, codex, claude (`MARK_BRAINS`). `file:x.json` for tests.
- Facts (name, phone, address, real reviews, rating) come from the lead in code, never the AI.
- Demo logins never use the business's real email. Demo sites carry a "demo preview" bar and
  noindex.

Tests: `cd platform && npm test` (19 pass, includes an 8-people-at-once stress test).
`python -m unittest agents.mark.test_mark` (14 pass). Lint, types and production build clean.

Screenshots of every screen: `jarvis-agents/screenshots/`.

## Not done yet

1. **Real designs.** Zain gave 60 reference sites (10 each: car wash, auto repair, medical,
   dental, dermatology, salons). They're in the chat that produced this file and listed below.
   None could be opened because the cloud session's network policy blocks outside sites. Next
   step: open network access, review all 60, pick the best 3 per niche, build skins from them.
2. Reminders don't send yet (WhatsApp / SMS / email). The setting exists, nothing sends.
3. Google Calendar sync, deposits and payments, car wash memberships, photo uploads
   (owners paste image links for now).
4. MARK has never made a live AI call. No API key in the sandbox. Tested with sample files only.
5. EDITH, FRIDAY and HAPPY: not started. Connecting agents to Jarvis: later.
6. Hosting: runs locally only. Suggested Vercel + Supabase when Zain wants to click around.

## What Zain needs to do

1. Open internet access for the cloud environment (title bar, environment, Edit, Network
   access, full access). Guide: https://code.claude.com/docs/en/cloud-environments#network-access
2. Create an empty private GitHub repo `jarvis-agents` and share the name.
3. Put a Claude or DeepSeek API key on his laptop for one live MARK test.

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
