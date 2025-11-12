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

/* 🔍 Detect background type */
function detectBackgroundType(prompt: string): "plain" | "textured" | "gradient" {
  const lower = prompt.toLowerCase();

  if (lower.includes("gradient")) return "gradient";

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
  return "textured";
}

/* 🎨 Universal color extractor */
function extractColors(prompt: string): string[] {
  const lower = prompt.toLowerCase().trim();

  const hexMatches = lower.match(/#([0-9a-f]{3,6})\b/gi);
  if (hexMatches?.length) return hexMatches;

  const rgbMatches = lower.match(/(rgb|hsl)\([^)]*\)/gi);
  if (rgbMatches?.length) return rgbMatches;

  const colorWords = lower.match(/\b[a-z]+\b/g) || [];
  const validColors = colorWords.filter(isColorValid);

  return validColors.slice(0, 2).length > 0 ? validColors.slice(0, 2) : ["#f9f9f9"];
}

/* ✅ Cross-environment color validation (no require) */
function isColorValid(color: string): boolean {
  if (typeof window !== "undefined") {
    const s = new Option().style;
    s.color = color;
    return s.color !== "";
  }
  const cssColors = [
    "red", "green", "blue", "yellow", "purple", "orange", "pink", "brown", "black", "white", "gray", "grey",
    "teal", "navy", "lime", "aqua", "maroon", "olive", "silver", "gold", "beige", "ivory", "violet", "indigo",
  ];
  return cssColors.includes(color.toLowerCase());
}

/* 🧭 Gradient helpers */
function detectGradientDirection(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("vertical")) return "to bottom";
  if (lower.includes("horizontal")) return "to right";
  if (lower.includes("diagonal")) return "to bottom right";
  if (lower.includes("radial")) return "circle";
  if (lower.includes("top")) return "to bottom";
  if (lower.includes("bottom")) return "to top";
  if (lower.includes("left")) return "to right";
  if (lower.includes("right")) return "to left";
  return "to right";
}

/* 🎚 Detect gradient intensity (now used!) */
function detectGradientIntensity(prompt: string): number {
  const lower = prompt.toLowerCase();
  if (lower.includes("subtle") || lower.includes("soft")) return 0.15;
  if (lower.includes("moderate") || lower.includes("medium")) return 0.35;
  if (lower.includes("strong") || lower.includes("intense") || lower.includes("deep")) return 0.6;
  return 0.3;
}

/* 🧠 Build DALL·E prompt */
function formatBackgroundPrompt(userPrompt: string, canvasSize: CertificateSize): string {
  const safePrompt = userPrompt.replace(/certificate|border|frame|award|design/gi, "").trim();
  return `
A flat digital ${safePrompt}.
Design focus: professional minimalist certificate paper texture background.
Rules:
- Digital texture, not a photo of paper
- Perfectly even lighting
- No edges, folds, or borders
- Subtle fine paper or linen texture only
- Light, uniform tone
Negative prompt: photo realism, shadows, wrinkles
Size: ${canvasSize.width}x${canvasSize.height}px
`;
}

/* 📐 Choose image size */
function determineImageSize(
  width: number,
  height: number
): "1024x1024" | "1792x1024" | "1024x1792" {
  const aspectRatio = width / height;
  if (aspectRatio > 1.5) return "1792x1024";
  if (aspectRatio < 0.7) return "1024x1792";
  return "1024x1024";
}

/* 🖼 Generate with DALL·E */
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
    return response?.data?.[0]?.url ?? "";
  } catch (error) {
    console.error("❌ Error generating image:", error);
    throw error;
  }
}

/* 🚀 Main function */
export async function generateCertificateElements(
  userPrompt: string,
  selectedSize: string = "a4-landscape"
): Promise<CertificateElement[]> {
  const canvasSize = SIZE_MAP[selectedSize] || SIZE_MAP["a4-landscape"];
  const elements: CertificateElement[] = [];

  const backgroundType = detectBackgroundType(userPrompt);

  if (backgroundType === "plain" || backgroundType === "gradient") {
    console.log("🎨 Generating color or gradient background...");
    const colors = extractColors(userPrompt);
    const direction = detectGradientDirection(userPrompt);
    const intensity = detectGradientIntensity(userPrompt); // ✅ now used

    // Slightly adjust color brightness for "intensity" feel
    const adjustColor = (color: string, amount: number) => {
      const el = document.createElement("div");
      el.style.color = color;
      document.body.appendChild(el);
      const rgb = getComputedStyle(el).color.match(/\d+/g)?.map(Number) || [255, 255, 255];
      document.body.removeChild(el);
      const [r, g, b] = rgb.map((v) => Math.max(0, Math.min(255, v + (255 - v) * amount)));
      return `rgb(${r}, ${g}, ${b})`;
    };

    const adjustedColors =
      backgroundType === "gradient" && colors.length > 1
        ? [adjustColor(colors[0], intensity / 2), adjustColor(colors[1], -intensity / 2)]
        : colors;

    const style =
      backgroundType === "gradient" && adjustedColors.length > 1
        ? direction === "circle"
          ? `radial-gradient(${adjustedColors[0]}, ${adjustedColors[1]})`
          : `linear-gradient(${direction}, ${adjustedColors[0]}, ${adjustedColors[1]})`
        : undefined;

    elements.push({
      id: `background-${Date.now()}`,
      type: "background",
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
      zIndex: 1,
      opacity: 1,
      backgroundColor: backgroundType === "plain" ? colors[0] : undefined,
      imageUrl: backgroundType === "gradient" ? style : undefined,
    });

    console.log(`✅ ${backgroundType} background generated`);
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
