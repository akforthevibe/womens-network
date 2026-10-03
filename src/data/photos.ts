// Every photo on the site, by slot. Use real DD photos as soon as they exist: swap `id` for
// `src` (any image URL) and the treatment stays the same. Add `caption` ("Name, role") when a
// photo shows a real member or host. Unsplash credits feed the footer.
// Check each interim Unsplash photo and its photographer before launch.

export type Photo = {
  id?: string; // images.unsplash.com photo id
  src?: string; // any other image URL, used instead of id
  alt: string;
  caption?: string;
  credit?: string; // Unsplash photographer; leave out for DD's own photos
  creditUrl?: string;
};

const woc = { credit: "Christina @ wocintechchat.com", creditUrl: "https://unsplash.com/@wocintechchat" };

export const photos = {
  hero: {
    id: "1573164713714-d95e436ab8d6",
    alt: "Two women in conversation across a table, one mid-sentence, the other listening closely",
    ...woc,
  },
  room: {
    id: "1573496799652-408c2ac9fe98",
    alt: "A small group of women talking around a table at an evening meetup",
    ...woc,
  },
  directory: {
    id: "1573497019940-1c28c88b4f3e",
    alt: "A woman at work in her bright studio, mid-conversation with someone out of frame",
    ...woc,
  },
  introductions: {
    id: "1573497019236-17f8177b81e8",
    alt: "Two women talking one to one over coffee",
    ...woc,
  },
  visibility: {
    id: "1475721027785-f74eccf877e2",
    alt: "A woman speaking into a microphone on a small stage",
    credit: "[photographer]",
    creditUrl: "https://unsplash.com",
  },
  circle: {
    id: "1517248135467-4c7edcad34c4",
    alt: "A low-lit dining room with a small table set for the evening",
    credit: "[photographer]",
    creditUrl: "https://unsplash.com",
  },
  request: {
    id: "1414235077428-338989a2e8c0",
    alt: "A table laid with plates and glasses before guests sit down",
    credit: "Jay Wennington",
    creditUrl: "https://unsplash.com/@jaywennington",
  },
} satisfies Record<string, Photo>;

const base = (p: Photo) => p.src ?? `https://images.unsplash.com/photo-${p.id}`;

/** Unsplash URL at a given width (and optional aspect ratio), WebP at q=75. */
export function photoUrl(p: Photo, w: number, ratio?: number) {
  if (p.src && !p.src.includes("images.unsplash.com")) return p.src;
  const h = ratio ? `&h=${Math.round(w * ratio)}` : "";
  return `${base(p)}?w=${w}${h}&q=75&fm=webp&fit=crop&crop=faces,center`;
}

export function photoSrcset(p: Photo, widths: number[], ratio?: number) {
  if (p.src && !p.src.includes("images.unsplash.com")) return undefined;
  return widths.map((w) => `${photoUrl(p, w, ratio)} ${w}w`).join(", ");
}

/** Unique Unsplash photographers, for the footer credit line. */
export const credits = Object.values(photos as Record<string, Photo>).reduce<{ name: string; url: string }[]>(
  (list, p) =>
    !p.credit || list.some((c) => c.name === p.credit) ? list : [...list, { name: p.credit, url: p.creditUrl ?? "https://unsplash.com" }],
  []
);
