/* ==========================================================================
   DD NETWORK — SITE CONFIGURATION
   --------------------------------------------------------------------------
   Everything that is likely to change lives in this one file:
   hero copy, pricing, benefits, founding count, members, hosts, founder,
   FAQ, images, CTA links, form endpoints and analytics IDs.

   Edit the values below and refresh the page. No build step required.
   ========================================================================== */

/**
 * Helper for Unsplash images. Pass the short photo ID from an Unsplash URL,
 * e.g. https://unsplash.com/photos/two-women-talking-RaFA0-pomFE -> "RaFA0-pomFE".
 * To use your own photography instead, replace any `src` with a normal URL or
 * a local path like "assets/img/dinner-01.jpg". Layout does not depend on
 * image dimensions — every image is cropped to its slot with object-fit.
 */
function unsplash(id, width) {
  return "https://unsplash.com/photos/" + id + "/download?w=" + (width || 1600);
}

window.DD_CONFIG = {
  /* ------------------------------------------------------------------------
     CALLS TO ACTION
     By default both CTAs scroll to the on-page forms. Point them at an
     external form (Typeform, Tally, Google Form) by replacing the href.
     ------------------------------------------------------------------------ */
  cta: {
    inviteLabel: "Request an Invite",
    inviteHref: "#invite",
    newsletterLabel: "Join the Newsletter",
    newsletterHref: "#newsletter",
  },

  /* ------------------------------------------------------------------------
     HERO
     ------------------------------------------------------------------------ */
  hero: {
    headline: "Meet the women who can change what’s <em>next.</em>",
    intro:
      "DD Network is a curated professional network for women in marketing, media and creative work who are figuring out their next move.",
    secondary:
      "You tell us what you’re trying to do. We help you find the people who can help.",
    meta: ["Founding membership", "Mumbai", "Limited first cohort"],
    image: {
      src: unsplash("5Q-1qKP8HKY", 1800),
      alt: "People walking along the Mumbai coastline in the evening",
    },
  },

  /* ------------------------------------------------------------------------
     MEMBERSHIP & PRICING
     Pricing is still being tested (~₹7,500 / ₹12,000 / ₹18,000).
     Change `amount` and the page updates everywhere it is shown.

     - One tier  -> shown as a single founding membership.
     - 2–3 tiers -> shown side by side. Keep `includes` almost identical and
       use `difference` to say, in one line, why the tier exists.
     - `altPrice` is optional, e.g. { amount: 3500, period: "quarter" }.
     ------------------------------------------------------------------------ */
  pricing: {
    currency: "INR",
    lockNote: "Founding members keep their founding rate for two years.",
    tiers: [
      {
        name: "Founding Member",
        amount: 12000,
        period: "year",
        altPrice: null,
        difference: "",
        includes: [
          "Personal onboarding",
          "Access to DD Network",
          "Monthly member asks",
          "Curated, double opt-in introductions",
          "Member-to-member opportunities",
          "Welcome dinner",
          "Access to small DD rooms",
          "Member pricing on workshops",
          "Founding Member status",
          "Early access to future DD Network experiences",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------------
     FOUNDING MEMBERS
     `total` is the size of the founding cohort. Add people to `members` as
     they join and their slot turns into a portrait. Set `showCount` to true
     when you are happy to show how many seats are taken.
     ------------------------------------------------------------------------ */
  founding: {
    total: 50,
    showCount: false,
    members: [
      // { name: "Name Surname", role: "Brand Director", photo: "assets/img/members/01.jpg" },
    ],
    benefits: [
      "Founding Member status",
      "Founding price locked for two years",
      "Early access to new experiences",
      "A say in the network’s rituals",
      "Priority access to future Circles",
      "Two invitations to bring relevant women in",
    ],
  },

  /* ------------------------------------------------------------------------
     FOUNDING HOSTS
     Leave `name` empty to show an "announcing soon" placeholder.
     ------------------------------------------------------------------------ */
  hosts: {
    target: "10–15",
    people: [
      // Example once confirmed:
      // { name: "Name Surname", role: "Founder, Studio X", quote: "I’ve made the move you’re trying to make.", photo: "assets/img/hosts/name.jpg" },
      { name: "", role: "Founder", quote: "", photo: "" },
      { name: "", role: "Creative Director", quote: "", photo: "" },
      { name: "", role: "Marketing Leader", quote: "", photo: "" },
      { name: "", role: "Editor & Writer", quote: "", photo: "" },
    ],
  },

  /* ------------------------------------------------------------------------
     FOUNDER
     ------------------------------------------------------------------------ */
  founder: {
    name: "Anshika",
    title: "Founder, Decoding Draupadi",
    bio:
      "Anshika built Decoding Draupadi to talk honestly about the lives of urban working women. DD Network is the next step: turning years of conversations into introductions that change what happens next.",
    photo: "", // e.g. "assets/img/anshika.jpg"
  },

  /* ------------------------------------------------------------------------
     IMAGES ELSEWHERE ON THE PAGE
     ------------------------------------------------------------------------ */
  images: {
    about: { src: unsplash("2ogkxH66ljU", 1200), alt: "A woman walking through the Dadar tunnel, Mumbai" },
    rooms: [
      { src: unsplash("4r3q8BuMOng", 1600), alt: "A group of women sitting around a table" },
      { src: unsplash("RaFA0-pomFE", 1200), alt: "Two women in conversation over dinner" },
      { src: unsplash("LQ1t-8Ms5PY", 1200), alt: "Two women sitting at a table, talking" },
    ],
    city: { src: unsplash("6SkV_fXOa3A", 1800), alt: "The Mumbai coastline in black and white" },
  },

  /* ------------------------------------------------------------------------
     FAQ
     ------------------------------------------------------------------------ */
  faq: [
    {
      q: "Is this a women’s networking group?",
      a: "It’s a professional network for women, but it doesn’t work like a networking group. There’s no feed and no mixer. You tell us what you’re trying to do and we make specific introductions.",
    },
    {
      q: "Who can join?",
      a: "Established women in marketing, media and creative work who are making a next move — and who have something to offer the women around them.",
    },
    {
      q: "Is membership application-only?",
      a: "Yes. Every request is read by a person. The network only works if every member is useful to the others.",
    },
    {
      q: "How are members selected?",
      a: "For relevance, not titles. We look at what you’re working towards, what you could help with, and who in the network you’d be useful to.",
    },
    {
      q: "What happens after I join?",
      a: "A personal onboarding conversation, then your first ask. You’ll be invited to a welcome dinner and start receiving introductions.",
    },
    {
      q: "How do introductions work?",
      a: "We propose people to you. You choose whether to meet. The other person chooses too. Nobody is introduced without saying yes.",
    },
    {
      q: "Are the dinners included?",
      a: "Your welcome dinner and access to small DD rooms are part of membership. Some workshops and experiences are separately priced, at member rates.",
    },
    {
      q: "Do I have to attend events?",
      a: "No. The rooms help, but introductions are the core of membership. Come when it’s useful.",
    },
    {
      q: "Can I invite someone?",
      a: "Founding members get two invitations to bring relevant women into the network. Anyone can also request an invite directly.",
    },
    {
      q: "What does founding member mean?",
      a: "You’re one of the first 50. You keep your founding rate for two years, get early access to what we build next, and help shape how the network works.",
    },
    {
      q: "How much does it cost?",
      a: "Founding membership is {price}. Everything it includes is listed in the Membership section above.",
    },
    {
      q: "Where are the first members based?",
      a: "Mumbai. The first rooms happen here.",
    },
    {
      q: "Is this only for people in marketing and media?",
      a: "That’s where we’re starting, because a focused network makes better introductions. Adjacent creative and business roles are welcome to apply.",
    },
  ],

  /* ------------------------------------------------------------------------
     FORMS
     `endpoint` decides where submissions go:
       ""          -> demo mode: nothing is sent, a console warning is shown.
       "netlify"   -> Netlify Forms (the forms are already marked up for it).
       any URL     -> POSTed as application/x-www-form-urlencoded. Works with
                      Formspree, Getform, Basin, Google Apps Script web apps,
                      Zapier/Make webhooks, Mailchimp-style proxies, etc.
     ------------------------------------------------------------------------ */
  forms: {
    invite: {
      endpoint: "",
      successTitle: "Thank you. We’ve got it.",
      successBody: "Every request is read personally. If it looks like a fit, we’ll be in touch to set up a short conversation.",
    },
    newsletter: {
      endpoint: "",
      successTitle: "You’re on the list.",
      successBody: "We’ll write when there’s something worth reading.",
    },
  },

  /* ------------------------------------------------------------------------
     ANALYTICS
     Fill in whichever you use; leave the rest empty. Every event is also
     pushed to window.dataLayer, so Google Tag Manager works too.
     Set `debug: true` to log every event to the browser console.
     ------------------------------------------------------------------------ */
  analytics: {
    ga4Id: "", // e.g. "G-XXXXXXXXXX"
    plausibleDomain: "", // e.g. "network.decodingdraupadi.com"
    debug: false,
  },
};
