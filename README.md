# DD Network website

The site for DD Network, a curated professional network for women building their next chapter, by Decoding Draupadi. The first chapter is Mumbai.

Built with Astro (static output) and Tailwind CSS. Deploys on Netlify.

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # writes dist/
npm run check:copy   # zero em dashes, no banned words or phrases (run before shipping)
```

On localhost, forms run in demo mode: nothing is sent, and submissions and analytics events are logged to the browser console.

## Pages

| Path | What it is |
|---|---|
| `/` | Homepage, 19 sections in the order set by the brief |
| `/companies` | For companies: seats, how it works, enquiry form |
| `/privacy` | Privacy page (needs legal review before launch) |
| `/thanks`, `/thanks/notes`, `/companies/thanks` | Confirmation pages, used only when JavaScript is off |

## Where things live

```
src/data/site.ts          Title, SEO, links, contact, analytics IDs, navigation
src/data/content.ts       Repeating copy: proof, fit, pillars, steps, hosts, voices,
                          membership features, comparison table, FAQ, Founding 50, company seats
src/data/photos.ts        Every photo by slot, with alt text and credit
src/pages/                index, companies, privacy, thanks
src/components/           One component per section, plus ScriptHeading, PhotoFrame,
                          Sticker, Doodle, Arrow, Field, Logo
src/scripts/main.ts       Announcement, menu, sticky CTA, reveals, deep links, forms, analytics
src/styles/global.css     Colour tokens, type scale, buttons, photo treatment, motion, forms
netlify/functions/        submission-created: forwards entries to Airtable / Beehiiv
scripts/og.mjs            Builds the Open Graph image and favicons (npm run og)
scripts/subset-fonts.sh   Builds the trimmed font files in public/fonts
scripts/check-copy.mjs    Em dash and banned word check
```

## Before launch

**Photographs.** There are no real DD photographs in the repository yet, so every slot uses an Unsplash stand-in, shown in black and white. Swap each slot in `src/data/photos.ts` for a real DD photograph (put the URL in `src`). Each slot carries `finalAlt`, the alt text from the brief for the real photo: move it into `alt` when the real photo goes in. The hero should be 8 to 10 women around a dinner table, faces visible, actually talking.

**Founding Hosts.** `hosts` in `src/data/content.ts` is empty, so six "Coming soon" frames show. Add confirmed hosts only (name, role, company, photo). Never invent names.

**Member voices.** `voices` in `src/data/content.ts` is empty, so the section is hidden. Add real quotes only, 35 to 45 words each, up to three.

**Links and contact.** In `src/data/site.ts`, fill `contactEmail`, `links.community` (the free DD community), `links.instagram` and `links.linkedin`. Until then they render as `#`.

**Site URL.** `site` in `astro.config.mjs` (used for canonical and OG URLs).

**Privacy.** `/privacy` covers what the brief lists, but needs proper legal review.

## Fonts

The brief prefers Moonlith (main) and February (script). Neither is on a free licence, so the site uses the brief's fallbacks: **Figtree** and **Mrs Saint Delafield**, self-hosted and trimmed by `scripts/subset-fonts.sh` to about 22 KB in total. Both preferred names are already first in the font stacks in `global.css`. To switch, add licensed `.woff2` files to `public/fonts` with matching `@font-face` rules.

The script file only carries the characters it needs. Re-run `bash scripts/subset-fonts.sh` (needs `pip install fonttools brotli`) after changing which words are set in script.

## Forms

All forms use **Netlify Forms** and appear in the Netlify dashboard after the first deploy.

- **invite**: two steps, inline validation, no page reload, success state in place. Hidden fields record which button opened it (`source`) and any UTM parameters. Deep links: `/?interest=circle#request`, `/?as=host#request`, `/?as=company#request` preselect the interest.
- **notes**: founding notes sign-up, email only.
- **companies**: on `/companies`. `/companies?seat=network#talk` and `?seat=circle#talk` preselect the interest.
- Spam: honeypot field, no captcha.

Set up in Netlify:

1. **Email notification**: Site configuration > Forms > Form notifications, for `invite` and `companies`, to the DD contact address.
2. **Airtable** (optional): add `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` and `AIRTABLE_TABLE`. The `submission-created` function then copies each application into Airtable. Column names are in `netlify/functions/submission-created.mjs`.
3. **Founding notes**: on Beehiiv, add `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` and sign-ups are passed straight through. On Substack, export the `notes` form entries from Netlify and import them.

## Analytics

Set `plausibleDomain` and/or `ga4Id` in `src/data/site.ts`. Events:

| Event | When |
|---|---|
| Application started | First focus in the invite form |
| Step one complete | Step one passes validation |
| Step two complete | Step two passes validation |
| Application submitted | Invite request sent |
| Request invite click | Any "Request an invite" link, with `section` |
| Circle waitlist click | "Join the Circle waitlist" |
| Community click | "Join the free DD community" |
| Companies click | Company links on the homepage |
| Company enquiry submitted | `/companies` form sent |
| Founding notes submitted | Founding notes sign-up sent |
| FAQ open | A question is opened |

In Plausible, add each event name as a custom goal.

## Open Graph image and favicon

`npm run og` rebuilds `public/og.svg`, `public/og.png` (1200 x 630), `public/favicon.svg`, `favicon-32.png` and `apple-touch-icon.png`.
