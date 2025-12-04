// src/lib/openai/utils/dalleUtils.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/** Determines DALL·E size based on aspect ratio */
export function determineImageSize(
  width: number,
  height: number
): "1024x1024" | "1792x1024" | "1024x1792" {
  const aspectRatio = width / height;
  if (aspectRatio > 1.5) return "1792x1024";
  if (aspectRatio < 0.7) return "1024x1792";
  return "1024x1024";
}

/** Calls DALL·E to generate an image from a formatted prompt */
export async function generateImageWithDALLE(
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
<<<<<<< HEAD
    });
    return response?.data?.[0]?.url ?? "";
=======
      // 🟢 CRITICAL CHANGE: Request Base64 JSON instead of URL
      response_format: "b64_json", 
    });
    
    // Return the Base64 string data
    return response.data[0].b64_json ?? "";
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
  } catch (error) {
    console.error("❌ Error generating image:", error);
    throw error;
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
