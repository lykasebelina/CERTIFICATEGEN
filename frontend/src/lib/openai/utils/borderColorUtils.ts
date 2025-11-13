
// src/lib/openai/utils/borderColorUtils.ts
/** Utility: Border Color Helpers **/

/** Simple fallback map for named colors */
export const BORDER_COLOR_MAP: Record<string, string> = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  black: "#000000",
  white: "#FFFFFF",
  red: "#FF0000",
  blue: "#0000FF",
  green: "#008000",
  gray: "#808080",
  brown: "#8B4513",
  navy: "#000080",
  purple: "#800080",
  violet: "#EE82EE",
  maroon: "#800000",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  ivory: "#FFFFF0",
};

/** Extracts likely border color keyword */
export function extractBorderColor(prompt: string): string | null {
  const lower = prompt.toLowerCase();

  const colorName = Object.keys(BORDER_COLOR_MAP).find((name) =>
    lower.includes(name)
  );
  if (colorName) return BORDER_COLOR_MAP[colorName];

  const pastelMatch = lower.match(/pastel\s+([a-z]+)/);
  if (pastelMatch && BORDER_COLOR_MAP[pastelMatch[1]]) {
    return BORDER_COLOR_MAP[pastelMatch[1]];
  }

  return null;
}

/** Ensures readable contrast between border and background */
export function ensureContrast(color: string, bg: string): string {
  const toRGB = (c: string): number[] => {
    const div = document.createElement("div");
    div.style.color = c;
    document.body.appendChild(div);
    const rgb = getComputedStyle(div).color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    document.body.removeChild(div);
    return rgb;
  };

  const [r1, g1, b1] = toRGB(color);
  const [r2, g2, b2] = toRGB(bg);

  const luminance = (r: number, g: number, b: number) =>
    0.299 * r + 0.587 * g + 0.114 * b;

  const contrast = Math.abs(luminance(r1, g1, b1) - luminance(r2, g2, b2));

  if (contrast < 60) {
    // Slightly darken border for contrast
    return `rgb(${Math.max(0, r1 - 60)}, ${Math.max(0, g1 - 60)}, ${Math.max(0, b1 - 60)})`;
  }

  return color;
}

/** Creates lighter or darker variant (used in double borders, etc.) */
export function shadeColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, "0")}`;
}
