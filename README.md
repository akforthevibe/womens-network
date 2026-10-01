# DD Network — Website

Single-page landing site for **DD Network**, the professional relationship network by Decoding Draupadi.

Plain HTML, CSS and JavaScript. No framework, no build step, so it can be hosted anywhere (Netlify, Vercel, GitHub Pages, any static host).

```
index.html            Page structure and editorial copy
assets/js/content.js  ← EDIT THIS: prices, benefits, hosts, photos, links, FAQ, hero
assets/css/styles.css Design system (colours, type, layout)
assets/js/main.js     Rendering, CTAs, forms, analytics (no need to edit)
assets/img/           Put your own photos here
```

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

On `localhost`, forms run in **demo mode**: nothing is sent, and the submission and every analytics event are logged to the browser console.

## Editing content (`assets/js/content.js`)

| What | Where in `content.js` |
|---|---|
| Hero headline and copy | `hero` (`<em>` in the headline gives the maroon italic) |
| Hero photo | `hero.image` |
| Membership price | `membership.tiers[0].price`, plus `period`, `altPrice` (quarterly) |
| Hide the price | `membership.showPrices: false` |
| Multiple tiers | add objects to `membership.tiers`; the page switches to side-by-side tiers automatically |
| Benefits list | `membership.included` |
| Founding member count | `founding.total` (default 50) |
| Add a founding member | push `{ name, role, photo }` into `founding.members`; their slot fills in |
| Show "12 of 50 taken" | `founding.showCount: true` |
| Founding hosts | `hosts.profiles`: `{ name, role, line, photo }`. An empty `name` shows "To be announced" |
| Founder | `founder` (bio, photo, LinkedIn) |
| Section photos | `images.*` (any URL or a local path such as `assets/img/dinner.jpg`) |
| FAQ | `faq` array. `{{price}}` is replaced with the live price |
| CTA links | `links.invite` / `links.newsletter`: leave empty for the built-in forms, or set a URL (e.g. Typeform) |

Photos crop automatically (`object-fit: cover`), so replacing an image never breaks the layout. If an image fails to load, its slot shows a warm tonal placeholder instead of a broken image.

**Note:** the Unsplash photos are starting points only. Replace them with real DD dinners and rooms as soon as you have them.

## Forms

There are two separate conversion paths:

- **Request an Invite**: name, email, LinkedIn, what you do, what you're hoping to make happen, and an optional question on what you could help another woman with.
- **Join the Newsletter**: name and email.

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
| `invite_form_open` / `invite_form_start` | invite form is opened / first typed into |
| `invite_form_submit` | invite request is sent (`source`) |
| `newsletter_signup` | newsletter sign-up is sent (`source`) |
| `pricing_view` | the membership section scrolls into view |
| `section_view` | each section is seen (once per visit) |
| `faq_open` | an FAQ question is opened |
| `invite_form_error` / `newsletter_error` | a submission fails |

CTA conversion = `invite_form_submit ÷ request_invite_click`, broken down by `location`/`source` to see which placement converts best.

## Deploy

- **Netlify:** drag the folder into Netlify, or connect this repo. There's no build command, and the publish directory is the repo root.
- **Anything else:** upload the files as they are. Switch `forms.mode` to `"endpoint"` first.
