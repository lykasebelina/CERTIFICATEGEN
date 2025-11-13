// src/lib/openai/openai.ts 
import { generateBackground } from "./generators/backgroundGenerator";
import { generateBorder } from "./generators/borderGenerator";
import { CertificateElement } from "../../types/certificate";

/**
 * Generates all visual layers (background + border) for a certificate,
 * based on a natural language user prompt.
 */
export async function generateCertificateElements(
  userPrompt: string,
  selectedSize: string = "a4-landscape"
): Promise<CertificateElement[]> {
  const elements: CertificateElement[] = [];

  console.log("🧩 Starting certificate element generation...");
  console.log("🗣️ Prompt:", userPrompt);
  console.log("📐 Selected size:", selectedSize);

  try {
    // 1️⃣ Background generation
    console.log("🎨 Step 1: Generating background...");
    const backgroundElements = await generateBackground(userPrompt, selectedSize);
    elements.push(...backgroundElements);
    console.log("✅ Background generation complete.");

    // 2️⃣ Border generation
    console.log("🖋️ Step 2: Generating border...");
    const borderElements = await generateBorder(userPrompt, selectedSize);
    elements.push(...borderElements);
    console.log("✅ Border generation complete.");

  } catch (error) {
    console.error("❌ Error while generating certificate elements:", error);
  }

  console.log(`🎉 Finished generating ${elements.length} elements.`);
  return elements;
}
