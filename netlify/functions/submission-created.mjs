// Runs on every verified Netlify Forms submission (Netlify calls functions named
// "submission-created" automatically). Netlify Forms keeps every submission either way;
// this forwards copies when the keys below are set in Site settings > Environment variables.
//
//   AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE  (invite form to Airtable)
//   AIRTABLE_COMPANIES_TABLE                           (companies form, same base)
//   BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID            (newsletter to Beehiiv)
//
// Substack has no public subscribe API. If the DD newsletter is on Substack, export
// the "newsletter" form from Netlify and import it into Substack.

export default async (req) => {
  const { payload } = await req.json();
  const form = payload?.form_name;
  const data = payload?.data ?? {};

  try {
    if (form === "invite") await toAirtable(inviteFields(data), process.env.AIRTABLE_TABLE || "Applications");
    if (form === "companies") await toAirtable(companyFields(data), process.env.AIRTABLE_COMPANIES_TABLE || "Companies");
    if (form === "newsletter") await toNewsletter(data.email);
  } catch (err) {
    // Log and carry on: the submission is already safe in Netlify Forms.
    console.error(`Forwarding ${form} submission failed:`, err);
  }
  return new Response("ok");
};

function inviteFields(d) {
  return {
    Name: d.name,
    Email: d.email,
    WhatsApp: d.whatsapp,
    LinkedIn: d.linkedin,
    "Describes her": d.describes,
    "Interested in": d.interest,
    "Need in 90 days": d.need,
    "Could offer": d.offer,
    "Heard via": d.heard,
    Consent: d.consent === "yes",
    Source: d.source,
    ...utmFields(d),
  };
}

function companyFields(d) {
  return { Company: d.company, Name: d.name, "Work email": d.email, Role: d.role, Seats: Number(d.seats) || d.seats, Product: d.product, ...utmFields(d) };
}

function utmFields(d) {
  return { "UTM source": d.utm_source, "UTM medium": d.utm_medium, "UTM campaign": d.utm_campaign, "UTM term": d.utm_term, "UTM content": d.utm_content };
}

async function toAirtable(fields, table) {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    // TODO: add the Airtable keys above to switch this on. Field names must match the table's columns.
    console.log(`Airtable not configured; ${table} entry kept in Netlify Forms only.`);
    return;
  }
  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`, {
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
