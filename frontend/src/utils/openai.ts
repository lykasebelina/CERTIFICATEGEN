import OpenAI from "openai";
import { CertificateElement } from "../types/certificate";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface CertificateSize {
  width: number;
  height: number;
}

const SIZE_MAP: Record<string, CertificateSize> = {
  "a4-portrait": { width: 794, height: 1123 },
  "a4-landscape": { width: 1123, height: 794 },
  "legal-portrait": { width: 816, height: 1344 },
  "legal-landscape": { width: 1344, height: 816 },
  "letter-portrait": { width: 816, height: 1056 },
  "letter-landscape": { width: 1056, height: 816 },
};

/* 🔍 Smarter background type detection */
function detectBackgroundType(prompt: string): "plain" | "textured" {
  const lower = prompt.toLowerCase();

  const textureHints = [
    "texture", "paper", "grain", "fabric", "canvas", "pattern",
    "linen", "rough", "material", "vintage", "old", "aged",
    "fibers", "weave", "cotton", "texture background", "parchment",
  ];

  const plainHints = [
    "plain", "solid", "flat", "simple", "minimal", "no texture",
    "clean", "single color", "monotone",
  ];

  if (textureHints.some((w) => lower.includes(w))) return "textured";
  if (plainHints.some((w) => lower.includes(w))) return "plain";
  return "textured"; // default to textured if ambiguous
}

/* 🎨 Helper to extract a color if user asks for one */
function extractColor(prompt: string): string {
  const colorMap: Record<string, string> = {
    white: "#ffffff",
    black: "#000000",
    gray: "#cccccc",
    grey: "#cccccc",
    blue: "#a7c7e7",
    red: "#f28b82",
    green: "#b7e1a1",
    beige: "#f5f5dc",
    ivory: "#fffff0",
    cream: "#fffdd0",
    gold: "#ffd700",
    silver: "#c0c0c0",
    yellow: "#fff59d",
    brown: "#d7ccc8",
  };
  const lowerPrompt = prompt.toLowerCase();
  for (const [name, hex] of Object.entries(colorMap)) {
    if (lowerPrompt.includes(name)) return hex;
  }
  return "#f9f9f9";
}

/* 🧠 Build background prompt for DALL·E */
function formatBackgroundPrompt(userPrompt: string, canvasSize: CertificateSize): string {
  const safePrompt = userPrompt
    .replace(/certificate|border|frame|award|design/gi, "")
    .trim();

  return `
A flat digital ${safePrompt}.
Design focus: professional minimalist certificate paper texture background.
Rules:
- Digital texture, not a photo of paper
- Perfectly even lighting across entire image
- No edges, corners, folds, shadows, or vignette effects
- No borders or frames
- Subtle fine paper or linen texture only
- Light, uniform tone (ivory, pearl, pale gray, or pastel)
- Smooth matte finish, no glare or gloss
- Looks like a scanned flat paper texture
Negative prompt: photo realism, shadows, borders, light falloff, folds, wrinkles
Size: ${canvasSize.width}x${canvasSize.height}px
`;
}

/* 🧩 Determine DALL·E image size */
function determineImageSize(
  width: number,
  height: number
): "1024x1024" | "1792x1024" | "1024x1792" {
  const aspectRatio = width / height;
  if (aspectRatio > 1.5) return "1792x1024";
  if (aspectRatio < 0.7) return "1024x1792";
  return "1024x1024";
}

/* 🖼 Generate image with DALL·E 3 */
async function generateImageWithDALLE(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"
): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality: "standard",
      style: "natural",
    });

    const url = response?.data?.[0]?.url ?? "";
    if (!url) console.warn("⚠️ No image URL returned from DALL·E");
    return url;
  } catch (error) {
    console.error("❌ Error generating image with DALL·E:", error);
    throw error;
  }
}

/* 🚀 Main function to generate certificate background */
export async function generateCertificateElements(
  userPrompt: string,
  selectedSize: string = "a4-landscape"
): Promise<CertificateElement[]> {
  const canvasSize = SIZE_MAP[selectedSize] || SIZE_MAP["a4-landscape"];
  const elements: CertificateElement[] = [];

  const backgroundType = detectBackgroundType(userPrompt);

  if (backgroundType === "plain") {
    console.log("🎨 Generating plain color background...");
    const color = extractColor(userPrompt);

    elements.push({
      id: `background-${Date.now()}`,
      type: "background",
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
      zIndex: 1,
      opacity: 1,
      backgroundColor: color,
    });

    console.log(`✅ Plain color background generated: ${color}`);
  } else {
    console.log("🧠 Generating textured background with DALL·E...");
    try {
      const backgroundPrompt = formatBackgroundPrompt(userPrompt, canvasSize);
      const imageSize = determineImageSize(canvasSize.width, canvasSize.height);
      const imageUrl = await generateImageWithDALLE(backgroundPrompt, imageSize);

      elements.push({
        id: `background-${Date.now()}`,
        type: "background",
        x: 0,
        y: 0,
        width: canvasSize.width,
        height: canvasSize.height,
        zIndex: 1,
        imageUrl,
        opacity: 1,
      });

      console.log("✅ Textured background generated successfully");
    } catch (error) {
      console.error("❌ Failed to generate background:", error);
    }
  }

  return elements;
}
