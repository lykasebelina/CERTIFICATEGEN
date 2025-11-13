import { detectFontFamily, detectTextAlignment } from "./textPromptUtils";

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: string;
}

export function generateTextStyleFromPrompt(
  elementType: string,
  prompt: string
): TextStyle {
  const baseStyles: Record<string, TextStyle> = {
    title: {
      fontSize: 48,
      fontFamily: detectFontFamily(prompt),
      fontWeight: "bold",
      color: extractTextColor(prompt, "title"),
      textAlign: detectTextAlignment(prompt),
    },
    subtitle: {
      fontSize: 20,
      fontFamily: detectFontFamily(prompt),
      fontWeight: "normal",
      color: extractTextColor(prompt, "subtitle"),
      textAlign: detectTextAlignment(prompt),
    },
    recipient: {
      fontSize: 36,
      fontFamily: detectFontFamily(prompt),
      fontWeight: "bold",
      color: extractTextColor(prompt, "recipient"),
      textAlign: detectTextAlignment(prompt),
    },
    body: {
      fontSize: 16,
      fontFamily: detectFontFamily(prompt),
      fontWeight: "normal",
      color: extractTextColor(prompt, "body"),
      textAlign: detectTextAlignment(prompt),
    },
    date: {
      fontSize: 14,
      fontFamily: detectFontFamily(prompt),
      fontWeight: "normal",
      color: extractTextColor(prompt, "date"),
      textAlign: detectTextAlignment(prompt),
    },
    signature: {
      fontSize: 14,
      fontFamily: detectFontFamily(prompt),
      fontWeight: "normal",
      color: extractTextColor(prompt, "signature"),
      textAlign: detectTextAlignment(prompt),
    },
    footer: {
      fontSize: 12,
      fontFamily: detectFontFamily(prompt),
      fontWeight: "normal",
      color: extractTextColor(prompt, "footer"),
      textAlign: detectTextAlignment(prompt),
    },
  };

  const style = baseStyles[elementType] || baseStyles.body;

  return applyPromptModifiers(style, prompt);
}

function extractTextColor(prompt: string, elementType: string): string {
  const lower = prompt.toLowerCase();

  const colorMap: Record<string, string> = {
    "gold": "#D4AF37",
    "golden": "#D4AF37",
    "silver": "#C0C0C0",
    "black": "#000000",
    "white": "#FFFFFF",
    "dark": "#1a1a1a",
    "navy": "#000080",
    "blue": "#0066CC",
    "red": "#CC0000",
    "green": "#006600",
    "brown": "#654321",
    "gray": "#666666",
    "grey": "#666666",
  };

  if (elementType === "title") {
    if (lower.includes("gold") || lower.includes("golden")) return "#D4AF37";
    if (lower.includes("elegant") || lower.includes("luxury")) return "#2C3E50";
  }

  for (const [key, value] of Object.entries(colorMap)) {
    if (lower.includes(`${key} text`)) return value;
  }

  const hexMatch = prompt.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/);
  if (hexMatch) return hexMatch[0];

  return "#000000";
}

function applyPromptModifiers(style: TextStyle, prompt: string): TextStyle {
  const lower = prompt.toLowerCase();
  const modifiedStyle = { ...style };

  if (lower.includes("large text") || lower.includes("big text")) {
    modifiedStyle.fontSize = Math.round(style.fontSize * 1.3);
  }

  if (lower.includes("small text") || lower.includes("tiny text")) {
    modifiedStyle.fontSize = Math.round(style.fontSize * 0.8);
  }

  if (lower.includes("bold") || lower.includes("thick")) {
    modifiedStyle.fontWeight = "bold";
  }

  if (lower.includes("light weight") || lower.includes("thin")) {
    modifiedStyle.fontWeight = "300";
  }

  if (lower.includes("uppercase") || lower.includes("all caps")) {
    modifiedStyle.fontWeight = "bold";
  }

  return modifiedStyle;
}

export function getDefaultStyleForType(type: string): TextStyle {
  const defaults: Record<string, TextStyle> = {
    title: {
      fontSize: 48,
      fontFamily: "Georgia, serif",
      fontWeight: "bold",
      color: "#000000",
      textAlign: "center",
    },
    subtitle: {
      fontSize: 20,
      fontFamily: "Arial, sans-serif",
      fontWeight: "normal",
      color: "#333333",
      textAlign: "center",
    },
    recipient: {
      fontSize: 36,
      fontFamily: "Georgia, serif",
      fontWeight: "bold",
      color: "#1a1a1a",
      textAlign: "center",
    },
    body: {
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      fontWeight: "normal",
      color: "#000000",
      textAlign: "center",
    },
    date: {
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      fontWeight: "normal",
      color: "#666666",
      textAlign: "center",
    },
    signature: {
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      fontWeight: "normal",
      color: "#000000",
      textAlign: "center",
    },
  };

  return defaults[type] || defaults.body;
}
