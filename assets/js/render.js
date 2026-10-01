/* ==========================================================================
   DD NETWORK — Renderers
   Turn content.js into HTML. Used by scripts/build.mjs to write the content
   straight into index.html (so it's real, crawlable HTML).
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DDRender = factory();
})(this, function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function money(C, n) { return (C.membership.currency || "₹") + Number(n).toLocaleString("en-IN"); }
  function get(C, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, C);
  }
  function priceText(C) {
    var t = C.membership.tiers[0];
    return money(C, t.price) + " a " + t.period;
  }
  var ONERR = ' onerror="this.parentNode.classList.add(\'is-failed\')"';
  function img(data, eager) {
    if (!data || !data.src) return "";
    return '<img src="' + esc(data.src) + '" alt="' + esc(data.alt || "") + '"' +
      (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' + ONERR + ">";
  }

  var R = {
    // Raw (trusted) HTML from content.js, e.g. hero.headline with <em>
    html: function (C, path) { return get(C, path) || ""; },
    text: function (C, path) { return esc(get(C, path)); },
    img: function (C, path) { return img(get(C, path)); },

    heroImage: function (C) {
      var i = C.hero.image;
      return img(i, true) + (i && i.caption ? "<figcaption>" + esc(i.caption) + "</figcaption>" : "");
    },

    heroMeta: function (C) {
      var parts = [
        "Founding membership " + priceText(C),
        C.founding.total + " places",
        "Mumbai"
      ];
      return parts.map(esc).join('<span class="dot" aria-hidden="true">·</span>');
    },

    rhythm: function (C) {
      return (C.rhythm || []).map(function (r) {
        return '<li><p class="rhythm-when">' + esc(r.when) + '</p><p class="rhythm-what">' + esc(r.what) +
          '</p><p class="rhythm-detail">' + esc(r.detail) + "</p></li>";
      }).join("");
    },

    pricing: function (C) {
      var M = C.membership, tiers = M.tiers;
      var inc = '<ul class="includes">' + M.included.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
      var cols = tiers.map(function (t, i) {
        return '<div class="tier">' +
          '<p class="tier-name">' + esc(t.name) + "</p>" +
          '<p class="price">' + esc(money(C, t.price)) + '<span class="per">/ ' + esc(t.period) + "</span></p>" +
          (t.forWhom ? '<p class="tier-for">' + esc(t.forWhom) + "</p>" : "") +
          '<a class="btn btn-light" href="#invite" data-cta="invite" data-loc="pricing' + (tiers.length > 1 ? "-" + (i + 1) : "") +
          '" data-tier="' + esc(t.name) + '">Request an invite <span aria-hidden="true">→</span></a>' +
          "</div>";
      }).join("");
      return '<div class="price-grid' + (tiers.length > 1 ? " is-multi" : "") + '">' +
        '<div class="tiers">' + cols + "</div>" +
        '<div class="price-includes"><p class="label">Everything included</p>' + inc +
        (M.note ? '<p class="price-note">' + esc(M.note) + "</p>" : "") + "</div></div>";
    },

    foundingBenefits: function (C) {
      return C.founding.benefits.map(function (b, i) {
        return '<li><span class="fb-n">' + pad(i + 1) + '</span><p class="fb-title">' + esc(b.title) +
          '</p><p class="fb-detail">' + esc(b.detail) + "</p></li>";
      }).join("");
    },

    foundingCounter: function (C) {
      var F = C.founding, total = F.total, taken = Math.min(F.taken || 0, total);
      var ticks = "";
      for (var i = 0; i < total; i++) ticks += '<span class="tick' + (F.showTaken && i < taken ? " is-taken" : "") + '"></span>';
      var label = F.showTaken
        ? '<span class="counter-n">' + (total - taken) + '</span><span class="counter-of">of ' + total + " places left</span>"
        : '<span class="counter-n">' + total + '</span><span class="counter-of">places. The first cohort is being assembled now.</span>';
      return '<p class="counter">' + label + '</p><div class="ticks" aria-hidden="true">' + ticks + "</div>";
    },

    hosts: function (C) {
      return C.hosts.profiles.map(function (h, i) {
        var named = h.name && h.name.trim();
        return '<article class="host">' +
          '<p class="host-n">Host ' + pad(i + 1) + "</p>" +
          '<figure class="host-photo media' + (h.photo ? "" : " is-placeholder") + '">' +
          (h.photo ? img({ src: h.photo, alt: h.name }) : "") +
          "</figure>" +
          '<p class="host-name' + (named ? "" : " is-tba") + '">' + (named ? esc(h.name) : "Announcing soon") + "</p>" +
          '<p class="host-role">' + esc(h.role) + "</p>" +
          '<p class="host-line">“' + esc(h.line) + "”</p>" +
          (h.room ? '<p class="host-room"><span>Her room</span>' + esc(h.room) + "</p>" : "") +
          "</article>";
      }).join("");
    },

    hostCommitments: function (C) {
      return C.hosts.commitments.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    },

    founder: function (C) {
      var F = C.founder;
      var sign = '<p class="founder-sign"><strong>' + esc(F.name) + "</strong> · " + esc(F.title) +
        (F.link ? ' · <a href="' + esc(F.link) + '" target="_blank" rel="noopener">LinkedIn</a>' : "") + "</p>";
      var photo = F.photo ? '<figure class="founder-photo media">' + img({ src: F.photo, alt: F.name }) + "</figure>" : "";
      return '<div class="founder' + (F.photo ? " has-photo" : "") + '">' + photo +
        '<div><p class="founder-bio">' + esc(F.bio) + "</p>" + sign + "</div></div>";
    },

    faq: function (C) {
      var p = priceText(C);
      return C.faq.map(function (f) {
        return "<details><summary>" + esc(f.q) + '</summary><div class="faq-a"><p>' +
          esc(f.a).replace(/\{\{price\}\}/g, esc(p)) + "</p></div></details>";
      }).join("");
    },

    faqSchema: function (C) {
      var p = priceText(C);
      return '<script type="application/ld+json">' + JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: C.faq.map(function (f) {
          return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a.replace(/\{\{price\}\}/g, p) } };
        })
      }).replace(/</g, "\\u003c") + "</script>";
    },

    contact: function (C) {
      var m = C.links.contactEmail;
      return m ? 'Something else? Write to <a href="mailto:' + esc(m) + '">' + esc(m) + "</a>." : "";
    }
  };

  /** Replace every <!--@name arg-->…<!--/@--> block in an HTML string. */
  R.apply = function (html, C) {
    return html.replace(/<!--@([\w]+)(?: ([\w.]+))?-->[\s\S]*?<!--\/@-->/g, function (m, name, arg) {
      if (!R[name]) throw new Error("Unknown renderer: " + name);
      return "<!--@" + name + (arg ? " " + arg : "") + "-->" + R[name](C, arg) + "<!--/@-->";
    });
  };

  return R;
});
