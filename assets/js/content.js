/* ==========================================================================
   DD NETWORK: EDITABLE SETTINGS
   --------------------------------------------------------------------------
   Every value still to be confirmed before launch lives here.
   After editing, run:   node scripts/build.mjs
   (Netlify runs this automatically on every deploy.)

   The build writes these values straight into index.html and privacy.html,
   so prices and numbers are real HTML that search engines, link previews and
   anyone reading without JavaScript can see.

   To review every placeholder on the live page, open it with ?placeholders
   at the end of the URL. Each value from this file gets a dotted outline.
   ========================================================================== */

window.DD_CONTENT = {

  /* ---------------------------------------------------------------------- */
  /* PLACEHOLDERS TO CONFIRM (Anshika)                                       */
  /* ---------------------------------------------------------------------- */
  placeholders: {
    foundingSeats: "50",            // plan says 40–50
    memberPrice: "12,000",          // founding price per year, ₹
    memberUsualPrice: "18,000",     // usual price per year, ₹
    memberQuarterly: "3,500",       // per quarter, ₹
    circlePrice: "40,000",          // per year, ₹ (plan range 30–50k)
    circleOpening: "early 2027",
    hostCount: "10–15",
    intakeClose: "",                // e.g. "31 December 2026". Empty = "Intake closes when seats are filled."
    replyDays: "7",                 // reply time on applications
    refundDays: "90",               // refund window. Policy still needs a decision.
    communitySize: "7,000+",        // DD community size to cite
    contactEmail: "hello@decodingdraupadi.com", // TODO: confirm
    domain: "ddnetwork.in"          // TODO: confirm. Used for canonical URL and share image
  },

  /* ---------------------------------------------------------------------- */
  /* FOUNDING HOSTS                                                          */
  /* The names row stays hidden until this list has at least one name.      */
  /* { name: "Full Name", title: "One-line title" }                         */
  /* ---------------------------------------------------------------------- */
  hosts: [],

  /* ---------------------------------------------------------------------- */
  /* LINKS                                                                   */
  /* ---------------------------------------------------------------------- */
  links: {
    decodingDraupadi: "https://www.instagram.com/decodingdraupadi/", // TODO: confirm (website if there is one)
    draupadiOnTheDais: "https://www.instagram.com/decodingdraupadi/", // TODO: replace with the Draupadi on the Dais link
    instagram: "https://www.instagram.com/decodingdraupadi/",         // TODO: confirm
    linkedin: "https://www.linkedin.com/company/decoding-draupadi/"   // TODO: confirm
  },

  /* ---------------------------------------------------------------------- */
  /* ANALYTICS (fill one or both; leave empty to switch off)                 */
  /* ---------------------------------------------------------------------- */
  analytics: {
    ga4Id: "",            // e.g. "G-XXXXXXX"
    plausibleDomain: ""   // e.g. "ddnetwork.in"
  },

  /* ---------------------------------------------------------------------- */
  /* PHOTOS                                                                  */
  /* Unsplash photo ids (the last part of an unsplash.com/photos/… URL).    */
  /* `npm run images` downloads each one, applies the warm, slightly        */
  /* desaturated treatment, and writes WebP files to assets/img/.           */
  /* Credits are shown in the footer, as Unsplash asks.                     */
  /* ---------------------------------------------------------------------- */
  images: {
    hero:    { unsplash: "RaFA0-pomFE", credit: "laura adai",   alt: "Two women in conversation across a dinner table in soft evening light" },
    paying:  { unsplash: "9PvmjZ5PBIM", credit: "tommao wang",  alt: "Two women talking closely over coffee in a quiet cafe" },
    hosts:   { unsplash: "od-2xks9Alc", credit: "sean Kong",    alt: "A woman in silhouette, in profile by a window" },
    who:     { unsplash: "5Q-1qKP8HKY", credit: "Unsplash",     alt: "People walking along the Mumbai sea front at dusk" },
    request: { unsplash: "NKl3GUEbrFo", credit: "Raphael Renter", alt: "Candles and glasses on a dinner table" }
  }
};
