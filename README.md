# DD Network — website

The single-page site for **DD Network** by Decoding Draupadi: the front door to the network, with two ways in (**Request an Invite** and **Join the Newsletter**).

Plain HTML, CSS and JavaScript. There's no build step or framework, so it deploys anywhere that serves static files (Netlify, Vercel, GitHub Pages, S3).

```
index.html              page structure and long-form copy
assets/js/config.js     ← everything you'll want to edit (see below)
assets/js/main.js       rendering, forms, analytics
assets/css/styles.css   design system and layout
assets/img/             favicon, social share image, your photography
```

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000.

## Editing content (`assets/js/config.js`)

| What | Where in config |
| --- | --- |
| Hero headline, intro, meta line, hero image | `hero` |
| Price, period, optional quarterly price, benefits | `pricing.tiers` |
| Founding-rate note | `pricing.lockNote` |
| Founding cohort size, member portraits, benefits | `founding` |
| Founding hosts (name, role, quote, photo) | `hosts.people` |
| Founder name, title, bio, photo | `founder` |
| Other photography | `images` |
| FAQ | `faq` (`{price}` is replaced with the live price) |
| CTA links and labels | `cta` |
| Form destinations and thank-you messages | `forms` |
| Analytics IDs | `analytics` |

**Pricing.** Change `amount` and the price updates everywhere, including the FAQ. Add a second or third object to `tiers` and the section switches to a side-by-side layout with the heading "One network. Different levels of access." Use `difference` to say in one line why each tier exists.

**Founding members.** As people join, add `{ name, role, photo }` to `founding.members` and their seat turns into a portrait. The next open seat is highlighted automatically. Set `showCount: true` to display "x of 50 founding seats taken".

**Hosts.** A host with an empty `name` shows as an "Announcing soon" placeholder. Fill in a name and photo to reveal them.

**Images.** Every image sits in a fixed-ratio slot and is cropped to fit, so you can swap any image without touching the layout. If an image fails to load, a warm tonal block shows in its place. Before launch, it's best to download the chosen Unsplash photos into `assets/img/` and point the config at the local files.

The longer section copy (the value section, how it works, the rooms and so on) is in `index.html`. Each section is clearly commented.

## Forms

Both forms are on the page in the `#invite` section:

- **Invite:** name, email, LinkedIn, what you do, what you're hoping to make happen next, and an optional question about what you could help with.
- **Newsletter:** name and email.

Each form is independent; signing up for the newsletter is never required.

Set `forms.invite.endpoint` and `forms.newsletter.endpoint` to one of the following:

- `""`: **demo mode** (the current setting). Nothing is sent, and a warning is logged to the console.
- `"netlify"`: Netlify Forms. The markup already includes `data-netlify` and a honeypot field.
- **Any URL**: the form is sent as a urlencoded POST. This works with Formspree, Getform, Basin, Zapier/Make webhooks, or a Google Apps Script web app that writes to a Google Sheet.

Every submission also includes `utm_source`, `utm_medium`, `utm_campaign`, `referrer` and `page`. Tag your Instagram and WhatsApp links with UTMs (for example `?utm_source=instagram`) to see which channel brings applicants.

## Analytics

Set `analytics.ga4Id` (GA4) and/or `analytics.plausibleDomain`. Every event is also pushed to `window.dataLayer`, so Google Tag Manager works too.

| Event | When it fires |
| --- | --- |
| `page_view_dd` (plus GA/Plausible's own pageview) | Page load |
| `request_invite_click` `{location}` | Any Request an Invite CTA (header, hero, sticky, pricing) |
| `newsletter_click` `{location}` | Any newsletter CTA |
| `invite_form_start` / `newsletter_form_start` | First interaction with a form |
| `invite_submit` | Invite form submitted successfully |
| `newsletter_signup` | Newsletter form submitted successfully |
| `pricing_view` | Membership section on screen for about one second |
| `section_view` `{section}` | Each section on screen for about one second (shows scroll depth) |
| `faq_open` `{question}` | An FAQ is opened |
| `form_error` | A submission failed |

**CTA conversion** is `invite_submit ÷ request_invite_click`, which you can break down by `location`. Set `analytics.debug: true` to log every event to the console.
