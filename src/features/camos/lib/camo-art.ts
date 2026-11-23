/**
 * Original camo swatches, generated from the camo name. They are NOT the official game
 * artwork: colors come from words in the name ("Red", "Snow", "Jungle"...) and the
 * pattern from its style ("Tiger", "Topo", "Digital"...). Unknown names fall back to a
 * deterministic choice, so the same name always renders the same swatch.
 */

export type CamoPattern =
  | "woodland"
  | "digital"
  | "tiger"
  | "topo"
  | "scales"
  | "splinter"
  | "waves"
  | "smoke"
  | "brush"
  | "solid";

export type Palette = readonly [string, string, string, string];

export interface CamoArt {
  pattern: CamoPattern;
  palette: Palette;
  seed: number;
}

const PALETTES = {
  red: ["#4a1210", "#8f2620", "#b8392f", "#d9675b"],
  cyan: ["#0f4c52", "#1d7b84", "#2fa6b0", "#86d5da"],
  green: ["#1f3d1c", "#2f5a28", "#4a7d3a", "#7aa35c"],
  olive: ["#2e3320", "#4a5230", "#6b7445", "#9a9a6a"],
  yellow: ["#6b5410", "#a8841a", "#d9b02e", "#f0d56a"],
  snow: ["#7e8e9c", "#aebbc6", "#d6dee5", "#f1f4f7"],
  black: ["#0c0d0e", "#1b1d1f", "#2c2f32", "#4a4f54"],
  brown: ["#3b2a1a", "#5e4128", "#8a6440", "#b08a5e"],
  tan: ["#6b5a3e", "#93805b", "#b8a47c", "#d8c8a2"],
  blue: ["#122a4a", "#1f4677", "#3567a3", "#6d97cc"],
  lime: ["#3d5a0f", "#6b9a16", "#9acb2a", "#c8ec6a"],
  gunmetal: ["#23282c", "#373e44", "#4f575e", "#737c84"],
  pink: ["#6b1d47", "#b23a78", "#e070a8", "#f5b3d3"],
  orange: ["#5a1f08", "#a3400f", "#e0701c", "#f5a54a"],
  purple: ["#1d1338", "#3b2470", "#6340a8", "#9b7ad6"],
} as const satisfies Record<string, Palette>;

type PaletteName = keyof typeof PALETTES;

/** First match wins, so more specific words come first. */
const PALETTE_RULES: readonly [RegExp, PaletteName][] = [
  [/bubblegum|flamingo|hibiscus|miami|kitty/, "pink"],
  [/snow|frost|white|ice|winter/, "snow"],
  [/cyan|ripple|tide|currents|stormwave/, "cyan"],
  [/red|ichor|rattlesnake/, "red"],
  [/fire|magma|scorch|sunset|sunburn|hot rod|empyros|helio|autumn|foxtrail|fall/, "orange"],
  [/yellow|gold/, "yellow"],
  [/lime/, "lime"],
  [/blue|deep space|space time|parallax/, "blue"],
  [/phantom|stellation|dread|plague|corrupted|chiral/, "purple"],
  [/black|night|dark(?! tan)|shadow|asphalt|chained|deathbed|ghast|oni/, "black"],
  [
    /gunmetal|iron|urban|carbon|smoke|stone|shale|mineral|mercurial|damascus|polyatomic|raster|recursive|thunder/,
    "gunmetal",
  ],
  [/brown|bark|oil|tectonic|outcrop|clay|rind|stockpile/, "brown"],
  [/tan|dune|desert|sand|dry|backcountry|frontier|veil|tropic|rock/, "tan"],
  [/green|jungle|moss|pine|weeds|tree|thicket|mangrove|ponderosa|fungal|anaconda|orion/, "green"],
];

const PATTERN_RULES: readonly [RegExp, CamoPattern][] = [
  [/tiger|swipe/, "tiger"],
  [/topo|contour/, "topo"],
  [/digi|raster|grid|pixel|recursive/, "digital"],
  [/snake|anaconda|scale/, "scales"],
  [
    /splinter|shale|stone|bits|fractal|outcrop|mineral|tectonic|poly|stellation|carbonated/,
    "splinter",
  ],
  [
    /wave|ripple|current|tension|reverb|flux|redshift|tide|drift|parallax|space time|spidersilk|damascus/,
    "waves",
  ],
  [/smoke|cloud|thunder|ghast|space|plague|helio|chiral|orion/, "smoke"],
  [
    /brush|splatter|sticker|wallpaper|garland|hibiscus|miami|flamingo|bubblegum|kitty|oni|chained|stockpile|deathbed|myriad|samnim|dread/,
    "brush",
  ],
  [
    /pine|weeds|tree|thicket|jungle|moss|mangrove|ponderosa|bark|autumn|backcountry|frontier|foxtrail|ash|tropic|rock|dune|desert|sandwash|scorch|fall|veil/,
    "woodland",
  ],
];

/** Plain color names render as a solid finish. */
const SOLID_NAMES = new Set([
  "cyan",
  "red",
  "green",
  "yellow",
  "white",
  "brown",
  "lime",
  "iron",
  "gunmetal",
  "dark tan",
  "asphalt",
]);

const FALLBACK_PALETTES: readonly PaletteName[] = ["olive", "tan", "brown", "gunmetal", "green"];
const FALLBACK_PATTERNS: readonly CamoPattern[] = ["woodland", "splinter", "digital", "brush"];

/** FNV-1a: small, stable 32-bit hash. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32: deterministic PRNG, so server and client render identical markup. */
export function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length] as T;
}

export function getCamoArt(name: string): CamoArt {
  const normalized = name.trim().toLowerCase();
  const seed = hashString(normalized);

  const paletteName =
    PALETTE_RULES.find(([rule]) => rule.test(normalized))?.[1] ?? pick(FALLBACK_PALETTES, seed);
  const pattern = SOLID_NAMES.has(normalized)
    ? "solid"
    : (PATTERN_RULES.find(([rule]) => rule.test(normalized))?.[1] ??
      pick(FALLBACK_PATTERNS, seed >>> 3));

  return { pattern, palette: PALETTES[paletteName], seed };
}

export const OLIVE_PALETTE: Palette = PALETTES.olive;
