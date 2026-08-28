// Generates whimsical, Home-Depot-paint-swatch-style names for any color,
// entirely client-side — no API, no dictionary file, just HSL math + word banks.

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
  name: string;
  range: [number, number]; // hue range, degrees
  nouns: string[];
};

const FAMILIES: Family[] = [
  { name: "red", range: [345, 361], nouns: ["Rose", "Cherry", "Brick", "Cranberry", "Ember", "Poppy"] },
  { name: "red2", range: [0, 15], nouns: ["Rose", "Cherry", "Brick", "Cranberry", "Ember", "Poppy"] },
  { name: "orange", range: [15, 45], nouns: ["Tangerine", "Clay", "Amber", "Pumpkin", "Terracotta", "Apricot"] },
  { name: "yellow", range: [45, 65], nouns: ["Sunflower", "Honey", "Buttercup", "Wheat", "Dandelion", "Marigold"] },
  { name: "yellowgreen", range: [65, 90], nouns: ["Meadow", "Pear", "Lime", "Chartreuse", "Fern"] },
  { name: "green", range: [90, 150], nouns: ["Sage", "Basil", "Moss", "Pine", "Ivy", "Fern", "Clover"] },
  { name: "teal", range: [150, 190], nouns: ["Lagoon", "Seafoam", "Spruce", "Juniper", "Eucalyptus"] },
  { name: "cyan", range: [190, 200], nouns: ["Aqua", "Glacier", "Lagoon", "Mist"] },
  { name: "blue", range: [200, 245], nouns: ["Harbor", "Denim", "Lagoon", "Cobalt", "Sky", "Ocean", "Blueberry"] },
  { name: "indigo", range: [245, 265], nouns: ["Twilight", "Midnight", "Indigo", "Blueberry"] },
  { name: "purple", range: [265, 300], nouns: ["Lavender", "Violet", "Plum", "Orchid", "Wisteria", "Grape"] },
  { name: "pink", range: [300, 345], nouns: ["Blush", "Peony", "Bubblegum", "Magenta", "Fuchsia", "Flamingo"] },
];

const LIGHTNESS_WORDS = {
  veryLight: ["Whisper", "Cloud", "Morning", "Pearl", "Frost", "Powder", "Vapor"],
  light: ["Soft", "Gentle", "Pale", "Quiet", "Hazy"],
  mid: ["", "", ""], // often no modifier needed
  dark: ["Deep", "Dusky", "Shadow", "Twilight", "Midnight"],
  veryDark: ["Midnight", "Charcoal", "Onyx", "Raven", "Ink"],
};

const SATURATION_WORDS = {
  low: ["Weathered", "Dusty", "Faded", "Vintage", "Muted", "Stone"],
  mid: ["", ""],
  high: ["Electric", "Bold", "Vivid", "Bright"],
};

const SUFFIXES = [
  "Dream",
  "Glow",
  "Kiss",
  "Whisper",
  "Sunset",
  "Reverie",
  "Bloom",
  "Haze",
  "Breeze",
  "Serenade",
  "Escape",
  "Retreat",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed * arr.length) % arr.length];
}

function findFamily(h: number): Family {
  const norm = ((h % 360) + 360) % 360;
  return FAMILIES.find((f) => norm >= f.range[0] && norm < f.range[1]) ?? FAMILIES[FAMILIES.length - 1];
}

function lightnessWord(l: number, seed: number): string {
  if (l >= 88) return pick(LIGHTNESS_WORDS.veryLight, seed);
  if (l >= 70) return pick(LIGHTNESS_WORDS.light, seed);
  if (l >= 35) return pick(LIGHTNESS_WORDS.mid, seed);
  if (l >= 15) return pick(LIGHTNESS_WORDS.dark, seed);
  return pick(LIGHTNESS_WORDS.veryDark, seed);
}

function saturationWord(s: number, seed: number): string {
  if (s <= 15) return pick(SATURATION_WORDS.low, seed);
  if (s >= 70) return pick(SATURATION_WORDS.high, seed);
  return pick(SATURATION_WORDS.mid, seed);
}

// Grayscale special case: very low saturation regardless of hue.
const GRAY_NAMES = [
  "Foggy Morning",
  "Concrete Jungle",
  "Storm Cloud",
  "Quiet Pebble",
  "Overcast",
  "Graphite Whisper",
  "Silver Lining",
  "Pigeon Feather",
];
const NEAR_WHITE = ["Fresh Linen", "Cloud Nine", "Morning Fog", "Blank Canvas", "Eggshell Whisper"];
const NEAR_BLACK = ["Witching Hour", "Blackout", "Starless Night", "Cast Iron", "Void Walker"];

export function generatePaintName(hex: string, randomSeed = Math.random()): string {
  const { h, s, l } = hexToHsl(hex);

  if (s < 8) {
    if (l >= 92) return pick(NEAR_WHITE, randomSeed);
    if (l <= 8) return pick(NEAR_BLACK, randomSeed);
    return pick(GRAY_NAMES, randomSeed);
  }

  const family = findFamily(h);
  const noun = pick(family.nouns, randomSeed);
  const lWord = lightnessWord(l, (randomSeed + 0.31) % 1);
  const sWord = saturationWord(s, (randomSeed + 0.62) % 1);

  const modifiers = [lWord, sWord].filter(Boolean);
  const useSuffix = randomSeed > 0.55 && modifiers.length < 2;

  const parts: string[] = [];
  if (modifiers.length) {
    parts.push(pick(modifiers, (randomSeed + 0.17) % 1));
  }
  parts.push(noun);
  if (useSuffix) {
    parts.push(pick(SUFFIXES, (randomSeed + 0.83) % 1));
  }

  // Title case, dedupe accidental repeats
  return Array.from(new Set(parts)).join(" ");
}
