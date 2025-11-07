// openai.ts
import OpenAI from "openai";
import { CertificateElement } from "../types/certificate";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface LayerDefinition {
  type: CertificateElement["type"];
  prompt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity?: number;
}

interface CertificateSize {
  width: number;
  height: number;
}

// Real certificate canvas sizes
const SIZE_MAP: Record<string, CertificateSize> = {
  "a4-portrait": { width: 794, height: 1123 },
  "a4-landscape": { width: 1123, height: 794 },
  "legal-portrait": { width: 816, height: 1344 },
  "legal-landscape": { width: 1344, height: 816 },
  "letter-portrait": { width: 816, height: 1056 },
  "letter-landscape": { width: 1056, height: 816 },
};

// --- Image generation helper using GPT Image API ---
async function generateImageWithGPTImage(
  prompt: string,
  size: "1024x1024" | "1024x1536" | "1536x1024"
): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
      n: 1,
    });

    const url = response?.data?.[0]?.url;
    if (!url) {
      console.warn("⚠️ No image URL returned from image API.");
      return "";
    }
    return url;
  } catch (error) {
    console.error("❌ Error generating image with gpt-image-1:", error);
    throw error;
  }
}

// --- Map your canvas size to a supported GPT API size ---
function determineImageSize(
  width: number,
  height: number
): "1024x1024" | "1024x1536" | "1536x1024" {
  const aspectRatio = width / height;

  if (aspectRatio > 1.2) return "1536x1024"; // landscape
  if (aspectRatio < 0.8) return "1024x1536"; // portrait
  return "1024x1024"; // square-ish
}

// === MAIN GENERATOR (background-only) ===
export async function generateCertificateElements(
  userPrompt: string,
  selectedSize: string = "a4-landscape"
): Promise<CertificateElement[]> {
  const canvasSize = SIZE_MAP[selectedSize] || SIZE_MAP["a4-landscape"];

  const backgroundLayer: LayerDefinition = {
    type: "background",
    prompt: `
      Full-bleed certificate background for ${selectedSize}.
      ${userPrompt}.
      Create a professional, elegant, high-quality background.
      No text, no borders, no watermarks, no logos.
      The generated image must fill the canvas and can be cropped or scaled
      to fit A4, Legal, or Letter sizes.
    `,
    x: 0,
    y: 0,
    width: canvasSize.width,
    height: canvasSize.height,
    zIndex: 1,
    opacity: 1,
  };

  const elements: CertificateElement[] = [];

  console.log("🎨 Starting background generation...");

  try {
    // Pick a supported API size based on your canvas aspect ratio
    const imageSize = determineImageSize(backgroundLayer.width, backgroundLayer.height);
    console.log(`⏳ Generating background at ${imageSize}...`);

    const imageUrl = await generateImageWithGPTImage(backgroundLayer.prompt, imageSize);

    // Use real certificate canvas size, image will be cropped/scaled
    elements.push({
      id: `background-${Date.now()}-${Math.random()}`,
      type: "background",
      x: backgroundLayer.x,
      y: backgroundLayer.y,
      width: canvasSize.width,
      height: canvasSize.height,
      zIndex: backgroundLayer.zIndex,
      imageUrl,
      opacity: backgroundLayer.opacity,
    });

    console.log("✅ Background generated");
    await new Promise((resolve) => setTimeout(resolve, 250)); // optional small delay
  } catch (error) {
    console.error("❌ Failed to generate background:", error);
  }

  return elements.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
}
