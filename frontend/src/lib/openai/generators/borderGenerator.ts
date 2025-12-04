// src/lib/openai/generators/borderGenerator.ts

import { CertificateElement } from "../../../types/certificate";
import { SIZE_MAP } from "../utils/sizeUtils";
import {
<<<<<<< HEAD
  detectBorderType,
  detectBorderThickness,
  formatBorderPrompt,
} from "../utils/borderPromptUtils";
=======
  detectBorderThickness,
} from "../utils/borderPromptUtils"; // NOTE: detectBorderType removed from import
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
import {
  extractBorderColor,
  ensureContrast,
  shadeColor,
} from "../utils/borderColorUtils";
<<<<<<< HEAD
import { determineImageSize, generateImageWithDALLE } from "../utils/dalleUtils";
=======
// NOTE: Imports for dalleUtils removed
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b

export async function generateBorder(
  userPrompt: string,
  selectedSize: string = "a4-landscape"
): Promise<CertificateElement[]> {
  const canvasSize = SIZE_MAP[selectedSize] || SIZE_MAP["a4-landscape"];
  const elements: CertificateElement[] = [];

  // 🧭 Step 0: Skip if user requested no border
  if (/\b(no border|without border|remove border|borderless)\b/i.test(userPrompt)) {
    console.log("🚫 Border skipped as per user prompt.");
    return [];
  }

<<<<<<< HEAD
  const borderType = detectBorderType(userPrompt);
=======
  // NOTE: detectBorderType check removed, as we only support 'simple' CSS border now.
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
  const thickness = detectBorderThickness(userPrompt);
  const rawColor = extractBorderColor(userPrompt) || "#000000";

  // Default background is white; if background element exists, use that
<<<<<<< HEAD
=======
  // NOTE: Since this function only generates border, it can't reliably find a previously generated 'background'
  // It's safer to use the background color from the prompt or default to white, but maintaining existing contrast logic:
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
  const backgroundElement = elements.find((e) => e.type === "background");
  const bgColor = backgroundElement?.backgroundColor || "#FFFFFF";
  const color = ensureContrast(rawColor, bgColor);

<<<<<<< HEAD
  if (borderType === "simple") {
    console.log("🖋️ Generating simple CSS border...");

    const inset = thickness * 2;
    let style = "solid";
    const lower = userPrompt.toLowerCase();

    if (lower.includes("double")) style = "double";
    else if (lower.includes("dotted")) style = "dotted";
    else if (lower.includes("dashed")) style = "dashed";

    // For "double" style, use outer/inner color shading
    const adjustedColor =
      style === "double" ? shadeColor(color, -30) : color;

    elements.push({
      id: `border-${Date.now()}`,
      type: "border",
      x: inset,
      y: inset,
      width: canvasSize.width - inset * 2,
      height: canvasSize.height - inset * 2,
      zIndex: 2,
      opacity: 1,
      content: `${thickness}px ${style} ${adjustedColor}`,
    });

    console.log(`✅ ${thickness}px ${style} ${adjustedColor} border generated`);
  } else {
    console.log("🎨 Generating ornate border with DALL·E...");

    try {
      const borderPrompt = formatBorderPrompt(userPrompt, canvasSize);
      const imageSize = determineImageSize(canvasSize.width, canvasSize.height);
      const imageUrl = await generateImageWithDALLE(borderPrompt, imageSize);

      elements.push({
        id: `border-${Date.now()}`,
        type: "border",
        x: 0,
        y: 0,
        width: canvasSize.width,
        height: canvasSize.height,
        zIndex: 2,
        imageUrl,
        opacity: 1,
      });

      console.log("✅ Ornate border generated successfully");
    } catch (error) {
      console.error("❌ Failed to generate border:", error);
    }
  }

  return elements;
}
=======
  console.log("🖋️ Generating simple CSS border...");

  const inset = thickness * 2;
  let style = "solid";
  const lower = userPrompt.toLowerCase();

  // Determine border style
  if (lower.includes("double")) style = "double";
  else if (lower.includes("dotted")) style = "dotted";
  else if (lower.includes("dashed")) style = "dashed";

  // For "double" style, use outer/inner color shading
  const adjustedColor =
    style === "double" ? shadeColor(color, -30) : color;

  elements.push({
    id: `border-${Date.now()}`,
    type: "border",
    x: inset,
    y: inset,
    width: canvasSize.width - inset * 2,
    height: canvasSize.height - inset * 2,
    zIndex: 2,
    opacity: 1,
    content: `${thickness}px ${style} ${adjustedColor}`, // CSS content format
  });

  console.log(`✅ ${thickness}px ${style} ${adjustedColor} border generated`);

  return elements;
}
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
