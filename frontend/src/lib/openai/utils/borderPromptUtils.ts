// src/lib/openai/utils/borderPromptUtils.ts

import type { CertificateSize } from "./sizeUtils";

/** Detects border type (simple geometric vs ornate) */
export function detectBorderType(prompt: string): "simple" | "ornate" {
  const lower = prompt.toLowerCase();

  const simpleHints = [
    "simple", "minimal", "thin", "double", "solid", "dashed", "dotted",
    "clean", "geometric", "plain", "straight", "modern",
  ];

  const ornateHints = [
    "ornate", "decorative", "floral", "engraved", "vintage", "royal",
    "classic", "art deco", "luxury", "elegant", "baroque", "frame",
    "filigree", "patterned", "border design", "embellished",
  ];

  if (ornateHints.some((w) => lower.includes(w))) return "ornate";
  if (simpleHints.some((w) => lower.includes(w))) return "simple";
  return "simple"; // fallback
}

/** Detects thickness keywords */
export function detectBorderThickness(prompt: string): number {
  const lower = prompt.toLowerCase();
  if (lower.includes("thin") || lower.includes("minimal")) return 2;
  if (lower.includes("medium") || lower.includes("regular")) return 5;
  if (lower.includes("thick") || lower.includes("bold")) return 10;
  if (lower.includes("double")) return 8;
  return 4; // default
}

/** Formats prompt for DALL·E (ornate border generation) */
export function formatBorderPrompt(
  userPrompt: string,
  canvasSize: CertificateSize
): string {
  const safePrompt = userPrompt
    .replace(/certificate|background|award|design/gi, "")
    .trim();

  return `
Highly detailed ${safePrompt} decorative border design for a certificate.
- Style: Elegant, symmetrical, and perfectly centered
- Top, bottom, left, and right edges included
- Transparent center area for the certificate content
- No inner text or logos
- Pure digital border frame with clean edges
- Background must be transparent
- Format: ${canvasSize.width}x${canvasSize.height}px PNG
Negative prompt: text, words, logos, photo, shadow, background fill
`;
}
