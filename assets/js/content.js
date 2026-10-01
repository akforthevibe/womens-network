/* ==========================================================================
   DD NETWORK — EDITABLE CONTENT
   --------------------------------------------------------------------------
   Everything that is likely to change lives in this one file:
   prices, benefits, founding count, hosts, photos, links, forms, FAQ, hero.
   Edit the values below and refresh. No build step required.
   ========================================================================== */

window.DD_CONTENT = {

  /* ---------------------------------------------------------------------- */
  /* LINKS & CONVERSION                                                      */
  /* ---------------------------------------------------------------------- */
  links: {
    // Leave empty to use the built-in invite form (recommended).
    // Set to an external URL (e.g. a Typeform) to send every
    // "Request an Invite" button there instead.
    invite: "",
    // Same for the newsletter. Empty = built-in form.
    newsletter: "",
    decodingDraupadi: "https://www.instagram.com/decodingdraupadi/",
    dais: "",
    instagram: "https://www.instagram.com/decodingdraupadi/",
    contactEmail: "hello@decodingdraupadi.com"
  },

  /* ---------------------------------------------------------------------- */
  /* FORMS                                                                   */
  /* ---------------------------------------------------------------------- */
  forms: {
    // How submissions are delivered:
    //   "netlify"  — Netlify Forms (works automatically when deployed on Netlify)
    //   "endpoint" — POST JSON to the URLs below (Google Apps Script, Formspree,
    //                n8n, Make, Zapier, your own API…)
    // On localhost / file:// the forms run in demo mode and log to the console.
    mode: "netlify",
    inviteEndpoint: "",
    newsletterEndpoint: "",
    inviteSuccess: {
      title: "Thank you. We've got it.",
      body: "Every request is read personally. If it looks like a fit for the founding cohort, we'll be in touch to set up a short conversation."
    },
    newsletterSuccess: {
      title: "You're on the list.",
      body: "We'll write when there's something worth saying: new rooms, founding updates and the occasional good introduction story."
    }
  },

  /* ---------------------------------------------------------------------- */
  /* ANALYTICS                                                               */
  /* ---------------------------------------------------------------------- */
  analytics: {
    ga4Id: "",            // e.g. "G-XXXXXXXXXX"
    plausibleDomain: "",  // e.g. "network.decodingdraupadi.com"
    debug: false          // true = log every tracked event to the console
  },

  /* ---------------------------------------------------------------------- */
  /* HERO                                                                    */
  /* ---------------------------------------------------------------------- */
  hero: {
    headline: "Meet the women who can change <em>what's next.</em>",
    intro: "DD Network is a curated professional network for women in marketing, media and creative work who are figuring out their next move.",
    support: "You tell us what you're trying to do. We help you find the people who can help.",
    meta: ["Founding membership", "Mumbai", "Limited first cohort"],
    image: {
      src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
      alt: "A long table set for a small dinner, glasses catching the evening light",
      caption: "Dinner for ten. Everyone at the table chosen for a reason."
    }
  },

  /* ---------------------------------------------------------------------- */
  /* MEMBERSHIP / PRICING                                                    */
  /* Pricing is being tested at ~₹7,500 / ₹12,000 / ₹18,000.                 */
  /* One tier = single founding layout. Two or three = side-by-side.         */
  /* ---------------------------------------------------------------------- */
  membership: {
    currency: "₹",
    showPrices: true,       // false = "Founding rate shared with your invite"
    tiers: [
      {
        name: "Founding Member",
        price: 12000,
        period: "year",
        altPrice: 3500,       // set to null to hide the quarterly option
        altPeriod: "quarter",
        forWhom: "For women who want the network working for them all year.",
        extras: []            // tier-specific extras (used only with 2+ tiers)
      }
      /*
      Example of a second tier — uncomment and edit to show side-by-side:
      ,{
        name: "Founding Member + Rooms",
        price: 18000,
        period: "year",
        altPrice: null,
        forWhom: "For women who want to be in a room every month.",
        extras: ["A seat at one small dinner every month", "Priority on workshops"]
      }
      */
    ],
    included: [
      "Personal onboarding",
      "Access to DD Network",
      "Monthly member asks",
      "Curated, double opt-in introductions",
      "Member-to-member opportunities",
      "A welcome dinner",
      "Access to small DD rooms",
      "Member pricing on workshops",
      "Founding Member status",
      "Early access to future DD Network experiences"
    ],
    note: "Founding members keep their founding rate for two years."
  },

  /* ---------------------------------------------------------------------- */
  /* FOUNDING MEMBERS                                                        */
  /* Add members as they join; their slot fills with name + photo.           */
  /* ---------------------------------------------------------------------- */
  founding: {
    total: 50,
    showCount: false,        // true = show "12 of 50 places taken"
    members: [
      // { name: "Name Surname", role: "Brand Director", photo: "assets/img/members/name.jpg" }
    ],
    benefits: [
      "Founding Member status, permanently",
      "Your founding price, locked for two years",
      "Early access to every new DD experience",
      "A say in the rituals the network is built on",
      "Priority access to future Circles",
      "Two invitations to bring women you rate into the network"
    ]
  },

  /* ---------------------------------------------------------------------- */
  /* FOUNDING HOSTS                                                          */
  /* photo: "" shows an elegant placeholder until a portrait is added.       */
  /* ---------------------------------------------------------------------- */
  hosts: {
    range: "10–15",          // shown in the copy: "10–15 Founding Hosts"
    commitments: [
      "Host one small dinner",
      "Take two or three relevant introduction requests",
      "Hold one office-hours session",
      "Refer two women to the network",
      "Share one member story or interview"
    ],
    inReturn: "In return, hosts receive complimentary or discounted membership and visibility across Decoding Draupadi and Dais.",
    profiles: [
      { name: "", role: "Founder", line: "I've built the thing you're thinking of building.", photo: "" },
      { name: "", role: "Creative Director", line: "I've hired the freelancers you're trying to find.", photo: "" },
      { name: "", role: "Marketing Leader", line: "I've made the move you're trying to make.", photo: "" },
      { name: "", role: "Editor & Speaker", line: "I know which stages are worth standing on.", photo: "" }
    ]
  },

  /* ---------------------------------------------------------------------- */
  /* FOUNDER                                                                 */
  /* ---------------------------------------------------------------------- */
  founder: {
    name: "Anshika",
    title: "Founder, Decoding Draupadi",
    // TODO: replace with Anshika's own short bio (2–3 sentences).
    bio: "Anshika started Decoding Draupadi to talk honestly about the lives of urban working women. Years of conversations later, she kept noticing the same thing: the women in her community could solve most of each other's problems, if only they knew each other. DD Network is her answer.",
    photo: "",               // e.g. "assets/img/anshika.jpg"
    link: ""                 // e.g. LinkedIn URL
  },

  /* ---------------------------------------------------------------------- */
  /* IMAGERY (replace any src with a local path or another URL)              */
  /* ---------------------------------------------------------------------- */
  images: {
    roomsA: {
      src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
      alt: "A warm, low-lit restaurant interior before guests arrive"
    },
    roomsB: {
      src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80",
      alt: "A woman mid-conversation in a bright workspace"
    },
    roomsC: {
      src: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80",
      alt: "Coffee on a table, close up"
    },
    city: {
      src: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1800&q=80",
      alt: "Mumbai's sea link at dusk"
    },
    work: {
      src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      alt: "A quiet, light-filled studio space"
    }
  },

  /* ---------------------------------------------------------------------- */
  /* FAQ                                                                     */
  /* ---------------------------------------------------------------------- */
  faq: [
    {
      q: "Is this a women's networking group?",
      a: "It's a professional network for women, but it isn't a group you join and then wait in. The point is introductions: you tell us what you're working on, we find the women who can help, and we make the connection."
    },
    {
      q: "Who can join?",
      a: "Established women in marketing, media and creative work, starting in Mumbai. Typically you've got real experience behind you and a next move in front of you."
    },
    {
      q: "Is membership application-only?",
      a: "Yes. You request an invite, we read it personally, and if it looks like a fit we'll have a short conversation before offering a place."
    },
    {
      q: "How are members selected?",
      a: "For how useful the room will be to each other. We look at what you're working towards, what you can offer, and whether the network as it stands can genuinely help. It isn't about titles or follower counts."
    },
    {
      q: "What happens after I join?",
      a: "A personal onboarding call, an invitation to a welcome dinner, and your first monthly ask. From there, introductions and rooms follow based on what you're trying to make happen."
    },
    {
      q: "How do introductions work?",
      a: "You share an ask. We look through the network and suggest people. Both sides say yes before anyone is introduced. Then we follow up to see what happened."
    },
    {
      q: "Are the dinners included?",
      a: "Your welcome dinner is included. Small dinners and rooms are open to members; some are included and some are ticketed at member pricing. We'll always say which is which upfront."
    },
    {
      q: "Do I have to attend events?",
      a: "No. Rooms are one way relationships start, not an attendance requirement. Some members mostly use introductions. That's fine."
    },
    {
      q: "Can I invite someone?",
      a: "Founding members get two invitations to bring in women they rate. Anyone else can request an invite directly."
    },
    {
      q: "What does founding member mean?",
      a: "You're one of the first 50. You keep your founding rate for two years, get early access to everything new, and help shape how the network works."
    },
    {
      q: "How much does it cost?",
      // {{price}} is replaced automatically with the first tier's price.
      a: "Founding membership is {{price}}. You're paying for curation, matching and introductions, not for a feed or a directory."
    },
    {
      q: "Where are the first members based?",
      a: "Mumbai. The first rooms happen here. We'll open to other cities once the network here is genuinely useful."
    },
    {
      q: "Is this only for people in marketing and media?",
      a: "To start, mostly, along with design, content, communications and adjacent creative work. A tight starting point makes for better introductions. We'll widen it carefully."
    }
  ]
};
