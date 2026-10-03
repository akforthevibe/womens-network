// Repeating content for the homepage and /companies. Copy is exact from the brief.
import { photos, type Photo } from "./photos";

export const proof = [
  { value: "7,000+", label: "women in the DD community" },
  { value: "4 years", label: "of Decoding Draupadi" },
  { value: "20+", label: "DD gatherings and conversations" },
  { value: "1st chapter", label: "Mumbai, 2026" },
];

export const fitFor = [
  {
    title: "You're 7 to 20 years in.",
    body: "Inside a company, running your own thing, consulting, freelancing or doing some combination of all four.",
  },
  { title: "People already come to you for advice.", body: "You are not looking for another beginner networking group." },
  { title: "You want to give as much as you get.", body: "The best introductions in the room go both ways." },
  { title: "You want fewer, better people.", body: "You would rather know 30 women properly than collect 300 LinkedIn connections." },
];

export const fitNot = [
  "You're here to sell to the room.",
  "You want a 500-person mixer.",
  "You want a feed to scroll.",
  "You're looking for a job board.",
];

export type Pillar = {
  n: string;
  title: string;
  body: string;
  detail: string;
  photo: Photo;
  colour: "plum" | "magenta" | "amber" | "crimson";
  doodle?: boolean;
};

export const pillars: Pillar[] = [
  {
    n: "01",
    title: "The room",
    body: "A members-only mixer every month. Meetups every fortnight. Small dinners where you can actually hear the person across the table.",
    detail: "Come once. Come often. The point is repetition.",
    photo: photos.room,
    colour: "plum",
  },
  {
    n: "02",
    title: "The directory",
    body: "Know who is building what, who knows what, and who you might want to meet next. You control your visibility.",
    detail: "Search the people, not the feed.",
    photo: photos.directory,
    colour: "magenta",
  },
  {
    n: "03",
    title: "Introductions",
    body: "Need someone specific? Tell us. We find the right member, check that she's open to it, then make the introduction.",
    detail: "No cold DMs. No awkward asks.",
    photo: photos.introductions,
    colour: "amber",
    doodle: true,
  },
  {
    n: "04",
    title: "Visibility",
    body: "Your work should travel further than your own LinkedIn feed. Get considered for DD's newsletter, podcast and speaking opportunities through Draupadi on the Dais.",
    detail: "Visibility is part of the network.",
    photo: photos.visibility,
    colour: "crimson",
  },
];

export const steps = [
  { n: "01", title: "Apply.", body: "Five minutes. Tell us where you are, what you're building and what you need next." },
  { n: "02", title: "Talk to us.", body: "A 20-minute conversation. We want to know who you are, not just what your LinkedIn says." },
  { n: "03", title: "Take your seat.", body: "You'll join a welcome dinner within three weeks of acceptance." },
];

// Founding Hosts. Leave empty until hosts are confirmed: six "Coming soon" frames show instead.
// Never invent names. Each entry: { name, role, company, photo: { src, alt } }.
export type Host = { name: string; role: string; company: string; photo: { src: string; alt: string } };
export const hosts: Host[] = [];

// Member voices. Real quotes only, 35 to 45 words each. The section is hidden while this is empty.
export type Voice = { quote: string; name: string; role: string; company: string; photo: { src: string; alt: string } };
export const voices: Voice[] = [];

type FeatureGroup = { heading: string; items: string[] };

export const memberFeatures: FeatureGroup[] = [
  { heading: "The room", items: ["Monthly members-only mixer", "Fortnightly meetups", "Small member dinners"] },
  {
    heading: "The network",
    items: ["Full member directory", "Control over who can contact you", "Up to 2 warm introductions per quarter"],
  },
  { heading: "The access", items: ["Founding Host events", "Member pricing on DD experiences", "Chance to be featured by DD"] },
];

export const circleFeatures: FeatureGroup[] = [
  { heading: "Everything in Member", items: ["The full DD Network membership"] },
  {
    heading: "Your Circle",
    items: ["8 to 10 women", "6 facilitated evenings a year", "Matched around seniority and current challenges"],
  },
  {
    heading: "Deeper access",
    items: [
      "Introductions on demand",
      "Reverse directory",
      "Speaking opportunities through Draupadi on the Dais",
      "Journalist and PR requests",
      "One guaranteed DD feature each year",
      "Premium dinners",
      "First access to retreats",
    ],
  },
];

export const comparison: [string, string, string][] = [
  ["Member directory", "Yes", "Yes"],
  ["Monthly members-only mixer", "Yes", "Yes"],
  ["Fortnightly meetups", "Yes", "Yes"],
  ["Small dinners", "Yes", "Yes"],
  ["Founding Host access", "Yes", "Priority"],
  ["Warm introductions", "Up to 2 / quarter", "On demand"],
  ["Reverse directory", "No", "Yes"],
  ["DD feature", "Considered", "1 guaranteed / year"],
  ["Draupadi on the Dais opportunities", "Considered", "Priority"],
  ["Journalist and PR requests", "No", "Yes"],
  ["Facilitated peer Circle", "No", "6 evenings / year"],
  ["Premium dinners", "Member pricing", "Included"],
  ["Retreat access", "Member pricing", "First access"],
  ["Annual price", "₹25,000", "₹65,000"],
];

export const faqs = [
  {
    q: "Who is actually in the room?",
    a: "Women roughly 7 to 20 years into their careers, businesses or independent work. Founders, senior operators, leaders, consultants and women building something of their own. Everyone applies and speaks to us first.",
  },
  { q: "Why do I need to apply?", a: "Because the room is the product. We want to know who's joining before we put you around the table." },
  {
    q: "How much time does membership take?",
    a: "There is no attendance requirement. Come to the monthly mixer, join a meetup, book a dinner or simply use the directory when you need someone.",
  },
  {
    q: "How do introductions work?",
    a: "Tell us who you need and why. We find the right member, check that she is open to connecting, and make a warm introduction.",
  },
  {
    q: "How do you match Circle members?",
    a: "We look at seniority, professional context, what you're building and the kind of decisions you're currently dealing with. The aim is a table where the context is useful to everyone.",
  },
  {
    q: "Is what I share private?",
    a: "Yes. Introductions are double opt-in. Circle members agree to confidentiality. We do not sell member information.",
  },
  {
    q: "Can my company pay for my membership?",
    a: "Yes. We provide GST invoices, and companies can sponsor individual Member or Circle seats.",
  },
  { q: "Can I pay in instalments?", a: "Yes. Member can be paid upfront or in three instalments. Circle is paid annually." },
  {
    q: "What happens after I apply?",
    a: "We read your application, then invite you to a 20-minute conversation. If it feels like the right room for you and for the network, we'll offer you a seat.",
  },
  {
    q: "When does Mumbai start?",
    a: "The first chapter begins in November 2026. Founding Member applications close on 15 November, and the first welcome dinners begin later that month.",
  },
];

export const foundingBenefits = [
  { n: "01", title: "Price locked", body: "₹25,000/year stays locked for two years." },
  { n: "02", title: "Two invites", body: "Invite two women you'd genuinely vouch for." },
  { n: "03", title: "A say in the build", body: "Founding members get a direct line into what DD Network builds next." },
  { n: "04", title: "Your name in the room", body: "Founding members are part of the founding wall." },
];

export const companySeats = [
  {
    key: "network",
    title: "Network Access",
    teaser: "Put DD Network membership in your benefits or L&D budget.",
    body: "A Member seat for women you want to retain, develop and connect beyond the office.",
    price: "₹25,000",
    includes: [
      "Monthly members-only mixer",
      "Fortnightly meetups",
      "Small dinners",
      "Member directory",
      "Warm introductions",
      "Founding Host access",
      "Member pricing",
      "Consideration for DD features",
    ],
    cta: "Sponsor Member seats",
  },
  {
    key: "circle",
    title: "Leadership Circle",
    teaser: "Give senior women a smaller peer group with structure, continuity and a real network behind it.",
    body: "A Circle seat for senior women who benefit from a smaller, consistent peer group.",
    price: "₹65,000",
    includes: [
      "Everything in Member",
      "Circle of 8 to 10 women",
      "Six facilitated evenings",
      "Introductions on demand",
      "Reverse directory",
      "Visibility through Draupadi on the Dais",
      "Premium dinners",
      "Retreat access",
    ],
    cta: "Talk to us about Circle",
  },
];

export const companySteps = [
  { n: "01", title: "Choose your seats.", body: "Tell us how many women you want to sponsor." },
  { n: "02", title: "We onboard them.", body: "Every woman applies and speaks to us." },
  { n: "03", title: "You get the picture.", body: "Quarterly aggregate reporting on attendance, satisfaction and overall outcomes." },
];
