// Everything interactive on the page: menu, sticky bar, scroll reveals, deep links,
// the two-step invite form, the newsletter form and analytics events.

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

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

/* Mobile menu */
const menuToggle = $<HTMLButtonElement>("[data-menu-toggle]");
const menu = $("[data-menu]");
function setMenu(open: boolean) {
  if (!menuToggle || !menu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("hidden", !open);
  $("[data-open]", menuToggle)?.classList.toggle("hidden", open);
  $("[data-close]", menuToggle)?.classList.toggle("hidden", !open);
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
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
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

/* Sticky mobile bar hides while the form is on screen or the menu is open */
const bar = $("[data-sticky-bar]");
const requestSection = $("#request");
if (bar && requestSection && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => bar.classList.toggle("is-hidden", entry.isIntersecting), { threshold: 0.05 })
    .observe(requestSection);
}

/* Invite form */
const form = $<HTMLFormElement>("[data-invite-form]");
const card = $("[data-invite-card]");
const params = new URLSearchParams(location.search);
let inviteSource = "direct";

function preselect(as: string | null, interest: string | null) {
  if (!form) return;
  if (as) {
    const radio = $<HTMLInputElement>(`[data-as="${as}"]`, form);
    if (radio) radio.checked = true;
  }
  if (interest) {
    const radio = $<HTMLInputElement>(`[data-interest="${interest}"]`, form);
    if (radio) radio.checked = true;
  }
}

function setSource(source: string) {
  inviteSource = source;
  $$<HTMLInputElement>("[data-source]").forEach((i) => (i.value = source));
}

// Deep links: ?as=host, ?as=company, ?interest=circle
preselect(params.get("as"), params.get("interest"));
if (params.get("as")) setSource(`link-${params.get("as")}`);

// UTM parameters into hidden fields
$$<HTMLInputElement>("[data-utm]").forEach((input) => (input.value = params.get(input.dataset.utm!) ?? ""));

// Click tracking and in-page deep links (no reload)
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
  if (link.hasAttribute("data-companies")) {
    track("Companies email click");
    setSource("companies");
  }
  if (link.hasAttribute("data-host-link")) setSource("hosts");

  const url = new URL(link.href, location.href);
  if (url.pathname === location.pathname && url.hash === "#request" && url.search) {
    e.preventDefault();
    const p = url.searchParams;
    preselect(p.get("as"), p.get("interest"));
    history.replaceState(null, "", `${url.search}#request`);
    requestSection?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
});

$$<HTMLDetailsElement>("[data-faq]").forEach((d) =>
  d.addEventListener("toggle", () => { if (d.open) track("FAQ open", { question: $("summary", d)?.textContent?.trim() ?? "" }); })
);

type Check = (form: HTMLFormElement) => string | null;
const value = (f: HTMLFormElement, name: string) => ((f.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "").trim();
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

const checks: Record<string, Check> = {
  name: (f) => (value(f, "name").length < 2 ? "Please add your full name." : null),
  email: (f) => {
    const v = value(f, "email");
    if (!v) return "Please add your email.";
    return emailOk(v) ? null : "Please check your email address.";
  },
  whatsapp: (f) => (value(f, "whatsapp").replace(/\D/g, "").length < 10 ? "Please add your WhatsApp number." : null),
  linkedin: (f) => (/linkedin\.com\/./i.test(value(f, "linkedin")) ? null : "Please add your LinkedIn link."),
  role: (f) => (value(f, "role") ? null : "Please add your role and company."),
  years: (f) => (value(f, "years") ? null : "Please choose your years of experience."),
  where: (f) => (value(f, "where") ? null : "Please choose where you are right now."),
  applying_as: (f) => ($("[name=applying_as]:checked", f) ? null : "Please choose how you're applying."),
  need: (f) => (value(f, "need") ? null : "Please tell us the one thing you need."),
  offer: (f) => (value(f, "offer") ? null : "Please tell us what you could offer."),
  consent: (f) => ((f.elements.namedItem("consent") as HTMLInputElement).checked ? null : "Please agree so we can review your application."),
};
const stepFields: Record<string, string[]> = {
  "1": ["name", "email", "whatsapp", "linkedin", "role", "years", "where", "applying_as"],
  "2": ["need", "offer", "consent"],
};

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

function validate(f: HTMLFormElement, names: string[]) {
  let first: string | null = null;
  for (const name of names) {
    const message = checks[name](f);
    showError(f, name, message);
    if (message && !first) first = name;
  }
  if (first) {
    const el = $<HTMLElement>(`[name="${first}"]`, f);
    el?.focus();
  }
  return !first;
}

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
    if (!validate(form, stepFields["1"])) return;
    track("Form step 1 complete", { source: inviteSource });
    goTo("2");
  });
  $("[data-back]", form)?.addEventListener("click", () => goTo("1"));

  // Clear an error as soon as it is fixed
  form.addEventListener("input", (e) => {
    const name = (e.target as HTMLInputElement).name;
    if (checks[name] && $(`[data-field="${name}"] [data-error]:not(.hidden)`, form)) showError(form, name, checks[name](form));
  });
  form.addEventListener("change", (e) => {
    const name = (e.target as HTMLInputElement).name;
    if (checks[name]) showError(form, name, checks[name](form));
  });

  // Character counters
  $$<HTMLTextAreaElement>("textarea[maxlength]", form).forEach((ta) => {
    const counter = ta.parentElement && $("[data-count]", ta.parentElement);
    const update = () => counter && (counter.textContent = `${ta.value.length} / ${ta.maxLength}`);
    ta.addEventListener("input", update);
    update();
  });

  // Ranking: each number used once; picking a taken number swaps it
  const rankSelects = $$<HTMLSelectElement>("[data-rank-select]", form);
  rankSelects.forEach((sel) => {
    let previous = sel.value;
    sel.addEventListener("focus", () => (previous = sel.value));
    sel.addEventListener("change", () => {
      const clash = rankSelects.find((o) => o !== sel && o.value && o.value === sel.value);
      if (clash) clash.value = previous;
      previous = sel.value;
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.dataset.current !== "2") {
      // Enter pressed on step 1
      $<HTMLButtonElement>("[data-next]", form)?.click();
      return;
    }
    if (!validate(form, stepFields["2"])) return;

    const button = $<HTMLButtonElement>("[data-submit]", form)!;
    const formError = $("[data-form-error]", form)!;
    button.disabled = true;
    button.textContent = "Sending…";
    formError.classList.add("hidden");

    try {
      await post(form);
      track("Form submitted", { source: inviteSource, applying_as: value(form, "applying_as") });
      const first = value(form, "name").split(/\s+/)[0];
      $("[data-first-name]", card)!.textContent = first;
      form.classList.add("hidden");
      const thanks = $("[data-thanks]", card)!;
      thanks.classList.remove("hidden");
      if (store.get("dd-newsletter") !== "1") {
        const newsletter = $("[data-newsletter]");
        if (newsletter) $("[data-thanks-newsletter]", thanks)?.append(newsletter);
      } else {
        $("[data-newsletter]")?.classList.add("hidden");
      }
      thanks.focus();
    } catch {
      // Answers stay in the form
      formError.textContent = "Something went wrong and your request was not sent. Please try again.";
      formError.classList.remove("hidden");
    } finally {
      button.disabled = false;
      button.textContent = "Send my request";
    }
  });
}

/* Newsletter */
$$<HTMLFormElement>("[data-newsletter-form]").forEach((nf) => {
  const wrap = nf.closest<HTMLElement>("[data-newsletter]")!;
  const error = $("[data-error]", wrap)!;
  const email = $<HTMLInputElement>("[name=email]", nf)!;
  if (!$("[data-source]", nf)?.getAttribute("value")) $<HTMLInputElement>("[data-source]", nf)!.value = "newsletter-row";

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
      store.set("dd-newsletter", "1");
      track("Newsletter submitted");
      nf.classList.add("hidden");
      $("[data-success]", wrap)?.classList.remove("hidden");
    } catch {
      error.textContent = "That didn't go through. Please try again.";
      error.classList.remove("hidden");
    }
  });
});

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
