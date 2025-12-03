import { CertificateElement } from "../types/certificate";

/**
 * Converts the Structured Custom Template JSON (Background, Borders, Specific Text Fields)
 * into the Flat Array format required by the AI Certificate Editor.
 */
export const convertCustomStateToElements = (customState: any): CertificateElement[] => {
  const elements: CertificateElement[] = [];

  // 1. Convert Background
  if (customState.background) {
    elements.push({
      id: customState.background.id,
      type: "background",
      x: 0,
      y: 0,
      width: customState.background.width,
      height: customState.background.height,
      imageUrl: customState.background.src,
      backgroundColor: customState.background.color,
      zIndex: 1,
      opacity: customState.background.opacity,
      draggable: false,
    });
  }

 

  // 2. Convert Border (Image OR CSS)
  if (customState.border) {
    // A. Image Border
    if (customState.border.src) {
        elements.push({
            id: customState.border.id,
            type: "image",
            // ⭐️ FIX: Use the specific x/y/width/height from the state, fallback only if missing
            x: customState.border.x ?? 0, 
            y: customState.border.y ?? 0,
            width: customState.border.width ?? (customState.width || 800),
            height: customState.border.height ?? (customState.height || 600),
            imageUrl: customState.border.src,
            zIndex: 2,
            draggable: true
        });
    } 
    // B. CSS Border
    else if (customState.border.borderType && customState.border.borderType !== 'none') {
        // Calculate fallback dimensions based on padding ONLY if explicit width/height are missing
        const fallbackPadding = customState.border.borderPadding || 0;
        const fallbackWidth = (customState.width || 800) - (fallbackPadding * 2);
        const fallbackHeight = (customState.height || 600) - (fallbackPadding * 2);

        elements.push({
            id: customState.border.id,
            type: "border",
            // ⭐️ FIX: Prioritize the explicit coordinates saved in the editor
            x: customState.border.x ?? fallbackPadding,
            y: customState.border.y ?? fallbackPadding,
            width: customState.border.width ?? fallbackWidth,
            height: customState.border.height ?? fallbackHeight,
            
            borderColor: customState.border.borderColor,
            borderWidth: customState.border.borderThickness,
            borderStyle: customState.border.borderType, 
            zIndex: 2,
            draggable: true
        });
    }
  }

   // 3. Convert Inner Frame
  if (customState.innerFrame) {
    elements.push({
      id: customState.innerFrame.id,
      type: "innerFrame", 
      x: customState.innerFrame.x,
      y: customState.innerFrame.y,
      width: customState.innerFrame.width,
      height: customState.innerFrame.height,
      imageUrl: customState.innerFrame.src,
      backgroundColor: customState.innerFrame.color || "transparent",
      borderColor: customState.innerFrame.color || "transparent",
      zIndex: 3,
      opacity: customState.innerFrame.opacity,
      draggable: true,
    });
  }

  // 4. Convert Corner Frames
  if (customState.cornerFrames) {
    // A. Image Corner
    if (customState.cornerFrames.src) {
        elements.push({
            id: customState.cornerFrames.id,
            type: "cornerFrame",
            x: customState.cornerFrames.x,
            y: customState.cornerFrames.y,
            width: customState.cornerFrames.width,
            height: customState.cornerFrames.height,
            imageUrl: customState.cornerFrames.src,
            zIndex: 4,
            draggable: true
        });
    }
    // B. CSS Corner
    else if (customState.cornerFrames.isCss) {
        elements.push({
            id: customState.cornerFrames.id,
            type: "cornerFrame",
            x: 0, 
            y: 0,
            width: customState.cornerFrames.width,
            height: customState.cornerFrames.height,
            backgroundColor: customState.cornerFrames.color,
            zIndex: 4,
            draggable: true
        });
    }
  }

  // 5. Convert Watermark
  if (customState.watermark && customState.watermark.src) {
    elements.push({
      id: customState.watermark.id,
      type: "image",
      x: customState.watermark.x,
      y: customState.watermark.y,
      width: customState.watermark.width,
      height: customState.watermark.height,
      imageUrl: customState.watermark.src,
      opacity: customState.watermark.opacity || 0.3,
      zIndex: 5,
      draggable: true,
    });
  }

  // 6. Convert Logos
  if (Array.isArray(customState.logos)) {
    customState.logos.forEach((logo: any) => {
      elements.push({
        id: logo.id,
        type: "image",
        x: logo.x,
        y: logo.y,
        width: logo.width,
        height: logo.height,
        imageUrl: logo.src,
        zIndex: 10,
        draggable: true,
        rotation: logo.rotation
      });
    });
  }

  // 7. Convert Custom Images
  if (Array.isArray(customState.customImages)) {
    customState.customImages.forEach((img: any) => {
      elements.push({
        id: img.id,
        type: "image",
        x: img.x,
        y: img.y,
        width: img.width,
        height: img.height,
        imageUrl: img.src,
        zIndex: 11,
        draggable: true,
        rotation: img.rotation
      });
    });
  }

  // 8. Convert Text Fields
  if (Array.isArray(customState.textFields)) {
    customState.textFields.forEach((text: any) => {
      let finalX = text.x;
      const align = text.align || 'left';
      
      if (align === 'center') {
          finalX = text.x + (text.width / 2);
      } else if (align === 'right') {
          finalX = text.x + text.width;
      }

      elements.push({
        id: text.id,
        type: "text",
        x: finalX,
        y: text.y,
        width: text.width,
        height: text.height,
        content: text.textContent || "Text",
        fontSize: text.fontSize,
        fontFamily: text.fontFamily,
        fontWeight: text.fontWeight,
        fontStyle: text.fontStyle,
        color: text.color,
        textAlign: align,
        textTransform: text.textTransform,
        textDecoration: text.textDecoration,
        zIndex: text.zIndex || 20,
        draggable: true,
        rotation: text.rotation
      });
    });
  }

  return elements;
};