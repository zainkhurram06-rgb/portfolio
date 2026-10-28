# Prompts for Cowork

Two jobs. Paste each one into Cowork as its own task. Both save files into
`C:\Users\zaink\portfolio\jarvis-agents`, which the agents read automatically.

---

## Job 1: training research for the agents

```
You are doing research to train five AI agents for a small agency that builds
websites for local businesses that don't have one (salons, barbers, dental and
medical clinics, skin clinics, car washes, mechanics, plumbers and electricians).
The agents are: FRIDAY (makes short cold calls to business owners to offer a free
demo website), MARK (builds the website), EDITH (finds the businesses) and HAPPY
(checks website quality).

Save everything in this folder:  C:\Users\zaink\portfolio\jarvis-agents\training
Create it if it doesn't exist. Use exactly the file names and JSON shapes below,
because the agents load these files automatically. Valid JSON only.

RULES FOR ALL OF IT
- Write everything in your own words. Never copy transcripts, articles or scripts.
  A quote may be at most 15 words, and only when the exact wording matters.
- Every item gets a "source": the page or video title and its URL.
- Do not log in to anything, sign up for anything, buy anything, comment, like or
  message anyone. Read and watch only.
- Skip any tactic that relies on lying, fake urgency, fake scarcity, pretending to
  be human, or pressuring someone who said no. FRIDAY always says she's an AI and
  always stops when asked. Put those tactics in friday/do-not.json instead, so she
  knows what to avoid.
- No em dashes or en dashes anywhere. Use commas or full stops.
- Keep a log of what you looked at in training/cowork-log.md (one line per source).

PART A: FRIDAY, the sales caller (most important, spend most of your time here)
Watch cold-calling videos on YouTube. Start with Saad Sells (search "Saad sells
cold call"), then other well-known B2B cold calling trainers, and real recorded
cold calls to small local businesses (agencies calling salons, restaurants,
contractors). Study at least 15 videos. Focus on calls to small business owners,
not big corporate sales. Then write:

1. training/friday/techniques.json
   [{"name": "short name", "what": "what it is, 1-2 sentences",
     "how_friday_uses_it": "how an AI caller offering a free demo website would use it",
     "example_line": "one line she could say, your own words, max 25 words",
     "source": "title + URL"}]
   Aim for 25 or more. Cover: the first 10 seconds, getting past "who is this?",
   reaching the owner, pattern interrupts that are honest, asking permission,
   giving a reason for the call, earning 30 more seconds, questions that get the
   owner talking, tone and pace, handling silence, confirming next steps, ending
   well.

2. training/friday/objections.json
   [{"objection": "what the owner says", "trade": "any" or one of salon, dental,
     medical, dermatology, carwash, autorepair, homeservices,
     "response": "what FRIDAY says, max 2 short sentences, honest, your own words",
     "why_it_works": "1 sentence", "source": "title + URL"}]
   Aim for 40 or more. Must include: not interested, I'm busy, send me an email,
   how did you get my number, is this a robot / are you AI, I already have
   Instagram, I use Fresha or Booksy or Treatwell, I had a website before and it
   did nothing, my nephew does websites, how much is it, what's the catch, I get
   enough customers, call back later, the owner isn't here, we're a franchise,
   I don't trust online stuff, my customers are all walk-ins, I can't afford it.

3. training/friday/openers.json
   [{"line": "an opening line, your own words, max 25 words, must say she's an AI
     assistant", "when": "when it fits", "source": "title + URL"}]
   Aim for 12.

4. training/friday/trade-pains.json
   [{"trade": "one of the trades above", "pain": "a real problem owners in this
     trade have, that a website with online booking helps",
     "how_a_website_helps": "1 sentence", "source": "title + URL"}]
   Aim for 4 per trade. Use owner forums, Reddit threads and trade articles.

5. training/friday/do-not.json
   [{"tactic": "name", "why_not": "1 sentence", "source": "title + URL"}]

6. training/friday/notes.md
   Half a page: the 10 most important lessons, in plain language.

PART B: MARK, the website builder
For each trade, look at 5 of the best real websites of small independent
businesses in that trade (not big chains), in the US, UK, UAE or Australia.
Write training/mark/<trade>.json for each of: salon, barber, dental, medical,
dermatology, carwash, autorepair, homeservices:
   {"trade": "...",
    "must_have_sections": ["..."],
    "what_customers_look_for": ["the things that make someone book, in order"],
    "headline_patterns": ["the shape of strong headlines, your own words, e.g.
      'promise + place: Calm dentistry in Marina'"],
    "words_that_work": ["short words and phrases these sites use a lot"],
    "photo_tips": ["what photos the best sites show"],
    "booking_questions": ["what they ask when someone books"],
    "mistakes": ["things weak sites in this trade get wrong"],
    "sources": ["title + URL", "..."]}

PART C: EDITH, the lead finder
training/edith/signals.json:
   {"by_country": [{"country": "AE", "platforms_owners_use": ["Instagram",
     "WhatsApp", "..."], "notes": "1-2 sentences"}],
    "good_lead_signs": ["..."], "skip_signs": ["e.g. part of a chain or franchise"],
    "sources": ["..."]}
   Cover AE, US, GB, AU, CA, SA, IN, PK.

PART D: HAPPY, the quality checker
training/happy/checklist.json:
   [{"rule": "short", "why": "1 sentence", "how_to_check": "what to look at",
     "level": "block" or "warn", "source": "title + URL"}]
   25 or more, from Google's guidance on page speed and mobile pages, accessibility
   basics (WCAG), and what makes small business sites convert.

When you're done, write training/README.md: what you made, how many items in
each file, and anything you weren't sure about.
```

---

## Job 2: Google key for EDITH (about 10 minutes)

EDITH searches Google Maps through Google's official Places API. Google asks for
a billing account even for the free allowance. **You add the card yourself.**
Cowork stops and hands over at that step.

```
In Chrome, I'm signed in to my Google account. Set up a Google Cloud API key for
the Places API (New). Go slowly and tell me what you're doing at each step.

1. Go to console.cloud.google.com. Create a new project called "jarvis-edith".
2. Go to Billing. If the project has no billing account linked, STOP and tell me.
   I will add the billing account and card myself. Never type any payment details.
   Wait until I say it's done.
3. In APIs & Services, Library, find "Places API (New)" and enable it for the
   jarvis-edith project. Only that one.
4. In APIs & Services, Credentials, create an API key. Edit it:
   name "edith-places", API restrictions: restrict key to "Places API (New)" only.
   Save.
5. In Billing, Budgets & alerts, create a budget for the jarvis-edith project:
   amount 10 US dollars a month, alerts at 50%, 90% and 100%, emailed to me.
6. Open the file C:\Users\zaink\portfolio\jarvis-agents\.env in Notepad (create it
   if it doesn't exist) and add this line with the key:
       GOOGLE_PLACES_KEY=the-key-you-created
   Save the file. Don't paste the key anywhere else, not in chat, not in any
   other file or website.
7. Tell me it's done. Don't tell me the key.
```

After that, EDITH's first real run (PowerShell, in `C:\Users\zaink\portfolio\jarvis-agents`):

```
$env:EDITH_PLACES = "live"; .venv\Scripts\python -m agents.edith find --niche salon --city Dubai --country AE
```

She stays inside Google's free allowance unless you switch `stay_in_free_allowance`
off in `agents/edith/rules.json`.
