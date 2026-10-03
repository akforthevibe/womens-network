// Every photo on the site, by slot. All of these are Unsplash stand-ins until real
// DD photographs exist: swap `id` for a real photo (or put any absolute URL in `src`)
// and the treatment (black and white, grain, colour frame, srcset) stays the same.
// When a real DD photo goes in, use the alt text in `finalAlt`; until then `alt`
// describes the stand-in honestly.

export type Photo = {
  id?: string; // images.unsplash.com photo id
  src?: string; // any other image URL, used instead of id
  alt: string;
  finalAlt: string;
  credit: string;
  creditUrl: string;
  zoom?: number; // optional tighter crop, 1 is the full frame
  fpx?: number; // focal point for the tighter crop, 0 to 1
  fpy?: number;
};

export const photos = {
  hero: {
    id: "1573164713714-d95e436ab8d6",
    alt: "Two women talking across a table, one mid-sentence, the other listening",
    finalAlt: "Women talking around a dinner table at a DD Network gathering",
    credit: "Christina @ wocintechchat.com",
    creditUrl: "https://unsplash.com/@wocintechchat",
  },
  chapter: {
    id: "1517248135467-4c7edcad34c4",
    alt: "A low-lit dining room with tables set for the evening",
    finalAlt: "A Mumbai dining room set for the first DD Network dinner",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
  },
  room: {
    id: "1573164713714-d95e436ab8d6",
    alt: "A woman listening closely across a table",
    finalAlt: "Women talking together at a small DD gathering",
    credit: "Christina @ wocintechchat.com",
    creditUrl: "https://unsplash.com/@wocintechchat",
    zoom: 1.7,
    fpx: 0.7,
    fpy: 0.4,
  },
  directory: {
    id: "1573497019940-1c28c88b4f3e",
    alt: "Woman working independently in a bright studio",
    finalAlt: "Woman working independently at her desk",
    credit: "Christina @ wocintechchat.com",
    creditUrl: "https://unsplash.com/@wocintechchat",
  },
  introductions: {
    id: "1573497019236-17f8177b81e8",
    alt: "Two women talking over coffee",
    finalAlt: "Two women talking over coffee",
    credit: "Christina @ wocintechchat.com",
    creditUrl: "https://unsplash.com/@wocintechchat",
  },
  visibility: {
    id: "1475721027785-f74eccf877e2",
    alt: "Woman speaking into a microphone to an audience",
    finalAlt: "Woman speaking to an audience",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
  },
  circle: {
    id: "1414235077428-338989a2e8c0",
    alt: "A small dinner table laid with plates and glasses before guests sit down",
    finalAlt: "Small group of women around a dinner table",
    credit: "Jay Wennington",
    creditUrl: "https://unsplash.com/@jaywennington",
  },
} satisfies Record<string, Photo>;

const base = (p: Photo) => p.src ?? `https://images.unsplash.com/photo-${p.id}`;

/** Image URL at a given width and aspect ratio (height / width), WebP at q=72. */
export function photoUrl(p: Photo, w: number, ratio?: number) {
  if (p.src && !p.src.includes("images.unsplash.com")) return p.src;
  const h = ratio ? `&h=${Math.round(w * ratio)}` : "";
  const crop = p.zoom
    ? `&crop=focalpoint&fp-x=${p.fpx ?? 0.5}&fp-y=${p.fpy ?? 0.5}&fp-z=${p.zoom}`
    : "&crop=faces,center";
  return `${base(p)}?w=${w}${h}&q=72&fm=webp&fit=crop${crop}`;
}

export function photoSrcset(p: Photo, widths: number[], ratio?: number) {
  return widths.map((w) => `${photoUrl(p, w, ratio)} ${w}w`).join(", ");
}

/** Hero image settings, shared by the preload link and the <img>. */
export const heroImage = {
  widths: [400, 560, 760, 1000, 1120],
  ratio: 1.22,
  sizes: "(min-width: 1280px) 560px, (min-width: 1024px) 40vw, (min-width: 520px) 480px, calc(100vw - 76px)",
};

/** Unique photographers, for the footer credit line. */
export const credits = Object.values(photos as Record<string, Photo>).reduce<{ name: string; url: string }[]>(
  (list, p) => (list.some((c) => c.name === p.credit) ? list : [...list, { name: p.credit, url: p.creditUrl }]),
  []
);
