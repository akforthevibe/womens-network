# DD Network — Website

Single-page landing site for **DD Network**, the professional relationship network by Decoding Draupadi.

Plain HTML, CSS and JavaScript, with no framework. One tiny build script writes the editable content into `index.html`, so the price, FAQ and hosts are real HTML. That means search engines, link previews and AI tools can all read them, and so can anyone with JavaScript off.

```
index.html             Page structure and editorial copy (content blocks are filled by the build)
assets/js/content.js   ← EDIT THIS: price, benefits, cadence, Founding 50, hosts, founder, photos, links, FAQ, hero
scripts/build.mjs      Writes content.js into index.html:  node scripts/build.mjs
assets/js/render.js    The HTML templates the build uses
assets/css/styles.css  Design system (palette, type, layout)
assets/js/main.js      CTAs, forms, analytics (no need to edit)
assets/img/            Put your own photos here
```

**After editing `content.js`, run `node scripts/build.mjs`** (Node 16+). Netlify runs it automatically on every deploy (see `netlify.toml`). Blocks in `index.html` between `<!--@name-->` and `<!--/@-->` are generated, so edit `content.js` rather than those blocks.

Palette: Demonic Red `#BB2233` · Atomic Orange `#FB8B04` · Autumn White `#FAE3D0` · Firmament Blue `#0C1124` (tokens at the top of `styles.css`).

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

On `localhost`, forms run in **demo mode**: nothing is sent, and the submission and every analytics event are logged to the browser console.

## Editing content (`assets/js/content.js`)

| What | Where in `content.js` |
|---|---|
| Hero headline and copy | `hero` (`<em>` in the headline gives the red italic) |
| Credibility line under the hero | `credibility` |
| Membership price | `membership.tiers[0].price` and `period` (also feeds the hero line and the FAQ) |
| Multiple tiers | add objects to `membership.tiers`; the page switches to side-by-side tiers automatically |
| What's included | `membership.included` |
| "Your year as a member" cadence | `rhythm` |
| Founding places | `founding.total`; set `founding.taken` and `showTaken: true` to show "38 of 50 places left" |
| Founding benefits | `founding.benefits` |
| Founding hosts | `hosts.profiles`: `{ name, role, line, room, photo }`. An empty `name` shows "Announcing soon" |
| Founder | `founder` (bio, photo, LinkedIn); with a photo, the layout becomes portrait + text |
| Section photos | `images.*` (any URL or a local path such as `assets/img/dinner.jpg`) |
| FAQ | `faq` array. `{{price}}` is replaced with the live price |
| CTA links | `links.invite` / `links.newsletter`: leave empty for the built-in forms, or set a URL (e.g. Typeform) |

Photos crop automatically (`object-fit: cover`), so replacing an image never breaks the layout. If an image fails to load, its slot shows a warm tonal block instead of a broken image.

**Note:** the Unsplash photos are starting points only. Replace them with real DD dinners and rooms as soon as you have them.

## Forms

There are two separate conversion paths:

- **Request an invite**: name, email, LinkedIn and what you do, then the two core questions: *what are you trying to make happen next?* and *what could you help another woman with?*
- **The DD Network letter**: name and email.

Every submission also carries:

- `source`: which button opened the form (`hero`, `pricing`, `founding`, `final`, `sticky`, `header`…)
- `utm`: any UTM parameters the visitor arrived with
- `submitted_at` and `page`

`/#invite` and `/#newsletter` open the forms directly, which is useful for Instagram bios and WhatsApp links.

Set the delivery method in `forms.mode`:

1. **Netlify Forms** (`"netlify"`, the default). Deploy on Netlify and the `invite` and `newsletter` forms appear in the Netlify dashboard automatically. Add email notifications or Zapier/Slack from there.
2. **Any endpoint** (`"endpoint"`). Set `forms.inviteEndpoint` and `forms.newsletterEndpoint`. Each submission is POSTed as JSON, so it works with Google Apps Script (to a Google Sheet), Formspree, n8n, Make, Zapier webhooks, Airtable via a webhook, or your own API.

## Analytics

Set `analytics.ga4Id` (Google Analytics 4) and/or `analytics.plausibleDomain`. Events are also pushed to `window.dataLayer` for Google Tag Manager.

| Event | Fires when |
|---|---|
| `page_view` | page loads (with UTM) |
| `cta_click` | any CTA is clicked (`cta`, `location`) |
| `request_invite_click` | a Request an Invite button is clicked (`location`) |
| `newsletter_click` | a newsletter button is clicked (`location`) |
| `see_how_click` | the hero's "See how it works" link is clicked |
| `invite_form_open` / `invite_form_start` | invite form is opened / first typed into |
| `invite_form_submit` | invite request is sent (`source`) |
| `newsletter_signup` | newsletter sign-up is sent (`source`) |
| `pricing_view` | the membership section scrolls into view |
| `section_view` | each section is seen (once per visit) |
| `faq_open` | an FAQ question is opened |
| `invite_form_error` / `newsletter_error` | a submission fails |

CTA conversion = `invite_form_submit ÷ request_invite_click`, broken down by `location`/`source` to see which placement converts best.

## Deploy

- **Netlify:** connect this repo. `netlify.toml` already sets the build command (`node scripts/build.mjs`) and the publish directory (the repo root).
- **Anything else:** run the build, then upload the files. Switch `forms.mode` to `"endpoint"` first.
