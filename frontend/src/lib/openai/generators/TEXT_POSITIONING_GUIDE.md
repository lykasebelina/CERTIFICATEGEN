# Text Positioning System - Technical Guide

## Overview

The text positioning system ensures consistent, well-aligned text placement across all certificate types, sizes, and rendering methods (CSS and Konva Canvas).

## Core Components

### 1. Size Definitions (`sizeUtils.ts`)

All certificate sizes are defined in pixels at 96 DPI:

```typescript
SIZE_MAP = {
  "a4-portrait": { width: 794, height: 1123 },
  "a4-landscape": { width: 1123, height: 794 },
  "legal-portrait": { width: 816, height: 1344 },
  "legal-landscape": { width: 1344, height: 816 },
  "letter-portrait": { width: 816, height: 1056 },
  "letter-landscape": { width: 1056, height: 816 },
}
```

### 2. Safe Zone Calculation (`textPositionUtils.ts`)

The safe zone ensures text stays within printable margins (8% from all edges):

```typescript
calculateSafeZone(canvasSize) {
  margin = min(width, height) * 0.08
  return {
    top: margin,
    right: width - margin,
    bottom: height - margin,
    left: margin
  }
}
```

**Examples:**
- A4 Landscape (1123x794): margin = 63.52px
- A4 Portrait (794x1123): margin = 63.52px
- Letter Landscape (1056x816): margin = 65.28px

### 3. Text Position Calculation

Text elements are positioned using percentage-based coordinates within the safe zone:

```typescript
Element Type    | Y Position Formula           | Width Multiplier
----------------|------------------------------|------------------
Title           | marginY + usableHeight * 0.15| 0.9 (90% of max)
Subtitle        | marginY + usableHeight * 0.30| 0.8 (80% of max)
Recipient       | marginY + usableHeight * 0.45| 0.7 (70% of max)
Body            | marginY + usableHeight * 0.62| 0.85 (85% of max)
Date            | marginY + usableHeight * 0.80| 0.4 (40% of max)
Signature       | marginY + usableHeight * 0.90| 0.5 (50% of max)
Footer          | height - marginY - 30        | 1.0 (100% of max)
```

**Key Features:**
- All X positions are set to `centerX` (width / 2) for center alignment
- Y positions are calculated from top safe margin
- Automatic overflow protection prevents text from extending beyond safe zones

### 4. Text Rendering Consistency

#### CSS Rendering (CertificateTemplate.tsx)

```typescript
<div style={{
  position: "absolute",
  left: `${element.x}px`,          // Center X coordinate
  top: `${element.y}px`,           // Y from safe zone
  transform: "translateX(-50%)",   // Center horizontally
  textAlign: "center",             // Align text within box
  width: `${element.width}px`
}}>
```

#### Konva Rendering (KonvaCanvas.tsx)

```typescript
<Text
  x={element.x - (element.width / 2)}  // Center X - half width
  y={element.y}                         // Y from safe zone
  width={element.width}
  align="center"                        // Align text within box
/>
```

**Both methods achieve identical visual results:**
- CSS: Uses `transform: translateX(-50%)` on positioned element
- Konva: Manually calculates left edge by subtracting half-width

## Positioning Examples

### A4 Landscape (1123x794)
- Safe margin: 63.52px
- Usable dimensions: 995.96px x 666.96px

```
Title:     x=561.5,  y=163.56  (15% down safe zone)
Subtitle:  x=561.5,  y=263.61  (30% down safe zone)
Recipient: x=561.5,  y=363.65  (45% down safe zone)
Body:      x=561.5,  y=476.83  (62% down safe zone)
Date:      x=561.5,  y=597.09  (80% down safe zone)
Signature: x=561.5,  y=663.78  (90% down safe zone)
```

### A4 Portrait (794x1123)
- Safe margin: 63.52px
- Usable dimensions: 666.96px x 995.96px

```
Title:     x=397,    y=212.91  (15% down safe zone)
Subtitle:  x=397,    y=362.31  (30% down safe zone)
Recipient: x=397,    y=511.70  (45% down safe zone)
Body:      x=397,    y=681.21  (62% down safe zone)
Date:      x=397,    y=860.29  (80% down safe zone)
Signature: x=397,    y=959.88  (90% down safe zone)
```

## Adaptive Features

### 1. Orientation Handling
The system automatically adapts to portrait vs landscape orientations by:
- Using percentage-based positioning within safe zones
- Calculating margins relative to smallest dimension
- Maintaining consistent spacing ratios

### 2. Overflow Protection
```typescript
if (position.y + height > canvasSize.height - marginY) {
  position.y = canvasSize.height - marginY - height;
}
if (position.y < marginY) {
  position.y = marginY;
}
```

### 3. Background Compatibility
Text positioning works identically for:
- Plain color backgrounds (CSS)
- Gradient backgrounds (CSS)
- DALL-E generated backgrounds (PNG images)
- Textured backgrounds (PNG images)

The positioning is independent of background type, ensuring consistent layout.

## Text Styling

Text styling is controlled separately from positioning:

```typescript
generateTextStyleFromPrompt(elementType, userPrompt) returns:
  - fontSize: Element-specific (title=48px, body=16px, etc.)
  - fontFamily: Detected from prompt keywords
  - fontWeight: bold for titles/recipients, normal otherwise
  - color: Extracted from prompt or default black
  - textAlign: center (default), or left/right from prompt
}
```

## Best Practices

1. **Always use safe zones** - Never position text at absolute coordinates without considering margins

2. **Maintain aspect ratio consistency** - Use percentage-based positioning within usable area

3. **Test all sizes** - Verify positioning works across all 6 size variants (A4, Letter, Legal × portrait/landscape)

4. **Use element-specific widths** - Titles use 90% width, dates use 40%, etc.

5. **Respect z-index hierarchy** - Background (1), Border (2), Text (10+)

## Testing Checklist

When modifying text positioning:

- [ ] Test A4 portrait
- [ ] Test A4 landscape
- [ ] Test Letter portrait
- [ ] Test Letter landscape
- [ ] Test Legal portrait
- [ ] Test Legal landscape
- [ ] Verify text stays within safe zones
- [ ] Check CSS rendering (preview mode)
- [ ] Check Konva rendering (editor mode)
- [ ] Test with plain color backgrounds
- [ ] Test with gradient backgrounds
- [ ] Test with DALL-E generated backgrounds
- [ ] Verify center alignment works correctly
- [ ] Ensure no overlap between elements

## Troubleshooting

**Issue: Text appears off-center**
- Check that x = centerX (width / 2)
- Verify transform: translateX(-50%) for CSS
- Verify x - (width/2) calculation for Konva

**Issue: Text overlaps borders**
- Verify safe zone margins are calculated correctly
- Check that positions use marginY + percentage
- Ensure overflow protection is active

**Issue: Inconsistency between preview and editor**
- Compare CSS transform with Konva x calculation
- Verify both use same element.x, element.y values
- Check that width values match

**Issue: Portrait/landscape positioning differs**
- Ensure percentage-based positioning is used
- Verify margins scale with smallest dimension
- Check usableHeight calculation includes margins
