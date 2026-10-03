// Site-wide settings. Values in [brackets] are placeholders: they render as "#" links
// until filled. Search the repo for "[" to find them.
export const site = {
  name: "DD Network",
  title: "DD Network | The room you've been looking for",
  description:
    "DD Network is a curated professional network for women building their next chapter. Starting with Mumbai, chapter one brings 50 founding women into the room.",
  ogTitle: "The room you've been looking for.",
  ogDescription: "DD Network · First chapter: Mumbai · 50 founding seats",
  deadline: "15 November 2026",
  replyTime: "7 days",
  contactEmail: "[email]",
  links: {
    community: "[free DD community url]",
    instagram: "[instagram url]",
    linkedin: "[linkedin url]",
  },
  // Set one or both to switch analytics on. Events go to whichever is set.
  analytics: {
    plausibleDomain: "",
    ga4Id: "",
  },
};

export const isPlaceholder = (value: string) => value.startsWith("[");

// A placeholder URL renders as "#" so the link still works while it is being filled.
export const href = (value: string) => (isPlaceholder(value) ? "#" : value);

export const mailto = (subject: string) =>
  isPlaceholder(site.contactEmail) ? "#" : `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}`;

// Navigation, in the order from the brief. "For companies" goes to its own page.
export const nav = [
  { label: "The room", href: "/#the-room" },
  { label: "Membership", href: "/#membership" },
  { label: "Circle", href: "/#circle" },
  { label: "For companies", href: "/companies" },
  { label: "FAQ", href: "/#faq" },
];
