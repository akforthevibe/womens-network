// Placeholders stay in [brackets] until confirmed. Search the repo for "[" to find them.
export const site = {
  title: "DD Network | A private network for women building their next chapter",
  description:
    "For women in Mumbai building their next chapter, inside a company or on their own. Get into the room. Get seen. Get introduced. Founding intake open.",
  proofCount: "[7,000+]",
  circleOpening: "[early 2027]",
  intakeCloses: "[date]",
  replyTime: "[7 days]",
  refundPolicy: "[Refund policy to confirm.]",
  contactEmail: "[email]",
  newsletterTool: "[Substack or Beehiiv]",
  links: {
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

// A placeholder URL is rendered as "#" so the link still works while it is being filled.
export const href = (value: string) => (isPlaceholder(value) ? "#" : value);
