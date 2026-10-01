/* ==========================================================================
   DD NETWORK — Behaviour
   Handles CTAs, forms, analytics and page behaviour.
   Content is written into index.html by scripts/build.mjs.
   You shouldn't need to edit this file to change copy, prices or people.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.DD_CONTENT || {};
  var doc = document;
  doc.documentElement.classList.add("js");

  /* ---------------------------------------------------------------- utils */
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  var isLocal = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) || location.protocol === "file:";

  /* ------------------------------------------------------------ analytics */
  var A = C.analytics || {};
  window.dataLayer = window.dataLayer || [];

  (function loadAnalytics() {
    if (A.ga4Id) {
      var s = doc.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4Id);
      doc.head.appendChild(s);
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", A.ga4Id);
    }
    if (A.plausibleDomain) {
      var p = doc.createElement("script");
      p.defer = true;
      p.setAttribute("data-domain", A.plausibleDomain);
      p.src = "https://plausible.io/js/script.js";
      doc.head.appendChild(p);
      window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    }
  })();

  /**
   * Single tracking call. Sends to GA4 (gtag), Plausible and the dataLayer
   * (so Google Tag Manager or anything else can pick it up).
   * Events: page_view, cta_click, request_invite_click, newsletter_click,
   * invite_form_open, invite_form_start, invite_form_submit, invite_form_error,
   * newsletter_signup, newsletter_error, pricing_view, section_view, faq_open
   */
  function track(event, props) {
    props = props || {};
    try {
      window.dataLayer.push(Object.assign({ event: event }, props));
      if (typeof window.gtag === "function" && A.ga4Id) window.gtag("event", event, props);
      if (typeof window.plausible === "function" && A.plausibleDomain) window.plausible(event, { props: props });
    } catch (e) { /* never break the page for analytics */ }
    if (A.debug || isLocal) console.info("[DD track]", event, props);
  }
  window.ddTrack = track;

  // Remember where the visitor came from, so submissions can be attributed.
  var utm = (function () {
    var q = new URLSearchParams(location.search), out = [];
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref"].forEach(function (k) {
      if (q.get(k)) out.push(k + "=" + q.get(k));
    });
    try {
      if (out.length) sessionStorage.setItem("dd_utm", out.join("&"));
      return out.join("&") || sessionStorage.getItem("dd_utm") || "";
    } catch (e) { return out.join("&"); }
  })();

  /* ---------------------------------------------------- small trackers */
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) track("faq_open", { question: $("summary", d).textContent });
    });
  });
  $$("[data-track]").forEach(function (a) {
    a.addEventListener("click", function () { track(a.getAttribute("data-track"), {}); });
  });

  /* ------------------------------------------------------- CTAs & dialogs */
  var dialogs = { invite: $("#invite-dialog"), newsletter: $("#newsletter-dialog") };
  var lastSource = { invite: "direct", newsletter: "direct" };

  function openForm(kind, source) {
    var L = C.links || {};
    if (L[kind]) { // external form configured
      window.open(L[kind], "_blank", "noopener");
      return;
    }
    var d = dialogs[kind];
    if (!d) return;
    lastSource[kind] = source || "direct";
    Object.keys(dialogs).forEach(function (k) { if (k !== kind && dialogs[k].open) dialogs[k].close(); });
    var form = $("form", d);
    form.elements.source.value = lastSource[kind];
    form.elements.utm.value = utm;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    if (kind === "invite") track("invite_form_open", { source: lastSource[kind] });
    var first = $("input:not([type=hidden]):not([name=bot-field])", form);
    if (first && form.offsetParent !== null) setTimeout(function () { first.focus(); }, 50);
  }

  doc.addEventListener("click", function (e) {
    var a = e.target.closest("[data-cta]");
    if (!a) return;
    e.preventDefault();
    var kind = a.getAttribute("data-cta");
    var loc = a.getAttribute("data-loc") || "unknown";
    var props = { cta: kind, location: loc };
    if (a.getAttribute("data-tier")) props.tier = a.getAttribute("data-tier");
    track("cta_click", props);
    track(kind === "invite" ? "request_invite_click" : "newsletter_click", props);
    openForm(kind, loc);
  });

  Object.keys(dialogs).forEach(function (k) {
    var d = dialogs[k];
    if (!d) return;
    $$("[data-close]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
    // Click on the backdrop closes
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    d.addEventListener("close", function () {
      if (location.hash === "#invite" || location.hash === "#newsletter") {
        history.replaceState(null, "", location.pathname + location.search);
      }
    });
  });

  // Deep links: /#invite or /#newsletter open the form directly (handy for Instagram bios).
  function openFromHash() {
    if (location.hash === "#invite") openForm("invite", "link");
    if (location.hash === "#newsletter") openForm("newsletter", "link");
  }

  /* ---------------------------------------------------------------- forms */
  function encode(data) {
    return Object.keys(data).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]); }).join("&");
  }

  function validate(form) {
    var ok = true, firstBad = null;
    $$("input[required], textarea[required]", form).forEach(function (input) {
      var v = input.value.trim();
      var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      if (input.name === "linkedin" && v && !/linkedin\.com|^https?:\/\//i.test(v) && v.indexOf(".") === -1) bad = true;
      input.closest(".field").classList.toggle("is-invalid", bad);
      if (bad && !firstBad) firstBad = input;
      if (bad) ok = false;
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  function submitForm(form) {
    var kind = form.getAttribute("data-form");
    var F = C.forms || {};
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = typeof v === "string" ? v.trim() : v; });
    if (data["bot-field"]) return Promise.resolve(); // honeypot
    data.submitted_at = new Date().toISOString();
    data.page = location.href.split("#")[0];

    var endpoint = kind === "invite" ? F.inviteEndpoint : F.newsletterEndpoint;

    if (isLocal && !endpoint) {
      console.info("[DD form] demo mode, not sent:", kind, data);
      return new Promise(function (r) { setTimeout(r, 500); });
    }
    if (F.mode === "endpoint" || endpoint) {
      if (!endpoint) return Promise.reject(new Error("No endpoint configured"));
      return fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { if (!r.ok && r.type !== "opaque") throw new Error("HTTP " + r.status); });
    }
    // Netlify Forms
    return fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode(data)
    }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); });
  }

  $$("form[data-form]").forEach(function (form) {
    var kind = form.getAttribute("data-form");
    var dialog = form.closest("dialog");
    var errorEl = $(".form-error", form);
    var started = false;

    form.addEventListener("input", function (e) {
      var f = e.target.closest(".field");
      if (f) f.classList.remove("is-invalid");
      if (!started && kind === "invite") { started = true; track("invite_form_start", { source: lastSource.invite }); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errorEl.hidden = true;
      if (!validate(form)) {
        errorEl.textContent = "A couple of fields need another look.";
        errorEl.hidden = false;
        return;
      }
      form.classList.add("is-sending");
      submitForm(form).then(function () {
        var source = form.elements.source.value;
        if (kind === "invite") track("invite_form_submit", { source: source });
        else track("newsletter_signup", { source: source });
        var s = (C.forms && C.forms[kind + "Success"]) || {};
        var box = $(".form-success", dialog);
        $("[data-success-title]", box).textContent = s.title || "Thank you.";
        $("[data-success-body]", box).textContent = s.body || "";
        form.hidden = true;
        $$(".modal-intro, .modal-body > .label, .modal-body > .h2", dialog).forEach(function (el) { el.hidden = true; });
        box.hidden = false;
      }).catch(function (err) {
        track(kind === "invite" ? "invite_form_error" : "newsletter_error", { message: String(err && err.message) });
        var mail = (C.links && C.links.contactEmail) || "";
        errorEl.textContent = "Something went wrong sending that. Please try again" + (mail ? ", or email " + mail : "") + ".";
        errorEl.hidden = false;
      }).then(function () { form.classList.remove("is-sending"); });
    });
  });

  /* ----------------------------------------------------- page behaviour */
  function initHeader() {
    var header = $(".site-header");
    var toggle = $(".nav-toggle");
    var nav = $("#nav");
    var sticky = $(".sticky-cta");
    var hero = $(".hero");
    var final = $("#join");

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      });
    });

    var heroOut = false, finalIn = false;
    function updateSticky() {
      var show = heroOut && !finalIn;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", String(!show));
      $("a", sticky).tabIndex = show ? 0 : -1;
    }
    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { heroOut = !en[0].isIntersecting; updateSticky(); }, { rootMargin: "-40% 0px 0px 0px" }).observe(hero);
      new IntersectionObserver(function (en) { finalIn = en[0].isIntersecting; updateSticky(); }).observe(final);

      // Highlight the nav item for the current section
      var links = {};
      $$("a", nav).forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
      var navIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var a = links[en.target.id];
          if (a) a.classList.toggle("is-active", en.isIntersecting);
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(links).forEach(function (id) {
        var s = doc.getElementById(id);
        if (s) navIO.observe(s);
      });
    }
  }

  function initViewTracking() {
    if (!("IntersectionObserver" in window)) return;
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        if (seen[id]) return;
        seen[id] = true;
        track("section_view", { section: id });
        var special = en.target.getAttribute("data-track-view");
        if (special) track(special, {});
        io.unobserve(en.target);
      });
    }, { threshold: 0.35 });
    $$("main section[id]").forEach(function (s) { io.observe(s); });
  }

  function initReveal() {
    var targets = $$(".compare, .workflow li, .stages, .asks, .four article, .rhythm, .rooms-copy, .value-list li, .price-grid, .fb-list li, .host, .sources, .founder, .faq");
    targets.forEach(function (el) { el.classList.add("reveal"); });
    if (!("IntersectionObserver" in window)) { targets.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------- boot */
  initHeader();
  initReveal();
  initViewTracking();
  track("page_view", { path: location.pathname, utm: utm });
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
