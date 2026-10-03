// Runs on every verified Netlify Forms submission (Netlify calls functions named
// "submission-created" automatically). Netlify Forms keeps every submission either way;
// this forwards copies when the keys below are set in Site settings > Environment variables.
//
//   AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE  (invite form to Airtable)
//   BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID            (newsletter to Beehiiv)
//
// Substack has no public subscribe API. If the DD newsletter is on Substack, export
// the "newsletter" form from Netlify and import it into Substack.

export default async (req) => {
  const { payload } = await req.json();
  const form = payload?.form_name;
  const data = payload?.data ?? {};

  try {
    if (form === "invite") await toAirtable(data);
    if (form === "newsletter") await toNewsletter(data.email);
  } catch (err) {
    // Log and carry on: the submission is already safe in Netlify Forms.
    console.error(`Forwarding ${form} submission failed:`, err);
  }
  return new Response("ok");
};

async function toAirtable(d) {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE = "Applications" } = process.env;
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    // TODO: add the Airtable keys above to switch this on. Field names must match the table's columns.
    console.log("Airtable not configured; invite kept in Netlify Forms only.");
    return;
  }
  const fields = {
    Name: d.name,
    Email: d.email,
    WhatsApp: d.whatsapp,
    LinkedIn: d.linkedin,
    "Role and company": d.role,
    "Years of experience": d.years,
    "Right now": d.where,
    "Applying as": d.applying_as,
    "Need in 90 days": d.need,
    "Could offer": d.offer,
    "Rank: room": d.rank_room,
    "Rank: seen": d.rank_seen,
    "Rank: introduced": d.rank_introduced,
    Interest: d.interest,
    "Heard via": d.heard,
    Consent: d.consent === "yes",
    Source: d.source,
    "UTM source": d.utm_source,
    "UTM medium": d.utm_medium,
    "UTM campaign": d.utm_campaign,
    "UTM term": d.utm_term,
    "UTM content": d.utm_content,
  };
  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
}

async function toNewsletter(email) {
  const { BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID } = process.env;
  if (!email) return;
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.log("Newsletter tool not configured; email kept in Netlify Forms only.");
    return;
  }
  const res = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, reactivate_existing: true, send_welcome_email: true, utm_source: "ddnetwork-site" }),
  });
  if (!res.ok) throw new Error(`Beehiiv ${res.status}: ${await res.text()}`);
}
