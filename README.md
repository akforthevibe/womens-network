# DD Network website

The website for DD Network, a curated professional network for women in Mumbai, by Decoding Draupadi. Built from "DD Network Website Brief v2: Built on the Field Study". It has a long homepage, a For Companies page and a Privacy page.

Built with Astro (static output) and Tailwind CSS. Deploys on Netlify.

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # writes dist/
npm run check:copy   # zero em dashes, no banned words (run after build, before shipping)
```

On localhost, forms run in demo mode: nothing is sent, and submissions and analytics events are logged to the browser console.

## Where things live

```
src/data/site.ts           Placeholders, links, proof numbers, analytics IDs
src/data/photos.ts         Every photo by slot: alt text, optional caption, Unsplash credit
src/data/hosts.ts          Founding Hosts (amber "Soon" circles until filled)
src/data/voices.ts         Members' voices (section hidden until two real quotes exist)
src/pages/index.astro      Homepage, one component per section in brief order
src/pages/companies.astro  For Companies page (/companies)
src/pages/privacy.astro    Privacy page
src/pages/thanks.astro     Thank-you page (used only when JavaScript is off)
src/components/sections/   Announcement, Nav, Hero, ProofStrip, Problem, ForYou, Pillars,
                           HowItWorks, Hosts, Voices, Circle, Membership, Companies, Faq,
                           Founding, Request, Footer
src/components/ui/         Script word, photo frame, sticker, doodles, form field,
                           soft step, founding notes sign-up
src/scripts/main.ts        Announcement dismiss, menu, sticky bar, reveals, deep links,
                           forms, analytics
src/styles/global.css      Tailwind config (eight colour tokens, two fonts) and the design system
netlify/functions/         submission-created: forwards entries to Airtable / Beehiiv
scripts/og.mjs             Builds the Open Graph image and favicons (npm run og)
scripts/subset-fonts.sh    Builds the trimmed font files in public/fonts
scripts/check-copy.mjs     The em dash and banned-word check
```

## Placeholders to fill

Most live in `src/data/site.ts` and show on the page in [brackets] until filled.

| Placeholder | Where |
|---|---|
| Founding intake close date `[date]` | Announcement bar, final band |
| Proof numbers `[7,000+]`, `[4]`, `[X]`, `[press]` | Proof strip. They must be real. |
| Welcome dinner timing `[3 weeks]` | How it works |
| Circle opening `[early 2027]` | Circle section, Circle card |
| Reply times `[7 days]`, `[3 working days]` | Request section and thank-you messages, companies thank-you |
| Refund policy | Last FAQ answer. Needed before launch. |
| WhatsApp community link `[link]` | Hero, soft step, thank-you state |
| Contact email, Instagram, LinkedIn | Footer, privacy page |
| Newsletter tool `[Substack or Beehiiv]` | See Forms |
| Founding Host names, roles, photos | `src/data/hosts.ts`. Real portraits only, never stock faces. |
| Member and host quotes | `src/data/voices.ts`. The section appears once two are real. |
| A real visibility example | `visibilityExample` in `site.ts`; the line appears once set |
| Company seat prices `₹[25,000]`, `₹[65,000]` | `src/pages/companies.astro` |
| Instalment amounts | Not shown yet; add to the Member card note once set |
| Prices ₹25,000 Member, ₹65,000 Circle | `Membership.astro`, hero line, comparison table |
| Site URL | `site` in `astro.config.mjs`; used for canonical and OG URLs |

## Fonts

The brief prefers the licensed Jolicia Type faces Moonlith (sans) and February (script). Until those files are provided, the site uses the free fallbacks Figtree and Mrs Saint Delafield, self-hosted from `@fontsource` and trimmed by `scripts/subset-fonts.sh`. Both font stacks in `global.css` already list Moonlith and February first. To switch, add the licensed woff2 files to `public/fonts` and point the `@font-face` rules at them.

The trimmed fonts total about 30 KB, and both are preloaded so headlines don't shift when they load. Re-run the script (needs `pip install fonttools brotli`) after changing the font sources.

## Photos

Each slot in `src/data/photos.ts` takes an Unsplash photo id or any image URL (`src`), alt text, an optional `caption` (name and role, for real members and hosts) and a credit. Every photo gets the same treatment: black and white, framed, a colour block behind, WebP with a responsive srcset, lazy-loaded below the hero.

**Before launch:** the interim Unsplash photos were picked without being able to view them. Check each one on a deploy preview against the brief's rules: South Asian women preferred, and no laptops, handshakes, posed groups or pink-washed shots. Two credits still read `[photographer]`. Swap in real DD photos as soon as they exist.

## Forms

All forms use **Netlify Forms** and appear in the Netlify dashboard after the first deploy.

- **invite**: two steps. Hidden fields record which button opened it (`source`) and any UTM parameters. `?interest=member`, `circle`, `host` or `company` preselects "I'm interested in". The Hosts link and the Circle buttons use these.
- **companies** (on /companies): company, name, work email, role, seats, product.
- **newsletter**: the founding notes, email only.
- Spam: honeypot field, no captcha.

Set up in Netlify:

1. **Form detection** must be on (Forms > Enable form detection), then redeploy.
2. **Email notification**: Forms > Form notifications > Email, for `invite` and `companies`, to the DD contact address.
3. **Airtable** (optional): set `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID`, plus `AIRTABLE_TABLE` (default "Applications") and `AIRTABLE_COMPANIES_TABLE` (default "Companies"). Column names are in `netlify/functions/submission-created.mjs`.
4. **Newsletter**: on Beehiiv, set `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID`. Substack has no subscribe API, so on Substack export the `newsletter` entries from Netlify and import them.

## Analytics

Set `plausibleDomain` and/or `ga4Id` in `src/data/site.ts`. Events:

| Event | When |
|---|---|
| Request invite click | Any button to the form, with `section` and `label` |
| Form step 1 complete | Step 1 passes validation |
| Form submitted | Invite request sent, with `source` and `interest` |
| Circle waitlist click | Either "Join the Circle waitlist" button |
| Companies click | "Sponsor a seat" or "Talk to us about seats" |
| Companies form submitted | Seats enquiry sent |
| Free DD community click | Any WhatsApp community link |
| Newsletter submitted | Founding notes sign-up |
| FAQ open | A question is opened |

## Open Graph image and favicon

`npm run og` rebuilds `public/og.svg`, `public/og.png` (1200 x 630, plum, with the script and the sticker), `public/favicon.svg`, `favicon-32.png` and `apple-touch-icon.png`.
