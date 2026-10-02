/* ==========================================================================
   DD NETWORK: templates used by scripts/build.mjs
   Generated blocks in the HTML look like  <!--@name-->…<!--/@-->
   and are rewritten from assets/js/content.js on every build.
   ========================================================================== */
"use strict";

// Photo slots: aspect ratio [w, h] and the `sizes` hint for the browser.
const SLOTS = {
  hero:    { ratio: [4, 5],  sizes: "(min-width: 960px) 520px, 100vw", eager: true },
  paying:  { ratio: [4, 5],  sizes: "(min-width: 960px) 420px, 100vw" },
  hosts:   { ratio: [4, 5],  sizes: "(min-width: 960px) 460px, 100vw" },
  who:     { ratio: [16, 9], sizes: "(min-width: 1120px) 1120px, 100vw" },
  request: { ratio: [4, 5],  sizes: "(min-width: 960px) 360px, 100vw" }
};
const WIDTHS = [640, 1000, 1600];

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function image(key, C) {
  const img = (C.images || {})[key];
  const slot = SLOTS[key];
  if (!img || !slot) return "";
  const [w, h] = slot.ratio;
  const src = (width) => `assets/img/${key}-${width}.webp`;
  const srcset = WIDTHS.map((width) => `${src(width)} ${width}w`).join(", ");
  const loading = slot.eager ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<img src="${src(1000)}" srcset="${srcset}" sizes="${slot.sizes}" width="${w * 200}" height="${h * 200}" alt="${esc(img.alt)}" ${loading} decoding="async">`;
}

function mail(C) {
  return (C.placeholders || {}).contactEmail || "";
}

const blocks = {
  config(C) {
    const P = C.placeholders || {};
    const data = { analytics: C.analytics || {}, contactEmail: P.contactEmail || "", replyDays: P.replyDays || "7" };
    return `<script id="dd-config" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
  },

  meta(C) {
    const domain = (C.placeholders || {}).domain;
    if (!domain) return "";
    const url = `https://${domain}/`;
    return [
      `<link rel="canonical" href="${esc(url)}">`,
      `<meta property="og:url" content="${esc(url)}">`,
      `<meta property="og:image" content="${esc(url)}assets/img/og.jpg">`,
      `<meta name="twitter:image" content="${esc(url)}assets/img/og.jpg">`
    ].join("\n  ");
  },

  intakeLine(C) {
    const d = (C.placeholders || {}).intakeClose;
    return d
      ? `Intake closes <span class="ph">${esc(d)}</span> or when seats are filled.`
      : `Intake closes when seats are filled.`;
  },

  hosts(C) {
    const list = (C.hosts || []).filter((h) => h && h.name);
    if (!list.length) return "";
    return `<ul class="host-names" aria-label="Founding Hosts">${list
      .map((h) => `<li><span class="host-name">${esc(h.name)}</span><span class="host-title">${esc(h.title)}</span></li>`)
      .join("")}</ul>`;
  },

  companiesButton(C) {
    const m = mail(C);
    const href = `mailto:${m}?subject=${encodeURIComponent("DD for Companies")}`;
    return `<a class="btn btn-outline" href="${esc(href)}" data-event="companies_email_click">Get in touch</a>`;
  },

  contactLink(C) {
    const m = mail(C);
    return `<a href="mailto:${esc(m)}" data-event="contact_email_click">Contact (<span class="ph">${esc(m)}</span>)</a>`;
  },

  contactEmail(C) {
    const m = mail(C);
    return `<a href="mailto:${esc(m)}"><span class="ph">${esc(m)}</span></a>`;
  },

  ddLinks(C) {
    const L = C.links || {};
    return `<a href="${esc(L.decodingDraupadi)}" rel="noopener" target="_blank">Decoding Draupadi</a><span aria-hidden="true"> · </span><a href="${esc(L.draupadiOnTheDais)}" rel="noopener" target="_blank">Draupadi on the Dais</a>`;
  },

  social(C) {
    const L = C.links || {};
    return `<li><a href="${esc(L.instagram)}" rel="noopener" target="_blank">Instagram</a></li><li><a href="${esc(L.linkedin)}" rel="noopener" target="_blank">LinkedIn</a></li>`;
  },

  credits(C) {
    const imgs = C.images || {};
    const names = Object.keys(imgs)
      .map((k) => imgs[k])
      .filter((i) => i && i.unsplash)
      .map((i) => `<a href="https://unsplash.com/photos/${esc(i.unsplash)}?utm_source=dd_network&amp;utm_medium=referral" rel="noopener" target="_blank">${esc(i.credit || "Unsplash")}</a>`);
    if (!names.length) return "";
    return `Photographs by ${names.join(", ")} on <a href="https://unsplash.com/?utm_source=dd_network&amp;utm_medium=referral" rel="noopener" target="_blank">Unsplash</a>.`;
  }
};

function render(name, C) {
  if (name.startsWith("ph:")) {
    const v = (C.placeholders || {})[name.slice(3)];
    if (v == null) throw new Error(`Unknown placeholder: ${name}`);
    return `<span class="ph">${esc(v)}</span>`;
  }
  if (name.startsWith("img:")) return image(name.slice(4), C);
  if (!blocks[name]) throw new Error(`Unknown block: ${name}`);
  return blocks[name](C);
}

function apply(html, C) {
  return html.replace(/<!--@([\w:]+)-->[\s\S]*?<!--\/@-->/g, (_, name) => `<!--@${name}-->${render(name, C)}<!--/@-->`);
}

module.exports = { apply, SLOTS, WIDTHS };
