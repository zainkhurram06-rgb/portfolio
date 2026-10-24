# jarvis-agents

Zain's agent team, plus the platform they sell.

**JARVIS** is the product manager you talk to. The employees do the work:

| Agent | Job | Status |
|---|---|---|
| **MARK** | Developer. Turns a lead into a live demo: website, booking page, owner dashboard | Built |
| **EDITH** | Lead tracker. Finds and qualifies leads | Next |
| **FRIDAY** | Sales caller. ElevenLabs voice agent, pitches the demo | Later |
| **HAPPY** | Quality check. Checks everyone's work before it reaches you | Later |

## What's in here

```
platform/        the product. one web app serving every client business, like Shopify
  src/templates/   website templates: a section library plus recipes in
                   library.json. see them all at /templates
  src/lib/niches.ts  the trades: salon, dental, medical, dermatology, carwash,
                   autorepair, homeservices. each has its own booking questions
  src/app/(site)/  every client's public website + booking page
  src/app/(admin)/ the owner dashboard: Today, Calendar, Customers, Messages,
                   Services, Team & hours, My website, Settings
  src/lib/         booking engine, logins, labels (site words in any language)
agents/mark/     MARK. python, same as Jarvis
samples/         an example lead, plan and Spanish labels for testing without AI
```

## How the pieces fit

1. A lead comes in (by hand today, from EDITH later).
2. MARK writes the site's words, picks colours and services, translates the
   buttons into the lead's language, and creates the business on the platform.
3. The platform gives back a demo website, a booking page and a dashboard login.
4. FRIDAY (later) calls the lead: "I built you a website, take a look."
5. They sign up, the demo bar comes off, and they pay monthly.

## Running it on your laptop (Windows, PowerShell)

You need Node.js 22+ and Python 3.11+. No Postgres install needed: `npm run db`
runs a real Postgres 16 inside the project (or use a free Supabase or Neon
database).

```powershell
# 1. the platform
cd jarvis-agents\platform
npm install
copy .env.example .env.local      # then edit DATABASE_URL and INTERNAL_API_TOKEN
                                  # local: postgres://postgres:postgres@localhost:5433/platform
npm run db                        # leave this window open, use a second one for the rest
npm run db:migrate
npm run seed                      # six example businesses
npm run dev                       # http://localhost:3000/admin
```

Example sites: `/s/luna-hair-studio` (salon), `/s/harbour-dental` (dental),
`/s/clearskin-dermatology`, `/s/gleam-car-spa` (car wash), `/s/northline-auto`
(mechanic), `/s/coastline-plumbing` (home services). Dashboard logins are
`owner@<name>.example` (luna, harbour, clearskin, gleam, northline, coastline),
password `demo-password`. `npx tsx --env-file=.env.local scripts/demo-data.ts <slug>`
fills one with a realistic week of bookings.

```powershell
# 2. MARK, in a second window
cd jarvis-agents
pip install -r requirements.txt
$env:INTERNAL_API_TOKEN = "the same token as in .env.local"
$env:ANTHROPIC_API_KEY  = "sk-ant-..."          # or DEEPSEEK_API_KEY, or neither if codex is installed
python -m agents.mark demo --name "Bright Smile Dental" --niche dental --country GB --city Leeds --phone "+44 113 555 0101"
```

MARK prints the demo's website link and a demo dashboard login.

Test MARK with no AI and no cost:

```powershell
python -m agents.mark demo --lead samples\lead-madrid-salon.json --brains file:samples\plan-madrid-salon.json --label-brains file:samples\labels-es.json
```

## The pipeline (folders arranged like a CRM)

Every business is one folder in `pipeline/` (git-ignored: real leads stay off
GitHub). The stage folder it sits in is its place in the funnel:

```
1-leads  2-researched  3-demo-built  4-checked  5-approved  6-pitched  7-qualified  8-won  9-lost
```

Inside each: `lead.json`, `research/` (their downloaded logo, photos, reels),
`site/index.html` (their website as a real file), `build.json` (template, live
demo link, demo login) and `history.md`. Open `pipeline/index.html` for the board.

```powershell
.venv\Scripts\python -m agents.pipeline add samples\leads\glow-lab-nails.json   # what EDITH will do
.venv\Scripts\python -m agents.mark work                                           # research + build every new lead
.venv\Scripts\python -m agents.pipeline move glow-lab-nails-dubai approved         # you, after checking it
.venv\Scripts\python -m agents.pipeline list
```

MARK's research reads their social media, because our leads have no website.
`MARK_RESEARCH=sample` (default) uses saved samples. `MARK_RESEARCH=chrome` runs
Claude Code on Sonnet in your own logged-in Chrome through the Claude in Chrome
extension, at a human pace, capped at 25 businesses a day (`RESEARCH_DAILY_CAP`).
Needs `claude` logged in and the extension installed. Then MARK takes their logo,
colours (from the logo and photos, in code), best photos and best reel, picks a
template, writes the words, uploads the media and builds the demo.

## MARK's brains

Tried in order until one works. Set the order with `MARK_BRAINS`.

| Brain | Needs | Cost |
|---|---|---|
| `haiku` | `ANTHROPIC_API_KEY` | about a fifth of a cent per demo |
| `deepseek` | `DEEPSEEK_API_KEY` | similar |
| `codex` | Codex CLI logged in | free on your ChatGPT plan, slower |
| `claude` | Claude Code CLI logged in | free on your Claude plan, slower |

## Rules built into the code, not just the prompt

- MARK never invents reviews, ratings, phone numbers or addresses. Those come
  from the lead only, in code, after the AI has written.
- Demo logins are never the business's real email.
- Demo sites carry a "demo preview" bar and are hidden from Google.
- Healthcare accounts (dental, medical, dermatology) never store notes on
  bookings or customers, and their booking questions never ask about symptoms,
  so no patient health details end up in the database (HIPAA, GDPR). Clinics
  that must keep bookings in their own system use "external booking" mode.
- Booking questions are fixed per trade. Answers outside those questions are
  thrown away before they reach the database.
- The database itself refuses double bookings, even if eight customers press
  book at the same second (tested).

## Tests

```powershell
cd platform; npm test                              # booking engine + database tests
cd ..; python -m unittest agents.mark.test_mark    # MARK's safety rules
```
