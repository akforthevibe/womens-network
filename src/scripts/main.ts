// Everything interactive: announcement bar, menu, sticky bar, scroll reveals, deep links,
// the two-step invite form, the companies form, founding notes sign-up and analytics events.

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
const params = new URLSearchParams(location.search);

/* Analytics */
function track(event: string, props: Record<string, string> = {}) {
  window.plausible?.(event, { props });
  window.gtag?.("event", event.toLowerCase().replace(/\s+/g, "_"), props);
  if (isLocal) console.info("[track]", event, props);
}

/* Storage can throw in private windows. */
const store = {
  get(key: string) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
};

/* Announcement bar: dismissible, remembered */
const announcement = $("[data-announcement]");
if (announcement) {
  if (store.get("dd-announcement") === "dismissed") announcement.remove();
  else {
    const close = $("[data-dismiss-announcement]", announcement);
    close?.classList.replace("hidden", "flex");
    close?.addEventListener("click", () => {
      store.set("dd-announcement", "dismissed");
      announcement.remove();
      $<HTMLElement>("[data-nav] a")?.focus();
    });
  }
}

/* Mobile menu: full-screen panel */
const menuToggle = $<HTMLButtonElement>("[data-menu-toggle]");
const menu = $("[data-menu]");
function setMenu(open: boolean) {
  if (!menuToggle || !menu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("hidden", !open);
  document.documentElement.style.overflow = open ? "hidden" : "";
  $("[data-open]", menuToggle)?.classList.toggle("hidden", open);
  $("[data-close]", menuToggle)?.classList.toggle("hidden", !open);
  // The panel sits under the nav; keep it there if the announcement bar is still showing
  if (open) menu.style.top = `${$("[data-nav]")!.getBoundingClientRect().bottom}px`;
}
menuToggle?.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
menu?.addEventListener("click", (e) => { if ((e.target as Element).closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});

/* Reveal sections and draw doodles as they scroll in */
const toReveal = $$(".reveal, .draw");
if (reduceMotion || !("IntersectionObserver" in window)) {
  toReveal.forEach((el) => el.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  toReveal.forEach((el) => io.observe(el));
}

/* Sticky mobile bar: appears after the first scroll, hides while the form is on screen */
const bar = $("[data-sticky-bar]");
const formSection = $("#request") ?? $("#seats");
if (bar) {
  let scrolled = false;
  let formOnScreen = false;
  const update = () => {
    const show = scrolled && !formOnScreen;
    bar.classList.toggle("is-visible", show);
    document.body.classList.toggle("has-bar", show);
  };
  addEventListener("scroll", () => {
    if (!scrolled && scrollY > 120) { scrolled = true; update(); }
  }, { passive: true });
  if (formSection && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { formOnScreen = entry.isIntersecting; update(); }, { threshold: 0.05 }).observe(formSection);
  }
}

/* Deep links and sources */
const form = $<HTMLFormElement>("[data-invite-form]");
let inviteSource = "direct";

function preselect(interest: string | null) {
  if (!form || !interest) return;
  const radio = $<HTMLInputElement>(`[data-interest="${interest}"]`, form);
  if (radio) radio.checked = true;
}
function setSource(source: string) {
  inviteSource = source;
  $$<HTMLInputElement>("[data-source]").forEach((i) => (i.value = source));
}

// ?interest=member|circle|host|company preselects "I'm interested in"
preselect(params.get("interest"));
if (params.get("interest")) setSource(`link-${params.get("interest")}`);
$$<HTMLInputElement>("[data-utm]").forEach((input) => (input.value = params.get(input.dataset.utm!) ?? ""));

// Click tracking (by section and label) and in-page deep links without a reload
document.addEventListener("click", (e) => {
  const link = (e.target as Element).closest<HTMLAnchorElement>("a");
  if (!link) return;
  const label = link.dataset.label ?? link.textContent?.trim() ?? "";
  if (link.dataset.invite) {
    track("Request invite click", { section: link.dataset.invite, label });
    setSource(link.dataset.invite);
  }
  if (link.dataset.circleWaitlist) {
    track("Circle waitlist click", { section: link.dataset.circleWaitlist });
    setSource(`circle-${link.dataset.circleWaitlist}`);
  }
  if (link.dataset.companies) track("Companies click", { section: link.dataset.companies, label });
  if (link.dataset.whatsapp) track("Free DD community click", { section: link.dataset.whatsapp });
  if (link.hasAttribute("data-host-link")) setSource("hosts");

  // "get the founding notes" focuses the email field
  if (link.getAttribute("href") === "#founding-notes-email") {
    e.preventDefault();
    $<HTMLInputElement>("#founding-notes-email")?.focus();
    return;
  }

  const url = new URL(link.href, location.href);
  if (form && url.pathname === location.pathname && url.hash === "#request" && url.search) {
    e.preventDefault();
    preselect(url.searchParams.get("interest"));
    history.replaceState(null, "", `${url.search}#request`);
    $("#request")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
});

$$<HTMLDetailsElement>("[data-faq]").forEach((d) =>
  d.addEventListener("toggle", () => { if (d.open) track("FAQ open", { question: $("summary", d)?.textContent?.trim() ?? "" }); })
);

/* Validation helpers */
type Check = (form: HTMLFormElement) => string | null;
const value = (f: HTMLFormElement, name: string) => ((f.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "").trim();
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function showError(f: HTMLFormElement, name: string, message: string | null) {
  const wrap = $(`[data-field="${name}"]`, f);
  const error = wrap && $("[data-error]", wrap);
  if (!wrap || !error) return;
  error.textContent = message ?? "";
  error.classList.toggle("hidden", !message);
  $$("input, select, textarea", wrap).forEach((el) => {
    if ((el as HTMLInputElement).type === "radio") return;
    if (message) el.setAttribute("aria-invalid", "true");
    else el.removeAttribute("aria-invalid");
  });
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
  f.addEventListener("input", (e) => {
    const name = (e.target as HTMLInputElement).name;
    if (checks[name] && $(`[data-field="${name}"] [data-error]:not(.hidden)`, f)) showError(f, name, checks[name](f));
  });
  f.addEventListener("change", (e) => {
    const name = (e.target as HTMLInputElement).name;
    if (checks[name]) showError(f, name, checks[name](f));
  });
}

/* Invite form */
const inviteChecks: Record<string, Check> = {
  name: (f) => (value(f, "name").length < 2 ? "Please add your full name." : null),
  email: (f) => {
    const v = value(f, "email");
    if (!v) return "Please add your email.";
    return emailOk(v) ? null : "Please check your email address.";
  },
  whatsapp: (f) => (value(f, "whatsapp").replace(/\D/g, "").length < 10 ? "Please add your WhatsApp number." : null),
  linkedin: (f) => (/linkedin\.com\/./i.test(value(f, "linkedin")) ? null : "Please add your LinkedIn link."),
  describes: (f) => (value(f, "describes") ? null : "Please choose what describes you."),
  interest: (f) => ($("[name=interest]:checked", f) ? null : "Please choose what you're interested in."),
  need: (f) => (value(f, "need") ? null : "Please tell us what you need in the next 90 days."),
  offer: (f) => (value(f, "offer") ? null : "Please tell us what you could offer."),
  consent: (f) => ((f.elements.namedItem("consent") as HTMLInputElement).checked ? null : "Please agree so we can review your application."),
};
const steps: Record<string, string[]> = {
  "1": ["name", "email", "whatsapp", "linkedin", "describes", "interest"],
  "2": ["need", "offer", "consent"],
};

const card = $("[data-invite-card]");
if (form && card) {
  const progress = $("[data-step-label]", form)!;
  const goTo = (step: "1" | "2") => {
    form.dataset.current = step;
    progress.textContent = `${step} of 2`;
    const legend = $(`[data-step="${step}"] legend`, form);
    legend?.setAttribute("tabindex", "-1");
    legend?.focus();
    card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  $("[data-next]", form)?.addEventListener("click", () => {
    if (!validate(form, inviteChecks, steps["1"])) return;
    track("Form step 1 complete", { source: inviteSource, interest: value(form, "interest") });
    goTo("2");
  });
  $("[data-back]", form)?.addEventListener("click", () => goTo("1"));
  liveClear(form, inviteChecks);

  $$<HTMLTextAreaElement>("textarea[maxlength]", form).forEach((ta) => {
    const counter = ta.parentElement && $("[data-count]", ta.parentElement);
    const update = () => counter && (counter.textContent = `${ta.value.length} / ${ta.maxLength}`);
    ta.addEventListener("input", update);
    update();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.dataset.current !== "2") {
      $<HTMLButtonElement>("[data-next]", form)?.click(); // Enter pressed on step 1
      return;
    }
    if (!validate(form, inviteChecks, steps["2"])) return;
    const ok = await send(form, $<HTMLButtonElement>("[data-submit]", form)!, "Send my request");
    if (!ok) return;
    track("Form submitted", { source: inviteSource, interest: value(form, "interest") });
    $("[data-first-name]", card)!.textContent = value(form, "name").split(/\s+/)[0];
    form.classList.add("hidden");
    const thanks = $("[data-thanks]", card)!;
    thanks.classList.remove("hidden");
    thanks.focus();
  });
}

/* Companies form */
$$<HTMLFormElement>("[data-simple-form]").forEach((f) => {
  const names = [...new Set($$<HTMLInputElement>("[required]", f).map((i) => i.name))];
  const checks: Record<string, Check> = Object.fromEntries(
    names.map((name) => [
      name,
      (fm: HTMLFormElement) => {
        const el = $<HTMLInputElement>(`[name="${name}"]`, fm)!;
        const message = el.dataset.message ?? "Please fill this in.";
        if (el.type === "radio") return $(`[name="${name}"]:checked`, fm) ? null : message;
        const v = el.value.trim();
        if (!v) return message;
        if (el.type === "email" && !emailOk(v)) return "Please check the email address.";
        if (el.type === "number" && !(Number(v) >= 1)) return message;
        return null;
      },
    ])
  );
  liveClear(f, checks);
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate(f, checks, names)) return;
    const button = $<HTMLButtonElement>("[data-submit]", f)!;
    const ok = await send(f, button, button.textContent ?? "");
    if (!ok) return;
    track("Companies form submitted", { product: value(f, "product") });
    f.classList.add("hidden");
    const thanks = $<HTMLElement>("[data-thanks]", f.parentElement!)!;
    thanks.classList.remove("hidden");
    thanks.focus();
  });
});

/* Founding notes */
$$<HTMLFormElement>("[data-newsletter-form]").forEach((nf) => {
  const wrap = nf.closest<HTMLElement>("[data-newsletter]")!;
  const error = $("[data-error]", wrap)!;
  const email = $<HTMLInputElement>("[name=email]", nf)!;
  const source = $<HTMLInputElement>("[data-source]", nf);
  if (source && !source.value) source.value = "soft-step";

  nf.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!emailOk(email.value.trim())) {
      error.textContent = "Please add your email.";
      error.classList.remove("hidden");
      email.setAttribute("aria-invalid", "true");
      email.focus();
      return;
    }
    error.classList.add("hidden");
    email.removeAttribute("aria-invalid");
    try {
      await post(nf);
      track("Newsletter submitted");
      nf.classList.add("hidden");
      $("[data-success]", wrap)?.classList.remove("hidden");
    } catch {
      error.textContent = "That didn't go through. Please try again.";
      error.classList.remove("hidden");
    }
  });
});

/* Sends a form; on failure shows a message and keeps every answer in place. */
async function send(f: HTMLFormElement, button: HTMLButtonElement, label: string) {
  const formError = $("[data-form-error]", f);
  button.disabled = true;
  button.textContent = "Sending…";
  formError?.classList.add("hidden");
  try {
    await post(f);
    return true;
  } catch {
    if (formError) {
      formError.textContent = "Something went wrong and this was not sent. Please try again.";
      formError.classList.remove("hidden");
    }
    return false;
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

/* Netlify Forms: post url-encoded to the page. On localhost nothing is sent. */
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

export {};
