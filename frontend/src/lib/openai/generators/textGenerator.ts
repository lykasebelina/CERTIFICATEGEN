import { CertificateElement } from "../../../types/certificate";
import { SIZE_MAP } from "../utils/sizeUtils";
import { extractTextElementsFromPrompt } from "../utils/textPromptUtils";
import { calculateTextPosition } from "../utils/textPositionUtils";
import { generateTextStyleFromPrompt } from "../utils/textStyleUtils";

export interface TextElementConfig {
  type: "title" | "subtitle" | "recipient" | "body" | "footer" | "date" | "signature";
  placeholder: string;
  defaultContent: string;
  priority: number;
}

const DEFAULT_TEXT_ELEMENTS: TextElementConfig[] = [
  {
    type: "title",
    placeholder: "Certificate Title",
    defaultContent: "Certificate of Achievement",
    priority: 1,
  },
  {
    type: "subtitle",
    placeholder: "Subtitle or Tagline",
    defaultContent: "This certificate is proudly presented to",
    priority: 2,
  },
  {
    type: "recipient",
    placeholder: "Recipient Name",
    defaultContent: "[Recipient Name]",
    priority: 3,
  },
  {
    type: "body",
    placeholder: "Certificate Body",
    defaultContent: "For outstanding performance and dedication in completing the program with excellence",
    priority: 4,
  },
  {
    type: "date",
    placeholder: "Date",
    defaultContent: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    priority: 5,
  },
  {
    type: "signature",
    placeholder: "Signature & Authority",
    defaultContent: "Authorized Signature\nDirector",
    priority: 6,
  },
];

export async function generateTextElements(
  userPrompt: string,
  selectedSize: string = "a4-landscape"
): Promise<CertificateElement[]> {
  const canvasSize = SIZE_MAP[selectedSize] || SIZE_MAP["a4-landscape"];
  const elements: CertificateElement[] = [];

  console.log("📝 Starting text element generation...");

  const requestedElements = extractTextElementsFromPrompt(userPrompt);
  const elementsToGenerate = requestedElements.length > 0
    ? requestedElements
    : DEFAULT_TEXT_ELEMENTS;

  console.log(`📋 Generating ${elementsToGenerate.length} text elements`);

  for (const config of elementsToGenerate) {
    const position = calculateTextPosition(
      config.type,
      canvasSize,
      elements.length
    );

    const style = generateTextStyleFromPrompt(config.type, userPrompt);

    const textElement: CertificateElement = {
      id: `text-${config.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: config.type === "signature" ? "signature" : "text",
      content: config.defaultContent,
      x: position.x,
      y: position.y,
      width: position.width,
      height: position.height,
      zIndex: 10 + config.priority,
      opacity: 1,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      color: style.color,
      textAlign: style.textAlign,
    };

    elements.push(textElement);
    console.log(`✅ Generated ${config.type} text element at (${position.x}, ${position.y})`);
  }

  console.log(`🎉 Finished generating ${elements.length} text elements`);
  return elements;
}

export function generateCustomTextElement(
  content: string,
  type: "text" | "signature",
  position: { x: number; y: number },
  style?: Partial<CertificateElement>
): CertificateElement {
  return {
    id: `text-custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    content,
    x: position.x,
    y: position.y,
    width: style?.width || 400,
    height: style?.height || 60,
    zIndex: style?.zIndex || 20,
    opacity: style?.opacity || 1,
    fontSize: style?.fontSize || 16,
    fontFamily: style?.fontFamily || "Arial",
    fontWeight: style?.fontWeight || "normal",
    color: style?.color || "#000000",
    textAlign: style?.textAlign || "center",
  };
}
