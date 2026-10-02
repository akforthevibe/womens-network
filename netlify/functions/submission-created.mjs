// Runs automatically on Netlify after every verified (non-spam) form submission.
// - "invite" submissions go to Airtable, one row per application.
// - "newsletter" submissions go to Beehiiv if it is configured, and always to Airtable.
// Every key below is optional; anything not set is skipped. The submission is always
// kept in Netlify Forms too, so nothing is lost if Airtable or Beehiiv is down.
//
// Environment variables (Netlify > Site configuration > Environment variables):
//   AIRTABLE_TOKEN            personal access token with data.records:write on the base
//   AIRTABLE_BASE_ID          appXXXXXXXXXXXXXX
//   AIRTABLE_INVITES_TABLE    default "Applications"
//   AIRTABLE_NEWSLETTER_TABLE default "Newsletter"
//   BEEHIIV_API_KEY           only if the DD newsletter runs on Beehiiv
//   BEEHIIV_PUBLICATION_ID    pub_XXXXXXXX

const env = (k, d = "") => process.env[k] || d;

async function airtable(table, fields) {
  const token = env("AIRTABLE_TOKEN"), base = env("AIRTABLE_BASE_ID");
  if (!token || !base) return "skipped (no Airtable keys)";
  const r = await fetch(`https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records: [{ fields }], typecast: true })
  });
  if (!r.ok) throw new Error(`Airtable ${r.status}: ${await r.text()}`);
  return "ok";
}

async function beehiiv(d) {
  const key = env("BEEHIIV_API_KEY"), pub = env("BEEHIIV_PUBLICATION_ID");
  if (!key || !pub) return "skipped (no Beehiiv keys)";
  const r = await fetch(`https://api.beehiiv.com/v2/publications/${pub}/subscriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: d.email,
      reactivate_existing: false,
      send_welcome_email: true,
      utm_source: d.utm_source || "dd-network-site",
      referring_site: "DD Network",
      custom_fields: d.first_name ? [{ name: "First Name", value: d.first_name }] : []
    })
  });
  if (!r.ok) throw new Error(`Beehiiv ${r.status}: ${await r.text()}`);
  return "ok";
}

const s = (v) => (v == null ? "" : String(v).trim());

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body || "{}");
  if (!payload) return { statusCode: 400 };
  const d = payload.data || {};
  const when = s(d.submitted_at) || payload.created_at || new Date().toISOString();
  const results = {};

  try {
    if (payload.form_name === "invite") {
      results.airtable = await airtable(env("AIRTABLE_INVITES_TABLE", "Applications"), {
        "Submitted at": when,
        "Full name": s(d.name),
        "Email": s(d.email),
        "WhatsApp": s(d.whatsapp),
        "LinkedIn": s(d.linkedin),
        "Role and company": s(d.role),
        "Years of experience": s(d.experience),
        "Field": s(d.field),
        "City": d.city === "Other" ? `Other: ${s(d.city_other)}` : s(d.city),
        "Applying as": s(d.applying_as),
        "Next 6 months": s(d.goal),
        "Could offer": s(d.offer),
        "Wishes she knew": s(d.wish_knew),
        "Already tried": s(d.already_tried),
        "Plan interest": s(d.plan),
        "Heard about us": s(d.heard_from),
        "Consent": d.consent === "yes",
        "Button clicked": s(d.cta_location),
        "UTM source": s(d.utm_source),
        "UTM medium": s(d.utm_medium),
        "UTM campaign": s(d.utm_campaign),
        "UTM content": s(d.utm_content),
        "UTM term": s(d.utm_term),
        "Referrer": s(d.referrer),
        "Status": "New"
      });
    } else if (payload.form_name === "newsletter") {
      results.beehiiv = await beehiiv(d).catch((e) => `failed: ${e.message}`);
      results.airtable = await airtable(env("AIRTABLE_NEWSLETTER_TABLE", "Newsletter"), {
        "Submitted at": when,
        "Email": s(d.email),
        "First name": s(d.first_name),
        "Signed up from": s(d.source),
        "UTM source": s(d.utm_source),
        "Sent to newsletter tool": results.beehiiv === "ok"
      });
    }
  } catch (e) {
    console.error(`[${payload.form_name}]`, e.message);
    return { statusCode: 500, body: e.message };
  }
  console.log(`[${payload.form_name}]`, JSON.stringify(results));
  return { statusCode: 200, body: JSON.stringify(results) };
};
