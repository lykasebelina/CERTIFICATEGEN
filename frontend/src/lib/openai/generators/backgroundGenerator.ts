// src/lib/openai/generators/backgroundGenerator.ts

import { CertificateElement } from "../../../types/certificate";
import { SIZE_MAP } from "../utils/sizeUtils";
import {
  detectBackgroundType,
  detectGradientDirection,
  detectGradientIntensity,
  formatBackgroundPrompt,
} from "../utils/backgroundPromptUtils";
import { extractColors, adjustBaseColor, adjustColor } from "../utils/backgroundColorUtils";
import { generateImageWithDALLE, determineImageSize } from "../utils/dalleUtils";

export async function generateBackground(
  userPrompt: string,
  selectedSize: string
): Promise<CertificateElement[]> {
  const canvasSize = SIZE_MAP[selectedSize] || SIZE_MAP["a4-landscape"];
  const elements: CertificateElement[] = [];

  // 🧊 STEP 1: Handle “no background” cases early
  const noBgRegex =
    /\b(no background|without background|no bg|transparent background|border only|no fill behind text)\b/i;

  if (noBgRegex.test(userPrompt)) {
    console.log("🚫 Skipping background generation — using plain white background instead.");
    elements.push({
      id: `background-${Date.now()}`,
      type: "background",
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
      zIndex: 1,
      opacity: 1,
      backgroundColor: "#ffffff", // ✅ always white background
    });
    return elements;
  }

  // 🧠 STEP 2: Detect background type as normal
  const backgroundType = detectBackgroundType(userPrompt);

  if (backgroundType === "plain" || backgroundType === "gradient") {
    console.log("🎨 Generating color or gradient background...");

    const baseColors = extractColors(userPrompt);
    const direction = detectGradientDirection(userPrompt);
    const intensity = detectGradientIntensity(userPrompt);
    const colors = baseColors.map((c: string) => adjustBaseColor(c, userPrompt));

    let gradientColors = colors;

    if (backgroundType === "gradient") {
      if (gradientColors.length === 1) {
        gradientColors = [
          adjustColor(gradientColors[0], -0.1),
          adjustColor(gradientColors[0], 0.3),
        ];
      } else if (gradientColors.length > 1) {
        gradientColors = [
          adjustColor(gradientColors[0], intensity / 2),
          adjustColor(gradientColors[1], -intensity / 2),
        ];
      }
    }

    const style =
      backgroundType === "gradient"
        ? direction === "circle"
          ? `radial-gradient(${gradientColors[0]}, ${gradientColors[1]})`
          : `linear-gradient(${direction}, ${gradientColors[0]}, ${gradientColors[1]})`
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
