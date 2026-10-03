// Everything interactive: announcement, menu, sticky header and CTA, reveals,
// deep links, the two-step invite form, the notes and companies forms, analytics.

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasIO = "IntersectionObserver" in window;

/* Analytics */
function track(event: string, props: Record<string, string> = {}) {
  window.plausible?.(event, { props });
  window.gtag?.("event", event.toLowerCase().replace(/\s+/g, "_"), props);
  if (isLocal) console.info("[track]", event, props);
}

/* Storage can throw in private windows. */
const store = {
  get(key: string) {
    try { return sessionStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
  },
};

/* Announcement bar */
const announcement = $("[data-announcement]");
if (announcement && store.get("dd-announcement") === "closed") announcement.remove();
$("[data-announcement-close]")?.addEventListener("click", () => {
  announcement?.remove();
  store.set("dd-announcement", "closed");
});

/* Header: hairline once the page has scrolled */
const header = $("[data-header]");
if (header) {
  const onScroll = () => header.classList.toggle("is-stuck", scrollY > 60);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* Mobile menu: full screen, focus kept inside while open, Escape closes */
const menu = $("[data-menu]");
const menuToggle = $<HTMLButtonElement>("[data-menu-toggle]");
const menuClose = $<HTMLButtonElement>("[data-menu-close]");
function setMenu(open: boolean) {
  if (!menu || !menuToggle) return;
  menu.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  document.documentElement.style.overflow = open ? "hidden" : "";
  if (open) menuClose?.focus();
  else menuToggle.focus({ preventScroll: true });
}
menuToggle?.addEventListener("click", () => setMenu(true));
menuClose?.addEventListener("click", () => setMenu(false));
menu?.addEventListener("click", (e) => { if ((e.target as Element).closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (!menu?.classList.contains("is-open")) return;
  if (e.key === "Escape") setMenu(false);
  if (e.key === "Tab") {
    const items = $$<HTMLElement>("a, button", menu);
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* Reveals: fade up, image unveil, sticker settle, doodle draw */
const toReveal = $$(".reveal, [data-reveal], .doodle");
if (reduceMotion || !hasIO) {
  toReveal.forEach((el) => el.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    }),
    { rootMargin: "0px 0px -10% 0px" }
  );
  toReveal.forEach((el) => io.observe(el));
}

/* Mobile sticky CTA: on once the hero has gone, off while the form is on screen */
const sticky = $("[data-sticky]");
const hero = $("[data-hero]");
const requestSection = $("#request");
if (sticky && hero && requestSection && hasIO) {
  let heroGone = false;
  let formSeen = false;
  const stickyLink = $("a", sticky);
  const update = () => {
    const on = heroGone && !formSeen;
    sticky.classList.toggle("is-on", on);
    sticky.setAttribute("aria-hidden", String(!on));
    stickyLink?.setAttribute("tabindex", on ? "0" : "-1");
  };
  new IntersectionObserver(([e]) => { heroGone = !e.isIntersecting && e.boundingClientRect.top < 0; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { formSeen = e.isIntersecting || e.boundingClientRect.top < 0; update(); }).observe(requestSection);
}

/* Deep links, sources and click tracking */
const params = new URLSearchParams(location.search);
let inviteSource = "direct";
const inviteForm = $<HTMLFormElement>("[data-invite-form]");

function setSource(source: string) {
  inviteSource = source;
  $$<HTMLInputElement>("[data-source]").forEach((i) => (i.value = source));
}
function preselectInterest(key: string | null) {
  if (!inviteForm || !key) return;
  const radio = $<HTMLInputElement>(`[data-interest="${key}"]`, inviteForm);
  if (radio) radio.checked = true;
}
// ?interest=circle, ?as=host, ?as=company
preselectInterest(params.get("interest") ?? params.get("as"));
if (params.get("interest") || params.get("as")) setSource(`link-${params.get("interest") ?? params.get("as")}`);
$$<HTMLInputElement>("[data-utm]").forEach((input) => (input.value = params.get(input.dataset.utm!) ?? ""));

document.addEventListener("click", (e) => {
  const link = (e.target as Element).closest<HTMLAnchorElement>("a");
  if (!link) return;
  if (link.dataset.invite) {
    track("Request invite click", { section: link.dataset.invite });
    setSource(link.dataset.invite);
  }
  if (link.hasAttribute("data-circle-waitlist")) {
    track("Circle waitlist click");
    setSource("circle-waitlist");
  }
  if (link.hasAttribute("data-host-link")) setSource("hosts");
  if (link.hasAttribute("data-companies")) track("Companies click", { label: link.textContent?.trim() ?? "" });
  if (link.dataset.community) track("Community click", { section: link.dataset.community });

  // Same-page links that carry a preselection: apply it without reloading.
  const url = new URL(link.href, location.href);
  if (url.pathname === location.pathname && url.hash && url.search) {
    const target = $(url.hash);
    if (!target) return;
    e.preventDefault();
    const p = url.searchParams;
    preselectInterest(p.get("interest") ?? p.get("as"));
    preselectSeat(p.get("seat"));
    history.replaceState(null, "", `${url.search}${url.hash}`);
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
});

$$<HTMLDetailsElement>("[data-faq]").forEach((d) =>
  d.addEventListener("toggle", () => { if (d.open) track("FAQ open", { question: $("summary", d)?.textContent?.trim() ?? "" }); })
);

/* Validation helpers */
type Check = (f: HTMLFormElement) => string | null;
const value = (f: HTMLFormElement, name: string) => ((f.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "").trim();
const picked = (f: HTMLFormElement, name: string) => !!$(`[name="${name}"]:checked`, f);
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function showError(f: HTMLFormElement, name: string, message: string | null) {
  const wrap = $(`[data-field="${name}"]`, f);
  const error = wrap && $("[data-error]", wrap);
  if (!wrap || !error) return;
  error.textContent = message ?? "";
  error.hidden = !message;
  $$("input, textarea", wrap).forEach((el) => {
    if (["radio", "checkbox"].includes((el as HTMLInputElement).type)) return;
    if (message) el.setAttribute("aria-invalid", "true");
    else el.removeAttribute("aria-invalid");
  });
  if (wrap.tagName === "FIELDSET") {
    if (message) wrap.setAttribute("aria-invalid", "true");
    else wrap.removeAttribute("aria-invalid");
  }
}

function validate(f: HTMLFormElement, checks: Record<string, Check>, names: string[]) {
  let first: string | null = null;
  for (const name of names) {
    const message = checks[name](f);
    showError(f, name, message);
    if (message && !first) first = name;
  }
  if (first) $<HTMLElement>(`[name="${first}"]`, f)?.focus();
  return !first;
}

function liveClear(f: HTMLFormElement, checks: Record<string, Check>) {
  const recheck = (e: Event) => {
    const name = (e.target as HTMLInputElement).name;
    if (checks[name] && $(`[data-field="${name}"] [data-error]:not([hidden])`, f)) showError(f, name, checks[name](f));
  };
  f.addEventListener("input", recheck);
  f.addEventListener("change", recheck);
}

/* Netlify Forms: post url-encoded to the site. On localhost nothing is sent. */
async function post(f: HTMLFormElement) {
  const body = new URLSearchParams(new FormData(f) as unknown as Record<string, string>).toString();
  if (isLocal) {
    console.info("[demo] form not sent from localhost:", Object.fromEntries(new URLSearchParams(body)));
    await new Promise((r) => setTimeout(r, 400));
    return;
  }
  const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!res.ok) throw new Error(`Form post failed: ${res.status}`);
}

/* Invite form: two steps */
const inviteChecks: Record<string, Check> = {
  name: (f) => (value(f, "name").length < 2 ? "Please add your full name." : null),
  email: (f) => {
    const v = value(f, "email");
    if (!v) return "Please add your email.";
    return emailOk(v) ? null : "Please check your email address.";
  },
  whatsapp: (f) => (value(f, "whatsapp").replace(/\D/g, "").length < 10 ? "Please add your WhatsApp number, with country code if you are outside India." : null),
  linkedin: (f) => {
    const v = value(f, "linkedin");
    if (!v) return "Please add your LinkedIn profile.";
    return /linkedin\.com\/./i.test(v) ? null : "Please add the link to your LinkedIn profile, like linkedin.com/in/yourname.";
  },
  describes: (f) => (picked(f, "describes") ? null : "Please choose what best describes you."),
  interest: (f) => (picked(f, "interest") ? null : "Please choose what you're interested in."),
  need: (f) => (value(f, "need").length < 3 ? "Please tell us what you need in the next 90 days." : null),
  offer: (f) => (value(f, "offer").length < 3 ? "Please tell us what another member could come to you for." : null),
  heard: (f) => (picked(f, "heard") ? null : "Please tell us how you heard about DD Network."),
  consent: (f) => ((f.elements.namedItem("consent") as HTMLInputElement).checked ? null : "Please agree so we can review your application."),
};
const inviteSteps = {
  "1": ["name", "email", "whatsapp", "linkedin", "describes", "interest"],
  "2": ["need", "offer", "heard", "consent"],
};

const inviteCard = $("[data-invite-card]");
if (inviteForm && inviteCard) {
  const label = $("[data-step-label]", inviteForm)!;
  let started = false;
  inviteForm.addEventListener("focusin", () => {
    if (started) return;
    started = true;
    track("Application started", { source: inviteSource });
  });

  const goTo = (step: "1" | "2") => {
    inviteForm.dataset.current = step;
    label.textContent = `${step} / 2`;
    inviteForm.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    $<HTMLElement>(`[data-step="${step}"] legend`, inviteForm)?.focus({ preventScroll: true });
  };

  $("[data-next]", inviteForm)?.addEventListener("click", () => {
    if (!validate(inviteForm, inviteChecks, inviteSteps["1"])) return;
    track("Step one complete", { source: inviteSource });
    goTo("2");
  });
  $("[data-back]", inviteForm)?.addEventListener("click", () => goTo("1"));
  liveClear(inviteForm, inviteChecks);

  inviteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (inviteForm.dataset.current !== "2") {
      $<HTMLButtonElement>("[data-next]", inviteForm)?.click(); // Enter pressed on step one
      return;
    }
    if (!validate(inviteForm, inviteChecks, inviteSteps["2"])) return;
    track("Step two complete", { source: inviteSource });

    const button = $<HTMLButtonElement>("[data-submit]", inviteForm)!;
    const formError = $("[data-form-error]", inviteForm)!;
    button.disabled = true;
    button.textContent = "Sending…";
    formError.hidden = true;
    try {
      await post(inviteForm);
      track("Application submitted", { source: inviteSource, interest: $<HTMLInputElement>("[name=interest]:checked", inviteForm)?.value ?? "" });
      inviteForm.classList.add("hidden");
      const thanks = $("[data-thanks]", inviteCard)!;
      thanks.classList.remove("hidden");
      thanks.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      thanks.focus({ preventScroll: true });
    } catch {
      formError.textContent = "Something went wrong and your request was not sent. Your answers are still here, so please try again.";
      formError.hidden = false;
    } finally {
      button.disabled = false;
      button.textContent = "Send my request";
    }
  });
}

/* Founding notes */
const notesToggle = $<HTMLButtonElement>("[data-notes-toggle]");
const notesForm = $<HTMLFormElement>("[data-notes-form]");
const openNotes = () => {
  notesForm?.classList.add("is-open");
  notesToggle?.setAttribute("aria-expanded", "true");
  $<HTMLInputElement>("[name=email]", notesForm!)?.focus();
};
notesToggle?.addEventListener("click", () => {
  if (notesForm?.classList.contains("is-open")) {
    notesForm.classList.remove("is-open");
    notesToggle.setAttribute("aria-expanded", "false");
  } else openNotes();
});
$("[data-notes-link]")?.addEventListener("click", () => setTimeout(openNotes, reduceMotion ? 0 : 450));
if (notesForm) {
  const error = $("[data-error]", notesForm)!;
  const email = $<HTMLInputElement>("[name=email]", notesForm)!;
  notesForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!emailOk(email.value.trim())) {
      error.textContent = "Please add your email.";
      error.hidden = false;
      email.setAttribute("aria-invalid", "true");
      email.focus();
      return;
    }
    error.hidden = true;
    email.removeAttribute("aria-invalid");
    try {
      await post(notesForm);
      track("Founding notes submitted");
      $(".flex", notesForm)?.classList.add("hidden");
      $("[data-success]", notesForm)?.classList.remove("hidden");
    } catch {
      error.textContent = "That didn't go through. Please try again.";
      error.hidden = false;
    }
  });
}

/* Companies form */
const companyForm = $<HTMLFormElement>("[data-company-form]");
function preselectSeat(key: string | null) {
  if (!companyForm || !key) return;
  const radio = $<HTMLInputElement>(`[data-seat-option="${key}"]`, companyForm);
  if (radio) radio.checked = true;
}
preselectSeat(params.get("seat"));
if (companyForm) {
  const checks: Record<string, Check> = {
    company: (f) => (value(f, "company") ? null : "Please add your company."),
    name: (f) => (value(f, "name").length < 2 ? "Please add your name." : null),
    email: (f) => {
      const v = value(f, "email");
      if (!v) return "Please add your work email.";
      return emailOk(v) ? null : "Please check your email address.";
    },
    role: (f) => (value(f, "role") ? null : "Please add your role."),
    seats: (f) => (Number(value(f, "seats")) >= 1 ? null : "Please add how many seats you're thinking about."),
    seat_interest: (f) => (picked(f, "seat_interest") ? null : "Please choose which seats interest you."),
  };
  liveClear(companyForm, checks);
  companyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate(companyForm, checks, Object.keys(checks))) return;
    const button = $<HTMLButtonElement>("[data-submit]", companyForm)!;
    const formError = $("[data-form-error]", companyForm)!;
    button.disabled = true;
    formError.hidden = true;
    try {
      await post(companyForm);
      track("Company enquiry submitted", { interest: $<HTMLInputElement>("[name=seat_interest]:checked", companyForm)?.value ?? "" });
      companyForm.classList.add("hidden");
      const thanks = $("[data-company-thanks]")!;
      thanks.classList.remove("hidden");
      thanks.focus();
    } catch {
      formError.textContent = "Something went wrong and your note was not sent. Please try again.";
      formError.hidden = false;
    } finally {
      button.disabled = false;
    }
  });
}

export {};
