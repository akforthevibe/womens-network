// Every photo on the page, by slot. Swap `id` for a real DD event or host photo
// (or an absolute URL in `src`) and the treatment stays the same.
// Credits feed the footer. Check each photo and its photographer on Unsplash before launch.

export type Photo = {
  id?: string; // images.unsplash.com photo id, e.g. "1573164713714-d95e436ab8d6"
  src?: string; // any other image URL, used instead of id
  alt: string;
  credit: string;
  creditUrl: string;
};

export const photos = {
  hero: {
    id: "1573164713714-d95e436ab8d6",
    alt: "Two women in conversation across a table, one mid-sentence, the other listening closely",
    credit: "Christina @ wocintechchat.com",
    creditUrl: "https://unsplash.com/@wocintechchat",
  },
  meet: {
    id: "1414235077428-338989a2e8c0",
    alt: "A small dinner table laid with plates and glasses before guests sit down",
    credit: "Jay Wennington",
    creditUrl: "https://unsplash.com/@jaywennington",
  },
  seen: {
    id: "1475721027785-f74eccf877e2",
    alt: "A woman speaking into a microphone on a small stage",
    credit: "[photographer]",
    creditUrl: "https://unsplash.com",
  },
  introduced: {
    id: "1573497019236-17f8177b81e8",
    alt: "Two women talking one to one over coffee",
    credit: "Christina @ wocintechchat.com",
    creditUrl: "https://unsplash.com/@wocintechchat",
  },
  who: {
    id: "1573497019940-1c28c88b4f3e",
    alt: "A woman at work in a bright studio, mid-conversation with someone out of frame",
    credit: "Christina @ wocintechchat.com",
    creditUrl: "https://unsplash.com/@wocintechchat",
  },
  signup: {
    id: "1517248135467-4c7edcad34c4",
    alt: "A low-lit dining room with tables set for the evening",
    credit: "[photographer]",
    creditUrl: "https://unsplash.com",
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
  return widths.map((w) => `${photoUrl(p, w, ratio)} ${w}w`).join(", ");
}

/** Unique photographers, for the footer credit line. */
export const credits = Object.values(photos as Record<string, Photo>).reduce<{ name: string; url: string }[]>(
  (list, p) => (list.some((c) => c.name === p.credit) ? list : [...list, { name: p.credit, url: p.creditUrl }]),
  []
);
