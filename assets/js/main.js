/* ==========================================================================
   DD NETWORK: Behaviour
   Navigation, the two-step invite form, the newsletter forms, validation,
   UTM capture, analytics events, scroll reveal and the sticky mobile button.
   Settings come from the #dd-config block that scripts/build.mjs writes.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var cfgEl = doc.getElementById("dd-config");
  var CFG = {};
  try { CFG = JSON.parse(cfgEl ? cfgEl.textContent : "{}"); } catch (e) { CFG = {}; }
  var A = CFG.analytics || {};

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  var isLocal = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) || location.protocol === "file:";

  if (/[?&]placeholders\b/.test(location.search)) doc.documentElement.classList.add("show-ph");

  /* ------------------------------------------------------------ analytics */
  window.dataLayer = window.dataLayer || [];
  if (A.ga4Id) {
    var g = doc.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4Id);
    doc.head.appendChild(g);
    window.gtag = function () { window.dataLayer.push(arguments); };
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

  /**
   * Events: request_invite_click {location}, invite_step1_complete,
   * invite_submitted, newsletter_submitted {location}, newsletter_click,
   * circle_waitlist_click, companies_email_click, contact_email_click,
   * pricing_view, faq_open, invite_error, newsletter_error
   */
  function track(event, props) {
    props = props || {};
    try {
      var payload = { event: event };
      for (var k in props) payload[k] = props[k];
      window.dataLayer.push(payload);
      if (A.ga4Id && window.gtag) window.gtag("event", event, props);
      if (A.plausibleDomain && window.plausible) window.plausible(event, { props: props });
    } catch (e) { /* analytics must never break the page */ }
    if (isLocal) console.info("[DD track]", event, props);
  }

  /* ------------------------------------------------------------ UTM capture */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var utm = (function () {
    var q = new URLSearchParams(location.search), found = {}, any = false;
    UTM_KEYS.forEach(function (k) { if (q.get(k)) { found[k] = q.get(k).slice(0, 200); any = true; } });
    if (any) { store("dd_utm", JSON.stringify(found)); return found; }
    try { return JSON.parse(store("dd_utm") || "{}") || {}; } catch (e) { return {}; }
  })();
  var referrer = (function () {
    var r = doc.referrer && doc.referrer.indexOf(location.host) === -1 ? doc.referrer : "";
    if (r) store("dd_ref", r);
    return r || store("dd_ref") || "";
  })();

  /* ------------------------------------------------------------ photos */
  $$(".photo img").forEach(function (img) {
    function broken() { img.parentNode.classList.add("is-broken"); }
    if (img.complete && img.naturalWidth === 0) broken();
    img.addEventListener("error", broken);
  });

  /* ------------------------------------------------------------ header & nav */
  var header = $(".site-header");
  var toggle = $(".menu-toggle");
  var nav = $("#site-nav");
  function closeNav() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", closeNav); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(); toggle.focus(); } });
  window.addEventListener("scroll", function () { header.classList.toggle("is-scrolled", window.scrollY > 8); }, { passive: true });

  /* ------------------------------------------------------------ invite form */
  var form = $("#invite-form");
  var thanks = $("[data-invite-thanks]");
  var stepLabel = $("[data-step-label]", form);
  var request = $("#request");

  function setRadio(name, value) {
    var r = $('input[name="' + name + '"][value="' + value + '"]', form);
    if (r) r.checked = true;
  }

  function goToForm(location) {
    form.elements.cta_location.value = location || "";
    if (form.hidden) return;
    showStep(1, true);
  }

  // Every "Request an invite" button: track where it was clicked, remember it on the form.
  doc.addEventListener("click", function (e) {
    var a = e.target.closest("[data-invite], [data-circle], [data-host], [data-event]");
    if (!a) return;
    if (a.hasAttribute("data-invite")) {
      var loc = a.getAttribute("data-invite");
      track("request_invite_click", { location: loc });
      goToForm(loc);
    } else if (a.hasAttribute("data-circle")) {
      track("circle_waitlist_click", { location: a.getAttribute("data-circle") });
      setRadio("plan", "Circle waitlist");
      goToForm("circle_waitlist");
    } else if (a.hasAttribute("data-host")) {
      track("request_invite_click", { location: "hosts" });
      setRadio("applying_as", "Founding Host");
      goToForm("founding_host");
    } else {
      track(a.getAttribute("data-event"), a.getAttribute("data-loc") ? { location: a.getAttribute("data-loc") } : {});
    }
  });

  // Deep links for Instagram bios and WhatsApp:  /?as=host#request  ·  /?plan=circle#request
  (function () {
    var q = new URLSearchParams(location.search);
    if (q.get("as") === "host") setRadio("applying_as", "Founding Host");
    if (q.get("plan") === "circle") setRadio("plan", "Circle waitlist");
    if (location.hash === "#request") form.elements.cta_location.value = "link";
  })();

  function fieldOf(el) { return el.closest(".field"); }

  function errorFor(field, message) {
    var id = (field.id || field.querySelector("[id]") && field.querySelector("[id]").id || "f") + "-err";
    var err = $(".field-error", field);
    var control = $("input:not([type=radio]), select, textarea", field);
    if (!message) {
      field.classList.remove("is-invalid");
      if (err) err.remove();
      if (control) { control.removeAttribute("aria-invalid"); control.setAttribute("aria-describedby", (control.getAttribute("aria-describedby") || "").replace(id, "").trim()); }
      return;
    }
    field.classList.add("is-invalid");
    if (!err) {
      err = doc.createElement("p");
      err.className = "field-error";
      err.id = id;
      field.appendChild(err);
    }
    err.textContent = message;
    if (control) {
      control.setAttribute("aria-invalid", "true");
      var d = control.getAttribute("aria-describedby") || "";
      if (d.indexOf(id) === -1) control.setAttribute("aria-describedby", (d + " " + id).trim());
    }
  }

  function check(el) {
    var v = (el.value || "").trim();
    if (el.type === "radio") {
      var group = el.closest("fieldset");
      return $("input:checked", group) ? "" : group.getAttribute("data-error");
    }
    if (el.type === "checkbox") return el.checked ? "" : el.getAttribute("data-error");
    if (el.name === "whatsapp") {
      var digits = v.replace(/\D/g, "");
      if (digits.length < 10) return v.replace(/[\s+]/g, "") === "91" || !v ? el.getAttribute("data-error") : "That number looks too short. Please check it.";
      return "";
    }
    if (!v) return el.getAttribute("data-error");
    if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "That email doesn't look quite right. Please check it.";
    if (el.name === "linkedin" && !/linkedin\.com\//i.test(v)) return "Please add your LinkedIn link (it should include linkedin.com/).";
    return "";
  }

  // Validate the visible required fields in a container. Returns true if all good.
  function validate(container) {
    var firstBad = null, seen = {};
    $$("[required]", container).forEach(function (el) {
      var field = el.type === "radio" ? el.closest("fieldset") : fieldOf(el);
      if (!field || field.hidden || seen[el.name]) return;
      seen[el.name] = true;
      var msg = check(el);
      errorFor(field, msg);
      if (msg && !firstBad) firstBad = el;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  // Clear an error as soon as it is fixed
  form.addEventListener("input", onEdit);
  form.addEventListener("change", onEdit);
  function onEdit(e) {
    var el = e.target;
    var field = el.type === "radio" ? el.closest("fieldset") : fieldOf(el);
    if (field && field.classList.contains("is-invalid") && !check(el)) errorFor(field, "");
  }

  // "Other" city reveals a text field
  var city = form.elements.city;
  var cityOther = $("[data-city-other]", form);
  city.addEventListener("change", function () {
    var other = city.value === "Other";
    cityOther.hidden = !other;
    form.elements.city_other.required = other;
    if (other) form.elements.city_other.focus();
  });

  // Character count for the 6-month question
  var goal = form.elements.goal;
  var count = $("[data-count]", form);
  goal.addEventListener("input", function () { count.textContent = goal.value.length; });

  function showStep(n, scroll) {
    form.classList.toggle("on-step-2", n === 2);
    stepLabel.textContent = n === 1 ? "Step 1 of 2 · About you" : "Step 2 of 2 · What you're working on";
    if (scroll) {
      var top = form.getBoundingClientRect().top + window.scrollY - 100;
      if (Math.abs(window.scrollY - top) > 40 && n === 2) window.scrollTo({ top: top, behavior: "smooth" });
    }
  }

  $("[data-next]", form).addEventListener("click", function () {
    if (!validate($('[data-step="1"]', form))) return;
    track("invite_step1_complete", { location: form.elements.cta_location.value || "direct" });
    showStep(2, true);
    setTimeout(function () { goal.focus({ preventScroll: true }); }, 60);
  });
  $("[data-back]", form).addEventListener("click", function () {
    showStep(1, true);
    form.elements.name.focus();
  });

  function encode(fd) {
    var parts = [];
    fd.forEach(function (v, k) { parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v)); });
    return parts.join("&");
  }

  function send(f) {
    var fd = new FormData(f);
    if (fd.get("company_website")) return Promise.resolve(); // honeypot: pretend it worked
    if (isLocal) {
      var o = {}; fd.forEach(function (v, k) { o[k] = v; });
      console.info("[DD form] demo mode, nothing sent:", o);
      return new Promise(function (r) { setTimeout(r, 400); });
    }
    return fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode(fd)
    }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); });
  }

  function failMessage(el) {
    el.textContent = "Sorry, that didn't go through. Your answers are still here, so please try again" +
      (CFG.contactEmail ? ", or email " + CFG.contactEmail : "") + ".";
    el.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errBox = $(".form-error", form);
    errBox.hidden = true;
    if (!validate($('[data-step="1"]', form))) { showStep(1, true); return; }
    if (!validate($('[data-step="2"]', form))) return;

    UTM_KEYS.forEach(function (k) { form.elements[k].value = utm[k] || ""; });
    form.elements.referrer.value = referrer;
    form.elements.submitted_at.value = new Date().toISOString();

    form.classList.add("is-sending");
    send(form).then(function () {
      track("invite_submitted", { location: form.elements.cta_location.value || "direct", applying_as: (form.elements.applying_as.value || "") });
      var first = form.elements.name.value.trim().split(/\s+/)[0] || "";
      $("[data-first-name]", thanks).textContent = first ? ", " + first : "";
      var nf = $("form", thanks);
      nf.elements.email.value = form.elements.email.value.trim();
      nf.elements.first_name.value = first;
      if (store("dd_newsletter") === "1") { nf.hidden = true; }
      form.hidden = true;
      thanks.hidden = false;
      thanks.focus();
      thanks.scrollIntoView({ block: "start" });
    }).catch(function (err) {
      track("invite_error", { message: String(err && err.message) });
      failMessage(errBox);
    }).then(function () { form.classList.remove("is-sending"); });
  });

  /* ------------------------------------------------------------ newsletter forms */
  $$(".newsletter-form").forEach(function (nf) {
    nf.addEventListener("input", onNfEdit);
    function onNfEdit(e) {
      var field = fieldOf(e.target);
      if (field && field.classList.contains("is-invalid") && !check(e.target)) errorFor(field, "");
    }
    nf.addEventListener("submit", function (e) {
      e.preventDefault();
      var errBox = $(".form-error", nf);
      errBox.hidden = true;
      if (!validate(nf)) return;
      if (nf.elements.utm_source) nf.elements.utm_source.value = utm.utm_source || "";
      nf.classList.add("is-sending");
      send(nf).then(function () {
        track("newsletter_submitted", { location: nf.getAttribute("data-loc") });
        store("dd_newsletter", "1");
        nf.hidden = true;
        var done = nf.parentNode.querySelector(".newsletter-done");
        done.hidden = false;
        done.setAttribute("tabindex", "-1");
        done.focus();
      }).catch(function (err) {
        track("newsletter_error", { message: String(err && err.message) });
        failMessage(errBox);
      }).then(function () { nf.classList.remove("is-sending"); });
    });
  });

  /* ------------------------------------------------------------ FAQ */
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) track("faq_open", { question: $("summary", d).textContent }); });
  });

  /* ------------------------------------------------------------ scroll: reveal, nav, sticky */
  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach(function (el) { revealIO.observe(el); });

    // Highlight the nav item for the section in view
    var links = {};
    $$("a[href^='#']", nav).forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (a) a.classList.toggle("is-active", en.isIntersecting);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = doc.getElementById(id); if (s) navIO.observe(s); });

    // Pricing seen
    var pricing = $("[data-view]");
    if (pricing) {
      var pIO = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { track(pricing.getAttribute("data-view"), {}); pIO.disconnect(); }
      }, { threshold: 0.3 });
      pIO.observe(pricing);
    }

    // Sticky mobile button: hidden while the hero buttons or the form are on screen
    var sticky = $(".sticky-cta");
    var stickyBtn = $("a", sticky);
    var heroVisible = true, requestVisible = false;
    function updateSticky() {
      var show = !heroVisible && !requestVisible;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", String(!show));
      stickyBtn.tabIndex = show ? 0 : -1;
    }
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; updateSticky(); }).observe($(".hero .actions"));
    new IntersectionObserver(function (en) { requestVisible = en[0].isIntersecting; updateSticky(); }, { rootMargin: "0px 0px -30% 0px" }).observe(request);
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }
})();
