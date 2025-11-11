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

/** 🧩 Normalize the user prompt to produce flat minimalist paper-like backgrounds */
function formatBackgroundPrompt(userPrompt: string, canvasSize: CertificateSize): string {
  const safePrompt = userPrompt
    .replace(/certificate|border|frame|award|design/gi, "")
    .trim();

 return `
A flat digital paper texture background in ${safePrompt}.
Design focus: professional minimalist certificate base surface.
Rules:
- Digital texture, not a photo of paper
- Perfectly even lighting across entire image
- No edges, corners, folds, shadows, or light falloff
- No borders, frames, or vignette effects
- Subtle fine paper or linen texture only
- Light, uniform tone (ivory, pearl, pale gray, or pastel)
- Smooth matte finish, no glare or gloss
- Looks like a scanned flat background, not a photographed sheet
- Must leave wide blank space for text placement
Negative prompt: photo realism, shadows, borders, light falloff, vignette, folds, wrinkles, lighting gradient
Size: ${canvasSize.width}x${canvasSize.height}px
`;
}

/** Determine image size to match aspect ratio */
function determineImageSize(
  width: number,
  height: number
): "1024x1024" | "1792x1024" | "1024x1792" {
  const aspectRatio = width / height;
  if (aspectRatio > 1.5) return "1792x1024";
  if (aspectRatio < 0.7) return "1024x1792";
  return "1024x1024";
}

/** Generate image via DALL·E 3 */
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

/** Generate minimal background element */
export async function generateCertificateElements(
  userPrompt: string,
  selectedSize: string = "a4-landscape"
): Promise<CertificateElement[]> {
  const canvasSize = SIZE_MAP[selectedSize] || SIZE_MAP["a4-landscape"];
  const elements: CertificateElement[] = [];

  console.log("🎨 Starting background generation...");

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

    console.log("✅ Background generated successfully");
  } catch (error) {
    console.error("❌ Failed to generate background:", error);
  }

  return elements;
}

//good with texture, no promt detection