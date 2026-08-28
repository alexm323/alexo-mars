// Generates whimsical, Home-Depot-paint-swatch-style names for any color,
// entirely client-side — no API, no dictionary file, just HSL math + word banks.
//
// A name has up to three slot-machine "reels": X (adjective), Y (a second,
// optional adjective — often blank), and Z (a noun). e.g. "Rogue" + "" + "Basil"
// reads as "Rogue Basil"; "Midnight" + "Whispering" + "Harbor" reads as
// "Midnight Whispering Harbor".

export type Hsl = { h: number; s: number; l: number };

export function hexToHsl(hex: string): Hsl {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  h *= 60;

  return { h, s: s * 100, l: l * 100 };
}

type Family = {
  range: [number, number]; // hue range, degrees
  nouns: string[];
};

const FAMILIES: Family[] = [
  { range: [345, 361], nouns: ["Rose", "Cherry", "Brick", "Cranberry", "Ember", "Poppy"] },
  { range: [0, 15], nouns: ["Rose", "Cherry", "Brick", "Cranberry", "Ember", "Poppy"] },
  { range: [15, 45], nouns: ["Tangerine", "Clay", "Amber", "Pumpkin", "Terracotta", "Apricot"] },
  { range: [45, 65], nouns: ["Sunflower", "Honey", "Buttercup", "Wheat", "Dandelion", "Marigold"] },
  { range: [65, 90], nouns: ["Meadow", "Pear", "Lime", "Chartreuse", "Fern"] },
  { range: [90, 150], nouns: ["Sage", "Basil", "Moss", "Pine", "Ivy", "Fern", "Clover"] },
  { range: [150, 190], nouns: ["Lagoon", "Seafoam", "Spruce", "Juniper", "Eucalyptus"] },
  { range: [190, 200], nouns: ["Aqua", "Glacier", "Lagoon", "Mist"] },
  { range: [200, 245], nouns: ["Harbor", "Denim", "Cobalt", "Sky", "Ocean", "Blueberry"] },
  { range: [245, 265], nouns: ["Twilight", "Indigo", "Blueberry", "Dusk"] },
  { range: [265, 300], nouns: ["Lavender", "Violet", "Plum", "Orchid", "Wisteria", "Grape"] },
  { range: [300, 345], nouns: ["Blush", "Peony", "Bubblegum", "Magenta", "Fuchsia", "Flamingo"] },
];

const GRAYSCALE_NOUNS = {
  light: ["Linen", "Cloud", "Fog", "Canvas", "Eggshell", "Pearl", "Vapor"],
  mid: ["Pebble", "Concrete", "Storm", "Graphite", "Ash", "Stone", "Pigeon"],
  dark: ["Onyx", "Ink", "Iron", "Raven", "Void", "Shadow"],
};

const LIGHTNESS_MODIFIERS = {
  veryLight: [
    "Whisper", "Cloud", "Morning", "Pearl", "Frost", "Gentle", "Soft", "Ethereal",
    "Airy", "Luminous", "Delicate", "Silken", "Ghostly", "Powdery", "Feather",
    "Milky", "Sheer", "Dawn",
  ],
  light: [
    "Soft", "Gentle", "Pale", "Quiet", "Hazy", "Faint", "Sunlit", "Breezy",
    "Tender", "Barely-There", "Fresh", "Delicate",
  ],
  mid: [
    "Classic", "True", "Modern", "Golden", "Balanced", "Steady", "Earthy",
    "Honest", "Timeless", "Warm", "Natural", "Everyday",
  ],
  dark: [
    "Deep", "Dusky", "Shadow", "Moody", "Twilight", "Brooding", "Somber",
    "Stormy", "Smoky", "Rich", "Late-Night", "Hushed",
  ],
  veryDark: [
    "Midnight", "Charcoal", "Onyx", "Raven", "Ink", "Obsidian", "Umbra",
    "Inkwell", "Blackout", "Starless", "Coal", "Abyssal",
  ],
};

const SATURATION_MODIFIERS = {
  low: [
    "Weathered", "Dusty", "Faded", "Vintage", "Muted", "Stone", "Antique",
    "Timeworn", "Chalky", "Worn-In", "Understated", "Subdued",
  ],
  mid: ["Balanced", "Familiar", "Grounded", "Easygoing"] as string[],
  high: [
    "Electric", "Bold", "Vivid", "Bright", "Radiant", "Neon", "Blazing",
    "Fiery", "Fierce", "Supercharged", "Loud", "Turbocharged", "Blinding",
  ],
};

// Not tied to hue/lightness/saturation — pure flavor, always in the mix.
const GENERAL_MODIFIERS = [
  "Rogue", "Wild", "Secret", "Dreamy", "Playful", "Sly", "Lucky", "Velvet",
  "Bashful", "Cheeky", "Daring", "Elegant", "Fickle", "Giddy", "Humble",
  "Jazzy", "Keen", "Lively", "Mellow", "Nifty", "Quirky", "Sassy", "Unruly",
  "Vibrant", "Whimsical", "Zesty", "Breezy", "Cozy", "Dapper", "Earnest",
  "Feisty", "Groovy", "Hushed", "Jolly", "Lush", "Mystic", "Nostalgic",
  "Opulent", "Precious", "Restless", "Serene", "Tranquil", "Unbothered",
  "Wistful", "Youthful", "Zany", "Brave", "Curious", "Devoted", "Effortless",
  "Free", "Gallant", "Honest", "Intrepid", "Jubilant", "Kindred", "Loyal",
  "Magnetic", "Noble", "Original", "Proud", "Resolute", "Spirited",
  "Unstoppable", "Charming", "Dashing", "Enigmatic", "Fearless", "Graceful",
  "Impulsive", "Jaunty", "Klutzy", "Legendary", "Merry", "Notorious",
  "Outrageous", "Peculiar", "Rascally", "Scrappy", "Thrifty", "Untamed",
];

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Picks `count` distinct items from arr (no repeats), in random order.
function pickDistinct<T>(arr: readonly T[], count: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function lightnessBucket(l: number): keyof typeof LIGHTNESS_MODIFIERS {
  if (l >= 85) return "veryLight";
  if (l >= 65) return "light";
  if (l >= 35) return "mid";
  if (l >= 15) return "dark";
  return "veryDark";
}

function saturationBucket(s: number): keyof typeof SATURATION_MODIFIERS {
  if (s <= 15) return "low";
  if (s >= 70) return "high";
  return "mid";
}

function modifierPool(s: number, l: number): string[] {
  const fromLightness = LIGHTNESS_MODIFIERS[lightnessBucket(l)];
  const fromSaturation = SATURATION_MODIFIERS[saturationBucket(s)];
  const combined = [...fromLightness, ...fromSaturation, ...GENERAL_MODIFIERS];
  return Array.from(new Set(combined));
}

function findFamily(h: number): Family {
  const norm = ((h % 360) + 360) % 360;
  return FAMILIES.find((f) => norm >= f.range[0] && norm < f.range[1]) ?? FAMILIES[FAMILIES.length - 1];
}

function nounPool(h: number, s: number, l: number): string[] {
  if (s < 8) {
    if (l >= 85) return GRAYSCALE_NOUNS.light;
    if (l <= 15) return GRAYSCALE_NOUNS.dark;
    return GRAYSCALE_NOUNS.mid;
  }
  return findFamily(h).nouns;
}

// Every word in the game, used to make the reels flicker through random
// words while "spinning" before landing on the real result.
export const ALL_SPIN_WORDS: string[] = Array.from(
  new Set([
    ...Object.values(LIGHTNESS_MODIFIERS).flat(),
    ...Object.values(SATURATION_MODIFIERS).flat(),
    ...GENERAL_MODIFIERS,
    ...FAMILIES.flatMap((f) => f.nouns),
    ...Object.values(GRAYSCALE_NOUNS).flat(),
  ]),
);

export function randomSpinWord(): string {
  return pickOne(ALL_SPIN_WORDS);
}

export type SlotName = { x: string; y: string; z: string };

const Y_BLANK_CHANCE = 0.45;

export function generateSlotName(hex: string): SlotName {
  const { h, s, l } = hexToHsl(hex);
  const modifiers = modifierPool(s, l);
  const nouns = nounPool(h, s, l);

  const [x, maybeY] = pickDistinct(modifiers, 2);
  const y = Math.random() < Y_BLANK_CHANCE ? "" : (maybeY ?? "");
  const z = pickOne(nouns);

  return { x, y, z };
}

export function joinSlotName(name: SlotName): string {
  return [name.x, name.y, name.z].filter(Boolean).join(" ");
}
