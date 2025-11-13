# Text Element Generation System

## Overview

The text generation system creates AI-powered, editable text elements for certificates, similar to Canva's template approach. Users receive pre-positioned, styled text elements that they can fully customize.

## Architecture

### Core Files

```
lib/openai/generators/
  - textGenerator.ts          (Main text generation logic)

lib/openai/utils/
  - textPromptUtils.ts        (Extract text requirements from prompts)
  - textPositionUtils.ts      (Calculate intelligent text positioning)
  - textStyleUtils.ts         (Generate text styling based on prompts)
```

## Features

### 1. Default Text Elements

Six pre-configured text element types:

- **Title**: Main certificate heading
- **Subtitle**: Secondary text or tagline
- **Recipient**: Recipient name placeholder
- **Body**: Achievement description
- **Date**: Current date
- **Signature**: Authority signature and title

### 2. Intelligent Positioning

Text elements are automatically positioned based on:
- Element type (title at top, signature at bottom)
- Canvas size (A4, Letter, Legal)
- Orientation (portrait vs landscape)
- Safe zones (margins from borders)

### 3. AI-Powered Styling

The system analyzes user prompts to determine:
- Font family (serif, sans-serif based on style keywords)
- Font size (scaled per element type)
- Font weight (bold for titles, normal for body)
- Text color (extracted from color keywords)
- Text alignment (left, center, right)

### 4. Full Editability

All generated text elements are:
- Draggable to any position
- Editable via double-click
- Resizable with transform handles
- Deletable
- Customizable (font, color, size, alignment)

## Usage

### Basic Generation

```typescript
import { generateTextElements } from './generators/textGenerator';

const textElements = await generateTextElements(
  "Create a certificate with golden title and elegant body text",
  "a4-landscape"
);
```

### Custom Text Element

```typescript
import { generateCustomTextElement } from './generators/textGenerator';

const customText = generateCustomTextElement(
  "Custom Text Content",
  "text",
  { x: 400, y: 300 },
  {
    fontSize: 24,
    fontFamily: "Georgia, serif",
    color: "#D4AF37",
    fontWeight: "bold",
  }
);
```

## Prompt Keywords

### Text Element Detection

- `title`, `heading` → Generates title element
- `subtitle`, `tagline` → Generates subtitle
- `recipient`, `name` → Generates recipient field
- `body`, `description` → Generates body text
- `date`, `issued` → Generates date element
- `signature`, `authority` → Generates signature

### Style Modifiers

- `elegant`, `classic` → Serif fonts
- `modern`, `professional` → Sans-serif fonts
- `large text`, `big` → Increased font size
- `bold`, `thick` → Bold font weight
- `gold`, `golden` → Gold text color
- `left align`, `right align` → Text alignment

## Integration

The text generator is automatically integrated into the main certificate generation:

```typescript
// In openai.ts
const textElements = await generateTextElements(userPrompt, selectedSize);
elements.push(...textElements);
```

## Text Position Calculation

### Position Algorithm

1. Calculate canvas center point
2. Define safe margins (8% of canvas dimensions)
3. Position elements at percentage-based Y coordinates:
   - Title: 20% from top
   - Subtitle: 35% from top
   - Recipient: 48% from top
   - Body: 62% from top
   - Date: 80% from top
   - Signature: 88% from top

### Safe Zone

Ensures text stays within printable area:
- Top/Bottom margin: 8% of height
- Left/Right margin: 8% of width

## Styling System

### Font Size Scale

| Element Type | Default Size | Range |
|--------------|--------------|-------|
| Title        | 48px        | 38-62px |
| Subtitle     | 20px        | 16-26px |
| Recipient    | 36px        | 29-47px |
| Body         | 16px        | 13-21px |
| Date         | 14px        | 11-18px |
| Signature    | 14px        | 11-18px |

### Color Extraction

The system detects color keywords:
- `gold`, `golden` → #D4AF37
- `silver` → #C0C0C0
- `navy` → #000080
- `red` → #CC0000
- Hex codes: `#RRGGBB`

## Editing Capabilities

Once generated, users can:

1. **Move**: Click and drag to reposition
2. **Edit**: Double-click to enter edit mode
3. **Resize**: Use transform handles
4. **Style**: Use toolbar controls to adjust:
   - Font family
   - Font size
   - Font weight (bold/normal)
   - Color
   - Alignment
5. **Delete**: Select and press delete or use toolbar

## Example Prompts

### Simple Certificate
```
"Create a certificate with title, recipient name, and date"
```
Generates: Title, recipient, date elements

### Detailed Certificate
```
"Certificate with gold title, elegant body text, and signature section"
```
Generates: All 6 default elements with gold styling on title

### Custom Styled
```
"Modern certificate with large bold title, serif body text, left-aligned date"
```
Generates: Elements with custom styling based on keywords

## API Reference

### generateTextElements()

Generates multiple text elements based on prompt analysis.

**Parameters:**
- `userPrompt` (string): User's natural language description
- `selectedSize` (string): Certificate size (default: "a4-landscape")

**Returns:**
- `Promise<CertificateElement[]>`: Array of text elements

### generateCustomTextElement()

Creates a single custom text element.

**Parameters:**
- `content` (string): Text content
- `type` ("text" | "signature"): Element type
- `position` ({ x, y }): Position coordinates
- `style` (Partial<CertificateElement>): Style overrides

**Returns:**
- `CertificateElement`: Single text element

## Best Practices

1. Always generate text elements after background and border
2. Use meaningful default content for placeholders
3. Position elements within safe zones
4. Scale font sizes based on canvas dimensions
5. Provide clear visual hierarchy (title > subtitle > body)
6. Ensure text color contrasts with background
7. Allow users to edit all generated text

## Future Enhancements

- Font library integration (Google Fonts)
- Text effects (shadow, outline, gradient)
- Multi-language support
- Text templates library
- Batch text generation for CSV data
- Text-to-path conversion for custom shapes
- Variable fonts support
