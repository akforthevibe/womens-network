/* ==========================================================================
   DD NETWORK — PAGE BEHAVIOUR
   Renders the editable content from config.js, runs the forms and sends
   analytics events. Content changes belong in config.js, not here.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.DD_CONFIG || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, C);
  }

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function money(amount) {
    var currency = (C.pricing && C.pricing.currency) || "INR";
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency, maximumFractionDigits: 0 }).format(amount);
    } catch (e) {
      return "₹" + amount;
    }
  }

  /* ------------------------------------------------------------------------
     Analytics
     ------------------------------------------------------------------------ */
  var A = C.analytics || {};
  window.dataLayer = window.dataLayer || [];

  function loadScript(src, attrs) {
    var s = document.createElement("script");
    s.async = true; s.src = src;
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
  }

  if (A.ga4Id) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4Id));
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", A.ga4Id);
  }
  if (A.plausibleDomain) {
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    loadScript("https://plausible.io/js/script.js", { "data-domain": A.plausibleDomain, defer: "" });
  }

  function track(event, props) {
    props = props || {};
    try {
      window.dataLayer.push(Object.assign({ event: event }, props));
      if (window.gtag && A.ga4Id) window.gtag("event", event, props);
      if (window.plausible && A.plausibleDomain) window.plausible(event, { props: props });
      if (A.debug) console.info("[DD analytics]", event, props);
    } catch (e) { /* never let analytics break the page */ }
  }
  window.ddTrack = track;

  track("page_view_dd", { referrer: document.referrer || "direct" });

  /* ------------------------------------------------------------------------
     Simple text binds + lists
     ------------------------------------------------------------------------ */
  $$("[data-bind]").forEach(function (n) {
    var v = get(n.getAttribute("data-bind"));
    if (v != null) n.innerHTML = v;
  });

  $$("[data-list]").forEach(function (n) {
    var items = get(n.getAttribute("data-list")) || [];
    n.innerHTML = "";
    items.forEach(function (t) { n.appendChild(el("li", null, t)); });
  });

  var heroMeta = $("[data-hero-meta]");
  if (heroMeta && C.hero && C.hero.meta) {
    heroMeta.innerHTML = C.hero.meta.map(function (m) { return "<span>" + m + "</span>"; }).join("");
  }

  /* CTA hrefs from config */
  if (C.cta) {
    $$('[data-cta="invite"]').forEach(function (a) { if (C.cta.inviteHref) a.setAttribute("href", C.cta.inviteHref); });
    $$('[data-cta="newsletter"]').forEach(function (a) { if (C.cta.newsletterHref) a.setAttribute("href", C.cta.newsletterHref); });
  }

  /* ------------------------------------------------------------------------
     Images
     ------------------------------------------------------------------------ */
  function fillImage(slot, image, eager) {
    if (!slot || !image || !image.src) return;
    var img = new Image();
    img.alt = image.alt || "";
    img.decoding = "async";
    if (!eager) img.loading = "lazy";
    img.onload = function () { img.classList.add("is-loaded"); };
    img.onerror = function () { img.remove(); }; // tonal fallback block stays
    img.src = image.src;
    slot.appendChild(img);
  }

  $$("[data-image]").forEach(function (slot) {
    var path = slot.getAttribute("data-image");
    fillImage(slot, get(path), path === "hero.image");
  });

  /* ------------------------------------------------------------------------
     Pricing
     ------------------------------------------------------------------------ */
  var pricingRoot = $("[data-pricing]");
  var tiers = (C.pricing && C.pricing.tiers) || [];
  if (pricingRoot && tiers.length) {
    pricingRoot.setAttribute("data-count", String(Math.min(tiers.length, 3)));
    var title = $("[data-pricing-title]");
    if (tiers.length > 1) {
      if (title) title.innerHTML = "One network. <em>Different levels of access.</em>";
      var sub = $("[data-pricing-sub]");
      if (sub) sub.textContent = "Same network, same introductions. The difference is how much access you want.";
    }

    tiers.forEach(function (t, i) {
      var tier = el("article", { "class": "tier" });
      var main = el("div", { "class": "tier-main" });
      main.appendChild(el("p", { "class": "tier-name" }, t.name));
      var price = el("p", { "class": "tier-price" });
      price.appendChild(el("span", { "class": "tier-amount" }, money(t.amount)));
      price.appendChild(el("span", { "class": "tier-period" }, "/ " + t.period));
      main.appendChild(price);
      if (t.altPrice && t.altPrice.amount) {
        main.appendChild(el("p", { "class": "tier-alt" }, "or " + money(t.altPrice.amount) + " / " + t.altPrice.period));
      }
      if (t.difference) main.appendChild(el("p", { "class": "tier-diff" }, t.difference));

      var cta = el("div", { "class": "tier-cta" });
      var a = el("a", {
        "class": "btn btn-primary",
        href: (C.cta && C.cta.inviteHref) || "#invite",
        "data-cta": "invite",
        "data-loc": "pricing" + (tiers.length > 1 ? "_" + (i + 1) : ""),
      }, ((C.cta && C.cta.inviteLabel) || "Request an Invite") + ' <span aria-hidden="true">→</span>');
      cta.appendChild(a);
      main.appendChild(cta);
      if (C.pricing.lockNote) main.appendChild(el("p", { "class": "tier-lock" }, C.pricing.lockNote));

      var inc = el("div", { "class": "tier-includes" });
      inc.appendChild(el("p", { "class": "label-plain" }, "Includes"));
      var ul = el("ul");
      (t.includes || []).forEach(function (x) { ul.appendChild(el("li", null, x)); });
      inc.appendChild(ul);

      tier.appendChild(main);
      tier.appendChild(inc);
      pricingRoot.appendChild(tier);
    });

    pricingRoot.parentNode.appendChild(el("p", { "class": "pricing-foot" },
      "Membership is by invitation. Requesting an invite is free; you’ll only pay once you’ve been accepted."));
  }

  function priceSentence() {
    if (!tiers.length) return "shared on application";
    var lowest = tiers.reduce(function (m, t) { return t.amount < m.amount ? t : m; }, tiers[0]);
    return (tiers.length > 1 ? "from " : "") + money(lowest.amount) + " a " + lowest.period;
  }

  /* ------------------------------------------------------------------------
     Founding members grid
     ------------------------------------------------------------------------ */
  var F = C.founding || {};
  var grid = $("[data-founding-grid]");
  if (grid) {
    var total = F.total || 50;
    var members = F.members || [];
    for (var i = 1; i <= total; i++) {
      var m = members[i - 1];
      var seat = el("li", { "class": "seat" });
      if (m) {
        seat.classList.add("is-filled");
        if (m.photo) {
          var img = new Image();
          img.src = m.photo; img.alt = ""; img.loading = "lazy";
          seat.appendChild(img);
        } else {
          seat.classList.add("no-photo");
        }
        seat.appendChild(el("span", { "class": "seat-label" }, "Founding " + pad(i)));
        seat.appendChild(el("span", { "class": "seat-meta" }, (m.name || "") + (m.role ? "<br>" + m.role : "")));
        seat.setAttribute("aria-label", "Founding " + pad(i) + ": " + (m.name || "member"));
      } else {
        if (i === members.length + 1) seat.classList.add("is-next");
        seat.appendChild(el("span", { "class": "seat-label" }, "Founding"));
        seat.appendChild(el("span", { "class": "seat-num" }, pad(i)));
        seat.setAttribute("aria-label", "Founding seat " + pad(i) + ", open");
      }
      grid.appendChild(seat);
    }
    var count = $("[data-founding-count]");
    if (count && F.showCount) {
      count.innerHTML = "<strong>" + members.length + " of " + total + "</strong> founding seats taken.";
      count.hidden = false;
    }
  }

  /* ------------------------------------------------------------------------
     Hosts
     ------------------------------------------------------------------------ */
  var hostsRoot = $("[data-hosts]");
  var hosts = (C.hosts && C.hosts.people) || [];
  if (hostsRoot) {
    hosts.forEach(function (h, i) {
      var card = el("article", { "class": "host" });
      var photo = el("figure", { "class": "host-photo img-slot" });
      if (h.photo) {
        fillImage(photo, { src: h.photo, alt: h.name ? "Portrait of " + h.name : "" });
      } else {
        photo.classList.add("is-empty");
        photo.appendChild(el("span", { "class": "host-ph-label" }, "Founding Host"));
        photo.appendChild(el("span", { "class": "host-ph-num" }, pad(i + 1)));
      }
      card.appendChild(photo);
      card.appendChild(el("p", { "class": "host-name" + (h.name ? "" : " is-tba") }, h.name || "Announcing soon"));
      if (h.role) card.appendChild(el("p", { "class": "host-role" }, h.role));
      if (h.quote) card.appendChild(el("p", { "class": "host-quote" }, "“" + h.quote + "”"));
      hostsRoot.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------------
     Founder photo
     ------------------------------------------------------------------------ */
  var fPhoto = $("[data-founder-photo]");
  if (fPhoto && C.founder) {
    if (C.founder.photo) {
      fillImage(fPhoto, { src: C.founder.photo, alt: "Portrait of " + C.founder.name });
    } else {
      fPhoto.classList.add("is-empty");
      fPhoto.appendChild(el("span", { "aria-hidden": "true" }, (C.founder.name || "A").charAt(0)));
    }
  }

  /* ------------------------------------------------------------------------
     FAQ
     ------------------------------------------------------------------------ */
  var faqRoot = $("[data-faq]");
  if (faqRoot) {
    (C.faq || []).forEach(function (item) {
      var d = el("details");
      d.appendChild(el("summary", null, item.q));
      d.appendChild(el("div", { "class": "faq-a" }, "<p>" + item.a.replace("{price}", priceSentence()) + "</p>"));
      d.addEventListener("toggle", function () {
        if (d.open) track("faq_open", { question: item.q });
      });
      faqRoot.appendChild(d);
    });
  }

  /* ------------------------------------------------------------------------
     CTA click tracking (delegated, so rendered buttons count too)
     ------------------------------------------------------------------------ */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-cta]");
    if (!a) return;
    var type = a.getAttribute("data-cta");
    track(type === "invite" ? "request_invite_click" : "newsletter_click", {
      location: a.getAttribute("data-loc") || "unknown",
    });
  });

  /* ------------------------------------------------------------------------
     Section views (once each) — pricing_view is the one that matters most
     ------------------------------------------------------------------------ */
  if ("IntersectionObserver" in window) {
    // A section only counts as viewed after ~1s on screen, so jumping to the
    // form via a CTA doesn't register every section scrolled past.
    var timers = {};
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var s = en.target, name = s.getAttribute("data-section");
        if (!en.isIntersecting) { clearTimeout(timers[name]); return; }
        timers[name] = setTimeout(function () {
          track("section_view", { section: name });
          var special = s.getAttribute("data-track-view");
          if (special) track(special);
          vo.unobserve(s);
        }, 1000);
      });
    }, { threshold: 0.25 });
    $$("[data-section]").forEach(function (s) { vo.observe(s); });
  }

  /* ------------------------------------------------------------------------
     Forms
     ------------------------------------------------------------------------ */
  var params = new URLSearchParams(window.location.search);
  var attribution = {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    referrer: document.referrer || "",
    page: window.location.pathname,
  };

  function setError(field, msg) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    var old = $(".err", wrap);
    if (old) old.remove();
    wrap.classList.toggle("is-invalid", !!msg);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) {
      var id = field.id + "-err";
      var s = el("span", { "class": "err", id: id }, msg);
      wrap.appendChild(s);
      field.setAttribute("aria-describedby", id);
    } else {
      field.removeAttribute("aria-describedby");
    }
  }

  function validate(form) {
    var first = null;
    $$("input[required], textarea[required]", form).forEach(function (f) {
      var v = f.value.trim(), msg = "";
      if (!v) msg = "Please fill this in.";
      else if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "That email doesn’t look right.";
      else if (f.name === "linkedin" && !/linkedin\.com\//i.test(v)) msg = "Please add your LinkedIn profile link.";
      setError(f, msg);
      if (msg && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  function send(endpoint, form) {
    var data = new URLSearchParams(new FormData(form));
    Object.keys(attribution).forEach(function (k) { data.append(k, attribution[k]); });

    if (!endpoint) {
      console.warn("[DD forms] No endpoint configured for '" + form.name + "'. Running in demo mode; nothing was sent.", Object.fromEntries(data));
      return new Promise(function (r) { setTimeout(r, 500); });
    }
    var url = endpoint === "netlify" ? "/" : endpoint;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: data.toString(),
      mode: endpoint.indexOf("script.google.com") > -1 ? "no-cors" : "cors",
    }).then(function (res) {
      if (res.type !== "opaque" && !res.ok) throw new Error("HTTP " + res.status);
    });
  }

  $$("[data-form]").forEach(function (form) {
    var kind = form.getAttribute("data-form");
    var cfg = (C.forms && C.forms[kind]) || {};
    var block = form.closest("[data-form-block]");
    var errorBox = $(".form-error", form);
    var started = false;

    form.addEventListener("focusin", function () {
      if (started) return;
      started = true;
      track(kind === "invite" ? "invite_form_start" : "newsletter_form_start");
    });

    form.addEventListener("input", function (e) {
      if (e.target.closest(".field.is-invalid")) setError(e.target, "");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errorBox.hidden = true;
      if (form.company_website && form.company_website.value) return; // bot
      if (!validate(form)) return;

      var btn = $("button[type=submit]", form);
      var label = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = "Sending…";

      send(cfg.endpoint || "", form).then(function () {
        track(kind === "invite" ? "invite_submit" : "newsletter_signup", { source: attribution.utm_source || "none" });
        var ok = $(".form-success", block);
        $(".success-title", ok).textContent = cfg.successTitle || "Thank you.";
        $(".success-body", ok).textContent = cfg.successBody || "";
        form.hidden = true;
        ok.hidden = false;
        ok.setAttribute("tabindex", "-1");
        ok.focus();
      }).catch(function (err) {
        track("form_error", { form: kind, message: String(err && err.message) });
        errorBox.textContent = "Something went wrong sending that. Please try again in a moment.";
        errorBox.hidden = false;
        btn.disabled = false;
        btn.innerHTML = label;
      });
    });
  });

  /* ------------------------------------------------------------------------
     Header state, active nav, sticky CTA
     ------------------------------------------------------------------------ */
  var header = $("[data-header]");
  var sticky = $("[data-sticky-cta]");
  var hero = $(".hero");
  var invite = $("#invite");
  var stickyLink = sticky && $("a", sticky);

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (sticky && hero && invite) {
      var pastHero = hero.getBoundingClientRect().bottom < 0;
      var atInvite = invite.getBoundingClientRect().top < window.innerHeight * 0.85;
      var show = pastHero && !atInvite;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      if (stickyLink) stickyLink.tabIndex = show ? 0 : -1;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    var navLinks = $$(".nav a");
    var navMap = { about: "#about", membership: "#membership", founding: "#founding", hosts: "#hosts" };
    var no = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var target = navMap[en.target.id];
        navLinks.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === target); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(navMap).forEach(function (id) { var s = document.getElementById(id); if (s) no.observe(s); });
  }

  /* ------------------------------------------------------------------------
     Gentle reveal on scroll
     ------------------------------------------------------------------------ */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    var targets = $$(".section-head, .flow, .asks, .compare, .numbered li, .four, .steps, .who-list, .tier, .founding-grid, .host, .lineage, .faq");
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); ro.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) {
      if (t.getBoundingClientRect().top < window.innerHeight) return; // already visible
      t.classList.add("reveal");
      ro.observe(t);
    });
  }
})();
