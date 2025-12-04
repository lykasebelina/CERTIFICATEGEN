import { CertificateElement } from "../../../types/certificate";

/**
 * THEME INTERPRETER
 * Detects keywords in the user's prompt and returns high-quality style directives.
 */
const getThemeStyle = (prompt: string): string => {
  const p = prompt.toLowerCase();

  // 1. PROFESSIONAL / CORPORATE
  if (p.includes('professional') || p.includes('formal') || p.includes('corporate') || p.includes('business')) {
    return `
      VISUAL STYLE: Corporate and Trustworthy.
      COLORS: Deep Navy Blue, Charcoal Grey, Forest Green, or Gold accents.
      TEXTURES: Matte paper finish, security pattern noise, or fine grain.
      VIBE: Traditional, serious, and high-authority.
    `;
  }

  // 2. CUTE / PLAYFUL / KIDS
  if (p.includes('cute') || p.includes('playful') || p.includes('kid') || p.includes('child')) {
    return `
      VISUAL STYLE: Soft and Tactile.
      COLORS: Pastels (Baby Blue, Soft Pink, Mint Green, Lavender), Cream.
      TEXTURES: Soft felt, cotton paper, or speckle patterns.
      VIBE: Cheerful, friendly, and approachable.
    `;
  }

  // 3. SIMPLE / MINIMALIST
  if (p.includes('simple') || p.includes('minimal') || p.includes('clean') || p.includes('modern')) {
    return `
      VISUAL STYLE: Ultra-Modern Minimalist.
      COLORS: Monochromatic, High-key White, Light Grey.
      TEXTURES: Smooth matte surfaces, flat noise, or very faint grain.
      VIBE: Sophisticated, airy, uncluttered, and sleek.
    `;
  }

  // 4. LUXURY / ELEGANT
  if (p.includes('luxury') || p.includes('elegant') || p.includes('royal') || p.includes('premium')) {
    return `
      VISUAL STYLE: High-End Luxury.
      COLORS: Black and Gold, Royal Blue and Silver, Deep Burgundy.
      TEXTURES: Metallic foil sheen, velvet texture, hammered metal, or rich marble grain.
      VIBE: Expensive, prestigious, and grand.
    `;
  }

  // 5. ACADEMIC / SCHOOL
  if (p.includes('school') || p.includes('academic') || p.includes('university') || p.includes('diploma')) {
    return `
      VISUAL STYLE: Classical Academic.
      COLORS: Parchment Beige, Maroon, Navy.
      TEXTURES: Heavy paper grain, old parchment feel, canvas weave.
      VIBE: Institutional and historic.
    `;
  }

  // Default fallback
  return `VISUAL STYLE: Balanced and Professional textured design.`;
};


/**
 * GENERATION RULES
 * This file controls exactly how DALL-E interprets requests based on the selected layer.
 */
export const buildDesignPrompt = (userPrompt: string, element: CertificateElement): string => {
  const zIndex = element.zIndex || 0;
  const type = element.type || 'image';

  // Get the enhanced style description based on user keywords
  const themeDirectives = getThemeStyle(userPrompt);

  // ---------------------------------------------------------
  // RULE 1: BACKGROUND LAYER (Layer 1 or type 'background')
  // STRICT: Texture/Pattern only. NO text/graphics.
  // ---------------------------------------------------------
  if (zIndex === 1 || type === 'background') {
    return `
      Create a certificate background texture based on: "${userPrompt}".
      
      ${themeDirectives}

      SPECIFIC RULES FOR BACKGROUND:
      - OUTPUT: A seamless, high-resolution texture.
      - DETAIL: Small, subtle, repetitive patterns or paper grain.
      
      NEGATIVE CONSTRAINTS (STRICTLY FORBIDDEN):
      - NO TEXT of any kind.
      - NO LARGE GRAPHICS or central illustrations.
      - NO BORDERS (this is just the surface).
      - NO FACES or PEOPLE.
    `.trim();
  }

  // ---------------------------------------------------------
  // RULE 2: INNER FRAME (Layer 3)
  // STRICT: Material textures only (Paper, Linen, Gold Foil)
  // ---------------------------------------------------------
  if (zIndex === 3) {
    return `
      Create a material texture specifically for a certificate frame insert based on: "${userPrompt}".
      
      ${themeDirectives}

      SPECIFIC RULES FOR INNER FRAME:
      - OUTPUT: A full-frame material close-up.
      - MATERIALS: Focus on the tactile feel (Paper grain, Linen weave, Metallic sheen).
      
      NEGATIVE CONSTRAINTS:
      - STRICTLY NO TEXT.
      - NO ILLUSTRATIONS.
      - NO complex drawings, just the raw material feel.
    `.trim();
  }

  // ---------------------------------------------------------
  // RULE 3: CORNER FRAMES (Layer 4 or type 'cornerFrame')
  // 🟢 UPDATED: PURE TEXTURE. NO GRADIENTS. NO BORDERS.
  // ---------------------------------------------------------
  if (zIndex === 4 || type === 'cornerFrame') {
    return `
      Create a rich, high-quality surface texture pattern based on: "${userPrompt}".
      
      ${themeDirectives}

      SPECIFIC RULES FOR THIS LAYER:
      - OUTPUT: Pure, consistent surface texture.
      - STYLE: Tactile and organic material finish (e.g., heavy paper grain, metallic foil noise, fabric weave, stone texture, speckles).
      - GOAL: A dense, interesting surface pattern.
      
      NEGATIVE CONSTRAINTS (CRITICAL):
      - STRICTLY NO GRADIENTS, NO FADES, NO COLOR BLENDING.
      - NO BORDERS, NO LINES, NO OUTLINES.
      - NO FRAMES.
      - NO DRAWN GRAPHICS.
      - NO GEOMETRIC SHAPES.
      - NO TEXT.
    `.trim();
  }

  // ---------------------------------------------------------
  // RULE 4: DEFAULT / IMAGES / LOGOS (Other Layers)
  // Standard generation for added images
  // ---------------------------------------------------------
  return `
    A high-quality isolated certificate design element based on: "${userPrompt}".
    
    ${themeDirectives}
    
    STYLE: Flat vector style or high-quality illustration.
    BACKGROUND: Isolated on a plain white background.
    CONSTRAINT: No garbled text.
  `.trim();
};