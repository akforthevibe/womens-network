# DD Network website

Single-page site for DD Network, a private professional network for women in Mumbai, by Decoding Draupadi.

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
src/data/site.ts           Placeholders, links, analytics IDs
src/data/photos.ts         Every photo by slot, with alt text and photographer credit
src/pages/index.astro      The page, one component per section in brief order
src/pages/privacy.astro    Privacy page
src/pages/thanks.astro     Thank-you page (used only when JavaScript is off)
src/components/sections/   Nav, Hero, ProofStrip, Network, Who, Membership, Founding,
                           Hosts, HouseRules, Faq, Request, Footer
src/components/ui/         Photo frame, highlighted word + squiggle, sparkle, scribble,
                           arrow, sticker, form field, newsletter
src/scripts/main.ts        Menu, sticky bar, reveals, deep links, two-step form, analytics
src/styles/global.css      Tailwind config (colour tokens, fonts) and the design system
netlify/functions/         submission-created: forwards form entries to Airtable / Beehiiv
scripts/og.mjs             Builds the Open Graph image and favicons (npm run og)
scripts/subset-fonts.sh    Builds the trimmed font files in public/fonts
```

## Placeholders to fill

All live in `src/data/site.ts` and show on the page in [brackets] until filled.

| Placeholder | Current value | Notes |
|---|---|---|
| Community size in the proof strip | [7,000+] | Confirm the number to cite |
| Circle opening date | [early 2027] | |
| Founding intake close date | [date] | |
| Reply time on applications | [7 days] | |
| Refund policy | [Refund policy to confirm.] | Needed before launch |
| Contact email | [email] | Footer, privacy page |
| Instagram and LinkedIn URLs | [instagram url], [linkedin url] | Footer |
| Newsletter tool | [Substack or Beehiiv] | See Forms |
| Founding Host names and photos | "Announcing soon" tiles | Edit the `hosts` list in `src/components/sections/Hosts.astro` |
| Prices | ₹18,000 founding, ₹25,000 list, ₹65,000 Circle | In `Membership.astro` |
| Site URL | https://ddnetwork.netlify.app | `site` in `astro.config.mjs`; used for canonical and OG URLs |

## Photos

Each slot in `src/data/photos.ts` takes an Unsplash photo id (or any image URL in `src`), alt text and a credit. Every photo gets the same treatment automatically: black and white, framed, colour block behind, WebP with a responsive srcset, lazy-loaded below the hero.

**Before launch:** look at each photo on the live preview and confirm it fits the brief's rules (candid, ideally South Asian women, no laptops or office stock). Two credits are still `[photographer]`. Then swap in real DD event and host photos as soon as they exist.

## Forms

Both forms use **Netlify Forms** and appear in the Netlify dashboard after the first deploy.

- **invite**: two steps with inline validation. Hidden fields record which button opened it (`source`) and any UTM parameters. Deep links `/?as=host#request` and `/?as=company#request` preselect "Applying as". `/?interest=circle#request` preselects DD Circle.
- **newsletter**: email only.
- Spam: honeypot field, no captcha.

Set up in Netlify:

1. **Email notification**: Site configuration > Forms > Form notifications > Add notification > Email, for the `invite` form, to the DD contact address.
2. **Airtable** (optional): add `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` and `AIRTABLE_TABLE` as environment variables. The `submission-created` function then copies each application into Airtable. Column names are listed in `netlify/functions/submission-created.mjs`.
3. **Newsletter**: on Beehiiv, add `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` and sign-ups are passed straight through. Substack has no subscribe API, so on Substack export the `newsletter` form entries from Netlify and import them.

## Analytics

Set `plausibleDomain` and/or `ga4Id` in `src/data/site.ts`. Events:

| Event | When |
|---|---|
| Request invite click | Any "Request an invite" button, with `section` (nav, hero, membership, founding, sticky-bar) |
| Form step 1 complete | Step 1 passes validation |
| Form submitted | Invite request sent, with `source` and `applying_as` |
| Newsletter submitted | Newsletter sign-up sent |
| Circle waitlist click | "Join the Circle waitlist" |
| Companies email click | "Talk to us" on the companies line |
| FAQ open | A question is opened |

In Plausible, add each event name as a custom goal.

## Fonts

Fraunces, DM Sans and Caveat come from `@fontsource` and are trimmed by `scripts/subset-fonts.sh` (Fraunces pinned at optical size 144 and weights 600 to 800, DM Sans 400 to 500, Caveat to the characters it shows). This takes the fonts from about 310 KB to 90 KB. That is the difference between a Lighthouse mobile performance score in the 80s and one in the high 90s. The output in `public/fonts` is committed. Re-run the script (needs `pip install fonttools brotli`) if you change any Caveat text, since Caveat only has the characters in `CAVEAT_TEXT`.

## Open Graph image and favicon

`npm run og` rebuilds `public/og.svg`, `public/og.png` (1200 x 630), `public/favicon.svg`, `favicon-32.png` and `apple-touch-icon.png`.
