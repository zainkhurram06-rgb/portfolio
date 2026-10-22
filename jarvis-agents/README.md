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
  src/themes/      website designs (clinic, homeservices, salon). add more here
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

You need Node.js 22+, Python 3.11+, and PostgreSQL 16 (or a free Supabase or
Neon database instead of installing Postgres).

```powershell
# 1. the platform
cd jarvis-agents\platform
npm install
copy .env.example .env.local      # then edit DATABASE_URL and INTERNAL_API_TOKEN
npm run db:migrate
npm run seed                      # three example businesses
npm run dev                       # http://localhost:3000/admin
```

Example sites: `http://localhost:3000/s/luna-hair-studio`, `/s/harbour-dental`,
`/s/coastline-plumbing`. Dashboard logins: `owner@luna.example`,
`owner@harbour.example`, `owner@coastline.example`, password `demo-password`.

```powershell
# 2. MARK, in a second window
cd jarvis-agents
pip install -r requirements.txt
$env:INTERNAL_API_TOKEN = "the same token as in .env.local"
$env:ANTHROPIC_API_KEY  = "sk-ant-..."          # or DEEPSEEK_API_KEY, or neither if codex is installed
python -m agents.mark demo --name "Bright Smile Dental" --niche clinic --country GB --city Leeds --phone "+44 113 555 0101"
```

MARK prints the demo's website link and a demo dashboard login.

Test MARK with no AI and no cost:

```powershell
python -m agents.mark demo --lead samples\lead-madrid-salon.json --brains file:samples\plan-madrid-salon.json --label-brains file:samples\labels-es.json
```

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
- Clinic accounts never store notes on bookings or customers, so no patient
  health details end up in the database (HIPAA, GDPR). Clinics that must keep
  bookings in their own system use "external booking" mode.
- The database itself refuses double bookings, even if two customers press
  book at the same second.

## Tests

```powershell
cd platform; npm test                              # booking engine + database tests
cd ..; python -m unittest agents.mark.test_mark    # MARK's safety rules
```
