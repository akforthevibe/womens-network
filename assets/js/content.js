/* ==========================================================================
   DD NETWORK — EDITABLE CONTENT
   --------------------------------------------------------------------------
   Everything likely to change lives in this one file.
   After editing, run:   node scripts/build.mjs
   (Netlify runs this automatically on every deploy.)
   The build writes this content straight into index.html, so prices, FAQ
   and hosts are real HTML: visible to search engines, link previews and
   anyone reading without JavaScript.
   ========================================================================== */

window.DD_CONTENT = {

  /* ---------------------------------------------------------------------- */
  /* LINKS                                                                   */
  /* ---------------------------------------------------------------------- */
  links: {
    // Empty = built-in forms (recommended). A URL = send buttons there instead.
    invite: "",
    newsletter: "",
    instagram: "https://www.instagram.com/decodingdraupadi/",  // TODO: confirm
    contactEmail: "hello@decodingdraupadi.com"                  // TODO: confirm
  },

  /* ---------------------------------------------------------------------- */
  /* FORMS                                                                   */
  /* "netlify" = Netlify Forms. "endpoint" = POST JSON to the URLs below     */
  /* (Google Apps Script, Formspree, n8n, Make, Zapier…).                    */
  /* ---------------------------------------------------------------------- */
  forms: {
    mode: "netlify",
    inviteEndpoint: "",
    newsletterEndpoint: "",
    inviteSuccess: {
      title: "Thank you. We've got it.",
      body: "A person will read this, not a filter. If it looks like a fit for the founding cohort, we'll be in touch to set up a short conversation. If it isn't the right moment, we'll tell you that too."
    },
    newsletterSuccess: {
      title: "You're on the list.",
      body: "Occasional notes on new rooms, interesting women and what we're building. No weekly content dump."
    }
  },

  /* ---------------------------------------------------------------------- */
  /* ANALYTICS                                                               */
  /* ---------------------------------------------------------------------- */
  analytics: {
    ga4Id: "",            // e.g. "G-XXXXXXXXXX"
    plausibleDomain: "",  // e.g. "network.decodingdraupadi.com"
    debug: false
  },

  /* ---------------------------------------------------------------------- */
  /* HERO                                                                    */
  /* ---------------------------------------------------------------------- */
  hero: {
    headline: "Meet the women who can change <em>what's next.</em>",
    mechanism: "Tell us what you're trying to make happen. We'll help you find the women who can help.",
    intro: "DD Network is a professional network built around introductions, for women in marketing, media and creative work in Mumbai.",
    image: {
      src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
      alt: "A long table set for a small dinner, glasses catching the evening light",
      caption: "Ten women at a table. Each one there for a reason."
    }
  },

  // The short credibility line that sits directly under the hero.
  credibility: "<strong>Built by Decoding Draupadi.</strong> For 3+ years, DD has built a community of working women through media, events and conversation. DD Network turns those relationships into introductions.", // TODO: confirm "3+ years"

  /* ---------------------------------------------------------------------- */
  /* MEMBERSHIP & PRICE                                                      */
  /* One tier = single founding price. Add tiers to show side-by-side.       */
  /* ---------------------------------------------------------------------- */
  membership: {
    currency: "₹",
    tiers: [
      {
        name: "Founding Member",
        price: 12000,          // TODO: final founding price (testing 7,500 / 12,000 / 18,000)
        period: "year",
        forWhom: "One membership. Everything below included. No upsell to unlock the useful part."
      }
    ],
    included: [
      "Your monthly ask",
      "Curated, double opt-in introductions",
      "A welcome dinner",
      "Monthly small rooms, matched to your context",
      "Member pricing on workshops and DD experiences",
      "Access to the founding network",
      "Founding Member status"
    ],
    note: "Your founding rate is locked for two years. You only pay once you've been accepted."
  },

  // "Your year as a member": the cadence. TODO: confirm every line.
  rhythm: [
    { when: "Every month",          what: "Your ask",        detail: "One question: what are you trying to make happen?" },
    { when: "When there's a match", what: "Introductions",   detail: "Proposed by us, agreed by both of you. No quota. One useful introduction beats five polite ones." },
    { when: "When you join",        what: "Welcome dinner",  detail: "Included. Your first room, with other new members." },
    { when: "Every month",          what: "A small room",    detail: "A dinner or session of 8–12 women. You're invited to the ones that fit your context." },
    { when: "Through the year",     what: "Workshops",       detail: "Practical sessions with women from the network and Dais, at member pricing." }
  ],

  /* ---------------------------------------------------------------------- */
  /* FOUNDING 50                                                             */
  /* ---------------------------------------------------------------------- */
  founding: {
    total: 50,
    taken: 0,               // update as members are accepted
    showTaken: false,       // true = "12 of 50 places taken"
    benefits: [
      { title: "Founding Member status", detail: "Permanently. You were here first, and the network will know it." },
      { title: "Your price, locked for two years", detail: "Whatever membership costs later, yours doesn't move." },
      { title: "First access to new rooms", detail: "Every new dinner, workshop and Circle opens to founding members first." },
      { title: "Priority on introductions", detail: "When a new member joins who fits your ask, you hear first." },
      { title: "The founders' dinner", detail: "An evening for the first 50 and the Founding Hosts." },
      { title: "Two invitations", detail: "Bring two women you rate into the network, without the waitlist." }
    ]
  },

  /* ---------------------------------------------------------------------- */
  /* FOUNDING HOSTS                                                          */
  /* name: "" shows "Announcing soon". Add photo paths as hosts confirm.     */
  /* ---------------------------------------------------------------------- */
  hosts: {
    range: "10–15",
    profiles: [
      { name: "", role: "Founder", line: "I've built the thing you're thinking of building.", room: "Building an independent practice", photo: "" },
      { name: "", role: "Marketing Leader", line: "I've made the move you're trying to make.", room: "Agency to brand, without starting over", photo: "" },
      { name: "", role: "Creative Director", line: "I've hired the freelancers you're trying to find.", room: "Hiring well when you're small", photo: "" },
      { name: "", role: "Editor & Speaker", line: "I know which stages are worth standing on.", room: "Getting on the right stages", photo: "" }
    ],
    commitments: [
      "Host one small dinner",
      "Take two or three introduction requests",
      "Hold one office-hours session",
      "Refer two women to the network",
      "Share one member story"
    ]
  },

  /* ---------------------------------------------------------------------- */
  /* FOUNDER                                                                 */
  /* ---------------------------------------------------------------------- */
  founder: {
    name: "Anshika Kushwaha",
    title: "Founder, Decoding Draupadi",
    bio: "For years, Anshika has been building relationships with working women across Mumbai through content, community and conversation. DD Network is the next layer: making those relationships useful when someone needs a person, an opportunity or a way in.",
    photo: "",              // TODO: e.g. "assets/img/anshika.jpg" (strongly recommended)
    link: ""                // e.g. LinkedIn URL
  },

  /* ---------------------------------------------------------------------- */
  /* IMAGERY: any URL or local path (e.g. assets/img/dinner.jpg)             */
  /* ---------------------------------------------------------------------- */
  images: {
    roomsA: { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80", alt: "A warm, low-lit dining room before guests arrive" },
    roomsB: { src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80",  alt: "A woman mid-conversation in a bright workspace" },
    who:    { src: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1000&q=80", alt: "Two women talking across a table" }
  },

  /* ---------------------------------------------------------------------- */
  /* FAQ: {{price}} is replaced with the founding price.                     */
  /* ---------------------------------------------------------------------- */
  faq: [
    { q: "Is this a women's networking group?",
      a: "No. It's a professional network built around introductions. You don't join and then hope to bump into the right person. You tell us what you need, and we find her." },
    { q: "Who can apply?",
      a: "Established women in marketing, media and creative work in Mumbai: real experience behind you, a next move in front of you, and something you can offer another woman." },
    { q: "Is membership paid?",
      a: "Yes. Founding membership is {{price}}. You only pay once you've been accepted." },
    { q: "What does membership include?",
      a: "Your monthly ask, curated introductions, a welcome dinner, monthly small rooms, member pricing on workshops, and Founding Member status. One price, everything included." },
    { q: "How are members selected?",
      a: "Personally, for how useful the room will be to one another. We look at what you're working towards and what you can offer. Not titles, not follower counts." },
    { q: "What happens after I apply?",
      a: "We read every request ourselves. If it looks like a fit, we'll set up a short conversation. If it isn't the right moment, we'll tell you." },
    { q: "How do introductions work?",
      a: "You share your ask. We look through the network ourselves (people, not an algorithm) and propose someone. Each of you sees why, and both of you say yes before anyone is connected. Then we follow up." },
    { q: "How often will I get introductions?",
      a: "Whenever there's a genuine match. There's no quota, because one useful introduction beats five polite ones. Your ask stays open as new women join." },
    { q: "What if there's no one right for me yet?",
      a: "We'll tell you honestly rather than send a filler introduction. Your ask stays open, and as the network grows, so do the odds." },
    { q: "Do I have to attend events?",
      a: "No. Rooms are where relationships often start, but they're not compulsory. Some members mostly use introductions." },
    { q: "Is there a WhatsApp group?",
      a: "No. There's no group chat to keep up with and no feed to check. Introductions happen one to one. Rooms are announced to the women they're meant for." },
    { q: "Where is DD Network based?",
      a: "Mumbai. The first cohort and the first rooms are here." },
    { q: "Can women outside Mumbai join?",
      a: "Not in the founding cohort, because the rooms are in Mumbai. Join the DD Network letter and we'll write when we open to more cities." },
    { q: "Is it only for marketing and media?",
      a: "To start, mostly, along with design, content, communications and adjacent creative work. A focused start makes for better introductions." }
  ]
};
