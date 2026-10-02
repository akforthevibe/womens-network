# DD Network: website

A single-page site for **DD Network**, a curated professional network for women by Decoding Draupadi. It also has a privacy page and a fallback thank-you page.

It is plain HTML, CSS and JavaScript with no framework. A small build script writes the values still to be confirmed (prices, seats, dates, email) into the HTML, so they're real text that search engines and link previews can read.

```
index.html                         The page: structure and final copy
privacy.html                       Privacy note (DPDP Act, plain language)
thank-you.html                     Only shown if a form is sent with JavaScript off
assets/js/content.js               ← EDIT THIS: placeholders, hosts, links, analytics, photos
assets/css/styles.css              Design system (tokens at the top)
assets/js/main.js                  Nav, two-step form, validation, UTM capture, analytics
assets/js/render.js                Templates the build uses
scripts/build.mjs                  Writes content.js into the HTML:   npm run build
scripts/images.mjs                 Fetches and treats the Unsplash photos:  npm run images
netlify/functions/submission-created.mjs   Sends form entries to Airtable / Beehiiv
```

## Quick start

```bash
npm install          # only needed for the image script (sharp)
npm run images       # download photos → assets/img/*.webp and og.jpg (needs internet)
npm run build        # write content.js values into the HTML
npm run serve        # http://localhost:8000
```

On `localhost`, forms run in **demo mode**: nothing is sent, and each submission and analytics event is logged to the browser console.

Generated blocks in the HTML sit between `<!--@name-->` and `<!--/@-->`. Edit `content.js`, not those blocks.

## Placeholders to confirm

All of these live in `placeholders` in `assets/js/content.js`. To see every placeholder highlighted on the page, add **`?placeholders`** to the URL (e.g. `https://ddnetwork.in/?placeholders`).

| Key | Current value | Notes |
|---|---|---|
| `foundingSeats` | 50 | Plan says 40–50 |
| `memberPrice` / `memberUsualPrice` / `memberQuarterly` | 12,000 / 18,000 / 3,500 | Final after the waitlist price test |
| `circlePrice` / `circleOpening` | 40,000 / early 2027 | Plan range ₹30–50k |
| `hostCount` | 10–15 | |
| `intakeClose` | *(empty)* | Empty shows "Intake closes when seats are filled." |
| `replyDays` | 7 | |
| `refundDays` | 90 | **The refund policy still needs a decision** (FAQ: "What if it isn't useful for me?") |
| `communitySize` | 7,000+ | |
| `contactEmail` | hello@decodingdraupadi.com | **Placeholder, please confirm** |
| `domain` | ddnetwork.in | **Placeholder.** Used for the canonical URL and share image |

Also confirm the links in `links` (Decoding Draupadi, Draupadi on the Dais, Instagram, LinkedIn).

**Founding Hosts:** add `{ name, title }` objects to `hosts`. The row of names stays hidden while the list is empty.

## Photos

The five photo slots (hero, paying for, hosts, who it's for, sign-up) are set in `images` in `content.js` as Unsplash photo ids. `npm run images`:

- downloads each one (with `UNSPLASH_ACCESS_KEY` set, through the official API, which also credits the download to the photographer),
- crops it to the slot's shape, focusing on the most interesting area,
- applies the one house treatment (warm, slightly desaturated colour),
- writes WebP files at 640, 1000 and 1600px wide, plus the 1200×630 share image `og.jpg` (hero photo + headline) and `apple-touch-icon.png`.

Commit the files in `assets/img/` afterwards. Netlify also runs the script on deploy, and it only fetches photos that are missing. Everything below the hero lazy-loads. Until a photo exists, its slot shows a plain warm tone, never a broken image.

**The current ids are first picks chosen from search results. They have not been checked by eye** (the build machine couldn't reach Unsplash). Look at each one against the brief: candid, warm, faces not the focus unless South Asian women, and no handshakes, laptops or posed groups. Swap any that miss. Credits update in the footer automatically, but check that each `credit` name matches the photographer.

## Forms and where submissions go

There are two forms, both handled by **Netlify Forms**, with a honeypot field for spam (no visible captcha):

- **`invite`**: two steps on screen (About you → What you're working on), with inline errors in plain words. Answers stay in place if sending fails. Each submission also records `cta_location` (which button she clicked), the `utm_*` parameters (kept for the visit even if she lands on another URL first), `referrer` and `submitted_at`.
- **`newsletter`**: email plus an optional first name. It appears in the sign-up section and again in the thank-you state (hidden if she has already subscribed).

Netlify then runs `netlify/functions/submission-created.mjs`, which:

- adds each application as a row in **Airtable** (table `Applications`), and
- adds newsletter sign-ups to **Beehiiv** if it is configured, and always as a row in the Airtable table `Newsletter` (so they can be imported into Substack, which has no public API).

Set these in Netlify → Site configuration → Environment variables: `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, and optionally `AIRTABLE_INVITES_TABLE`, `AIRTABLE_NEWSLETTER_TABLE`, `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID`. Create the Airtable columns with the names used in the function (or let `typecast` create select options). Every submission is also kept in the Netlify dashboard, so nothing is lost if Airtable is down.

**Email notification:** Netlify → Forms → Form notifications → add an email notification for the `invite` form.

**Deep links** (useful for Instagram bios and WhatsApp):
- `/#request` opens the sign-up section
- `/?as=host#request` opens it with **Founding Host** pre-selected (the Hosts section link does the same)
- `/?plan=circle#request` opens it with **Circle waitlist** pre-selected

## Analytics

Set `analytics.ga4Id` and/or `analytics.plausibleDomain` in `content.js`. Events also go to `window.dataLayer` for Google Tag Manager.

| Event | When |
|---|---|
| `request_invite_click` | any Request an invite button; `location` = nav, hero, tier_member, founding, hosts, sticky |
| `invite_step1_complete` | step 1 of the form passes validation |
| `invite_submitted` | an application is sent (`location`, `applying_as`) |
| `newsletter_submitted` | a newsletter sign-up is sent (`location`) |
| `newsletter_click` | a "Get the newsletter" link is clicked |
| `circle_waitlist_click` | "Join the Circle waitlist" |
| `companies_email_click` | "Get in touch" on DD for Companies |
| `pricing_view`, `faq_open`, `invite_error`, `newsletter_error` | as named |

## Design

Off-white `#F7F4EF`, near-black `#1C1A19` (also used for the dark Founding band), and one accent, terracotta `#8C3B2A`. A lighter tint of the same hue is used for small text on the dark band so it meets AA contrast. Headlines use Fraunces and body text uses Inter. The layout is a 12-column grid with a 1,120px maximum width. Sections are separated by space and 1px rules, and only the pricing tiers are cards. Motion is a 280ms fade-up, switched off when the visitor prefers reduced motion. The layout was checked at 375, 768 and 1,440px.

## Launch checklist

- [ ] Design approved (desktop and mobile)
- [ ] Placeholders confirmed (table above), refund policy decided
- [ ] Photos checked by eye, `npm run images` run, `assets/img` committed
- [ ] Airtable env vars set; email notification on; both forms tested end to end on the live site
- [ ] Newsletter tool connected (Beehiiv keys, or Substack import from Airtable)
- [ ] GA4 or Plausible set; events checked in real time
- [ ] Real-phone check (Instagram and WhatsApp in-app browsers)
- [ ] Domain connected and HTTPS on; `domain` set in content.js
- [ ] Lighthouse mobile run (target 90+)
