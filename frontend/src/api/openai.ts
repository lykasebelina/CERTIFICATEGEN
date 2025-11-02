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

const SIZE_MAP: Record<string, CertificateSize> = {
  "a4-portrait": { width: 794, height: 1123 },
  "a4-landscape": { width: 1123, height: 794 },
  "legal-portrait": { width: 816, height: 1344 },
  "legal-landscape": { width: 1344, height: 816 },
  "letter-portrait": { width: 816, height: 1056 },
  "letter-landscape": { width: 1056, height: 816 },
};

// === IMAGE GENERATION HELPERS ===
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

    // ✅ Type-safe safeguard
    if (!response?.data || response.data.length === 0 || !response.data[0].url) {
      console.warn("⚠️ No image URL returned from DALL-E");
      return "";
    }

    return response.data[0].url;
  } catch (error) {
    console.error("❌ Error generating image with DALL-E:", error);
    throw error;
  }
}


function determineImageSize(
  width: number,
  height: number
): "1024x1024" | "1792x1024" | "1024x1792" {
  const aspectRatio = width / height;
  if (aspectRatio > 1.5) return "1792x1024";
  if (aspectRatio < 0.7) return "1024x1792";
  return "1024x1024";
}

// === MAIN GENERATOR ===
export async function generateCertificateElements(
  userPrompt: string,
  selectedSize: string = "a4-landscape"
): Promise<CertificateElement[]> {
  const canvasSize = SIZE_MAP[selectedSize] || SIZE_MAP["a4-landscape"];

  const layerDefinitions: LayerDefinition[] = [
    {
      type: "background",
      prompt: `Full certificate background design with ${userPrompt}. Professional, elegant, high-quality certificate background. No text, no borders, just the background pattern or color gradient. Size: ${canvasSize.width}x${canvasSize.height}px`,
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
      zIndex: 1,
      opacity: 1,
    },
    {
      type: "border",
      prompt: `Elegant decorative border frame for a certificate with ${userPrompt}. PNG format with transparent background. Only the border frame, no background fill. Professional and ornate design.`,
      x: 20,
      y: 20,
      width: canvasSize.width - 40,
      height: canvasSize.height - 40,
      zIndex: 10,
      opacity: 1,
    },
    {
      type: "cornerOrnament",
      prompt: `Top-left corner ornamental flourish for certificate with ${userPrompt} theme. PNG with transparent background. Elegant, detailed, decorative.`,
      x: 40,
      y: 40,
      width: 120,
      height: 120,
      zIndex: 20,
      opacity: 1,
    },
    {
      type: "cornerOrnament",
      prompt: `Top-right corner ornamental flourish for certificate with ${userPrompt} theme. PNG with transparent background. Mirror of top-left, elegant and detailed.`,
      x: canvasSize.width - 160,
      y: 40,
      width: 120,
      height: 120,
      zIndex: 20,
      opacity: 1,
    },
    {
      type: "cornerOrnament",
      prompt: `Bottom-left corner ornamental flourish for certificate with ${userPrompt} theme. PNG with transparent background. Elegant and detailed.`,
      x: 40,
      y: canvasSize.height - 160,
      width: 120,
      height: 120,
      zIndex: 20,
      opacity: 1,
    },
    {
      type: "cornerOrnament",
      prompt: `Bottom-right corner ornamental flourish for certificate with ${userPrompt} theme. PNG with transparent background. Mirror of bottom-left, elegant and detailed.`,
      x: canvasSize.width - 160,
      y: canvasSize.height - 160,
      width: 120,
      height: 120,
      zIndex: 20,
      opacity: 1,
    },
    {
      type: "decorativeIcon",
      prompt: `Decorative seal or emblem for certificate center with ${userPrompt} theme. PNG with transparent background. Circular or shield-shaped, professional and elegant.`,
      x: canvasSize.width / 2 - 80,
      y: canvasSize.height / 2 - 80,
      width: 160,
      height: 160,
      zIndex: 15,
      opacity: 0.3,
    },
  ];

  const elements: CertificateElement[] = [];

  console.log("🎨 Starting certificate generation...");

  for (const layer of layerDefinitions) {
    try {
      console.log(`⏳ Generating ${layer.type}...`);
      const imageSize = determineImageSize(layer.width, layer.height);
      const imageUrl = await generateImageWithDALLE(layer.prompt, imageSize);

      elements.push({
        id: `${layer.type}-${Date.now()}-${Math.random()}`,
        type: layer.type,
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
        zIndex: layer.zIndex,
        imageUrl,
        opacity: layer.opacity,
      });

      console.log(`✅ Generated ${layer.type}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // small delay between layers
    } catch (error) {
      console.error(`❌ Failed to generate ${layer.type}:`, error);
    }
  }

  // === ADD STATIC TEXT ELEMENTS ===
  const textElements: CertificateElement[] = [
    {
      id: "title-text",
      type: "text",
      x: canvasSize.width / 2,
      y: canvasSize.height * 0.25,
      width: canvasSize.width * 0.8,
      zIndex: 40,
      content: "CERTIFICATE OF ACHIEVEMENT",
      fontSize: 42,
      fontWeight: "bold",
      textAlign: "center",
      color: "#1a1a1a",
    },
    {
      id: "subtitle-text",
      type: "text",
      x: canvasSize.width / 2,
      y: canvasSize.height * 0.35,
      width: canvasSize.width * 0.7,
      zIndex: 41,
      content: "This is proudly presented to",
      fontSize: 18,
      textAlign: "center",
      color: "#444444",
    },
    {
      id: "recipient-name",
      type: "text",
      x: canvasSize.width / 2,
      y: canvasSize.height * 0.45,
      width: canvasSize.width * 0.7,
      zIndex: 42,
      content: "Recipient Name",
      fontSize: 36,
      fontWeight: "bold",
      textAlign: "center",
      color: "#000000",
    },
    {
      id: "description-text",
      type: "text",
      x: canvasSize.width / 2,
      y: canvasSize.height * 0.6,
      width: canvasSize.width * 0.7,
      zIndex: 43,
      content: "For outstanding achievement and dedication",
      fontSize: 16,
      textAlign: "center",
      color: "#555555",
    },
  ];

  return [...elements.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)), ...textElements];
}
