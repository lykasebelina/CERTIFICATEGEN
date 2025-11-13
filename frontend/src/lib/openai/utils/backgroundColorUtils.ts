// src/lib/openai/utils/backgroundColorUtils.ts

/** Extracts colors (hex, rgb, or named) from prompt */
export function extractColors(prompt: string): string[] {
  const lower = prompt.toLowerCase().trim();
  const hexMatches = lower.match(/#([0-9a-f]{3,6})\b/gi);
  if (hexMatches?.length) return hexMatches;
  const rgbMatches = lower.match(/(rgb|hsl)\([^)]*\)/gi);
  if (rgbMatches?.length) return rgbMatches;

  const cleaned = lower
    .replace(/\b(pastel|soft|light|pale|bright|vivid|muted|dark|deep|rich|warm|cool|dusty|sky|cream|peach)\b/g, "")
    .trim();

  const words = cleaned.match(/\b[a-z]+\b/g) || [];
  const validColors = words.filter(isColorValid);

  const phraseMap: Record<string, string> = {
    "sky blue": "#87ceeb",
    "pastel blue": "#aec6cf",
    "pastel pink": "#ffd1dc",
    "pastel green": "#77dd77",
    "pastel peach": "#ffdab9",
    "pastel cream": "#fffdd0",
    "peach": "#ffdab9",
    "cream": "#fffdd0",
  };

  const phraseMatches = Object.entries(phraseMap)
    .filter(([phrase]) => lower.includes(phrase))
    .map(([, hex]) => hex);

  const allColors = [...phraseMatches, ...validColors];
  return allColors.slice(0, 2).length > 0 ? allColors.slice(0, 2) : ["#f9f9f9"];
}

/** Checks if color is valid CSS color */
export function isColorValid(color: string): boolean {
  if (typeof window !== "undefined") {
    const s = new Option().style;
    s.color = color;
    return s.color !== "";
  }
  const cssColors = [
    "red", "green", "blue", "yellow", "purple", "orange", "pink", "brown",
    "black", "white", "gray", "grey", "teal", "navy", "lime", "aqua",
    "maroon", "olive", "silver", "gold", "beige", "ivory", "violet",
    "indigo", "peachpuff", "skyblue", "coral", "salmon", "plum",
    "khaki", "lavender"
  ];
  return cssColors.includes(color.toLowerCase());
}

/** Adjusts base color based on “light” or “dark” keywords */
export function adjustBaseColor(color: string, userPrompt: string): string {
  const lower = userPrompt.toLowerCase();
  const isDark = /\bdark|deep|rich\b/.test(lower);
  const isLight = /\blight|pale|soft|pastel\b/.test(lower);

  const el = document.createElement("div");
  el.style.color = color;
  document.body.appendChild(el);
  const rgb = getComputedStyle(el).color.match(/\d+/g)?.map(Number) || [255, 255, 255];
  document.body.removeChild(el);

  let [r, g, b] = rgb;

  if (isDark) {
    r *= 0.7;
    g *= 0.7;
    b *= 0.7;
  } else if (isLight) {
    r = r + (255 - r) * 0.4;
    g = g + (255 - g) * 0.4;
    b = b + (255 - b) * 0.4;
  }

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/** Creates a brighter/darker variant of a color */
export function adjustColor(color: string, amount: number): string {
  const el = document.createElement("div");
  el.style.color = color;
  document.body.appendChild(el);
  const rgb = getComputedStyle(el).color.match(/\d+/g)?.map(Number) || [255, 255, 255];
  document.body.removeChild(el);
  const [r, g, b] = rgb.map((v) => Math.max(0, Math.min(255, v + (255 - v) * amount)));
  return `rgb(${r}, ${g}, ${b})`;
}
