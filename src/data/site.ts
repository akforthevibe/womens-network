// Placeholders stay in [brackets] until confirmed. Search the repo for "[" to find them.
export const site = {
  title: "DD Network | The room you've been looking for",
  description:
    "A private, curated network for women in Mumbai. Member gets you into the room; Circle helps you use it. From ₹25,000 a year, by application.",
  intakeCloses: "[date]",
  proof: {
    members: "[7,000+]",
    years: "[4]",
    events: "[X]",
    press: "[press]",
  },
  welcomeDinner: "[3 weeks]",
  circleOpening: "[early 2027]",
  replyTime: "[7 days]",
  companiesReplyTime: "[3 working days]",
  refundPolicy: "[Refund policy to confirm.]",
  contactEmail: "[email]",
  newsletterTool: "[Substack or Beehiiv]",
  links: {
    whatsappGroup: "[link]",
    instagram: "[instagram url]",
    linkedin: "[linkedin url]",
  },
  // A real example for the Visibility tile, e.g. "Recently: Asha Rao on the DD podcast, September."
  // The line stays hidden while this is empty.
  visibilityExample: "",
  // Set one or both to switch analytics on. Events go to whichever is set.
  analytics: {
    plausibleDomain: "",
    ga4Id: "",
  },
};

export const isPlaceholder = (value: string) => value.startsWith("[");

// A placeholder URL is rendered as "#" so the link still works while it is being filled.
export const href = (value: string) => (isPlaceholder(value) ? "#" : value);
