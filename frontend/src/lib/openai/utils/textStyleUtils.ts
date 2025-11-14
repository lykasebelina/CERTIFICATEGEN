import { TextElementConfig } from "../generators/textGenerator";

export function extractTextElementsFromPrompt(prompt: string): TextElementConfig[] {
  const lower = prompt.toLowerCase();
  const elements: TextElementConfig[] = [];

  const titleKeywords = ["title", "heading", "main title", "certificate title"];
  const subtitleKeywords = ["subtitle", "tagline", "subheading", "presented to"];
  const recipientKeywords = ["recipient", "name", "awardee", "honoree"];
  const bodyKeywords = ["body", "description", "achievement", "reason", "for"];
  const dateKeywords = ["date", "issued", "awarded on"];
  const signatureKeywords = ["signature", "sign", "authority", "director", "authorized"];

  if (titleKeywords.some((kw) => lower.includes(kw))) {
    elements.push({
      type: "title",
      placeholder: "Certificate Title",
      defaultContent: extractTitleFromPrompt(prompt),
      priority: 1,
    });
  }

  if (subtitleKeywords.some((kw) => lower.includes(kw))) {
    elements.push({
      type: "subtitle",
      placeholder: "Subtitle",
      defaultContent: "This certificate is proudly presented to",
      priority: 2,
    });
  }

  if (recipientKeywords.some((kw) => lower.includes(kw))) {
    elements.push({
      type: "recipient",
      placeholder: "Recipient Name",
      defaultContent: "[Recipient Name]",
      priority: 3,
    });
  }

  if (bodyKeywords.some((kw) => lower.includes(kw))) {
    elements.push({
      type: "body",
      placeholder: "Body Text",
      defaultContent: extractBodyFromPrompt(prompt),
      priority: 4,
    });
  }

  if (dateKeywords.some((kw) => lower.includes(kw))) {
    elements.push({
      type: "date",
      placeholder: "Date",
      defaultContent: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      priority: 5,
    });
  }

  if (signatureKeywords.some((kw) => lower.includes(kw))) {
    elements.push({
      type: "signature",
      placeholder: "Signature",
      defaultContent: "Authorized Signature\nDirector",
      priority: 6,
    });
  }

  return elements;
}

function extractTitleFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();

  const achievementPatterns = [
    "certificate of achievement",
    "certificate of excellence",
    "certificate of completion",
    "certificate of appreciation",
    "certificate of participation",
    "award certificate",
    "recognition certificate",
  ];

  for (const pattern of achievementPatterns) {
    if (lower.includes(pattern)) {
      return pattern
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  if (lower.includes("training")) return "Training Certificate";
  if (lower.includes("workshop")) return "Workshop Certificate";
  if (lower.includes("seminar")) return "Seminar Certificate";
  if (lower.includes("course")) return "Course Completion Certificate";
  if (lower.includes("award")) return "Award Certificate";
  if (lower.includes("honor")) return "Certificate of Honor";
  if (lower.includes("merit")) return "Certificate of Merit";

  return "Certificate of Achievement";
}

function extractBodyFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("outstanding") || lower.includes("excellence")) {
    return "For outstanding performance and dedication in completing the program with excellence";
  }
  if (lower.includes("completion")) {
    return "For successfully completing the required coursework and demonstrating proficiency";
  }
  if (lower.includes("participation")) {
    return "For active participation and valuable contribution to the program";
  }
  if (lower.includes("achievement")) {
    return "For remarkable achievement and commitment to professional growth";
  }
  if (lower.includes("appreciation")) {
    return "In appreciation of your valuable service and dedication";
  }

  return "For demonstrating exceptional skills and commitment throughout the program";
}

export function detectTextAlignment(prompt: string): "left" | "center" | "right" {
  const lower = prompt.toLowerCase();

  if (lower.includes("left align") || lower.includes("align left")) return "left";
  if (lower.includes("right align") || lower.includes("align right")) return "right";

  return "center";
}

export function detectFontFamily(prompt: string): string {
  const lower = prompt.toLowerCase();

  const fontMap: Record<string, string> = {
    "serif": "Georgia, serif",
    "sans": "Arial, sans-serif",
    "modern": "Helvetica, Arial, sans-serif",
    "classic": "Times New Roman, serif",
    "elegant": "Georgia, serif",
    "formal": "Times New Roman, serif",
    "casual": "Arial, sans-serif",
    "professional": "Arial, sans-serif",
  };

  for (const [key, value] of Object.entries(fontMap)) {
    if (lower.includes(key)) return value;
  }

  return "Arial, sans-serif";
}

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: string;
}

export function generateTextStyleFromPrompt(
  elementType: string,
  userPrompt: string
): TextStyle {
  const lower = userPrompt.toLowerCase();

  const fontSizeMap: Record<string, number> = {
    title: 48,
    subtitle: 20,
    recipient: 36,
    body: 16,
    date: 14,
    signature: 14,
    footer: 12,
  };

  let fontSize = fontSizeMap[elementType] || 16;

  if (lower.includes("large text") || lower.includes("big")) {
    fontSize = Math.round(fontSize * 1.3);
  } else if (lower.includes("small text")) {
    fontSize = Math.round(fontSize * 0.8);
  }

  const fontFamily = detectFontFamily(userPrompt);
  const textAlign = detectTextAlignment(userPrompt);

  let fontWeight = "normal";
  if (elementType === "title" || elementType === "recipient") {
    fontWeight = "bold";
  }
  if (lower.includes("bold") || lower.includes("thick")) {
    fontWeight = "bold";
  }

  let color = "#000000";
  const colorMatch = lower.match(/\b(gold|golden|silver|navy|red|blue|green|white|black)\b/);
  if (colorMatch) {
    const colorMap: Record<string, string> = {
      gold: "#D4AF37",
      golden: "#D4AF37",
      silver: "#C0C0C0",
      navy: "#000080",
      red: "#CC0000",
      blue: "#0000CC",
      green: "#008000",
      white: "#FFFFFF",
      black: "#000000",
    };
    color = colorMap[colorMatch[0]] || "#000000";
  }

  return {
    fontSize,
    fontFamily,
    fontWeight,
    color,
    textAlign,
  };
}
