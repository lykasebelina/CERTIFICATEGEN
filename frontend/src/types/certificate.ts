<<<<<<< HEAD
// src/lib/types/certificate.ts

export interface CertificateElement {
  id: string;
  type:
    | "text"
    | "image"
    | "signature"
    | "background"
    | "border"
    | "cornerOrnament"
    | "decorativeIcon"
    | "logo"
    | "qrCode"
    | "watermark"
    | "backgroundPattern"
    | "margin"
    | "frameElements";

  // --- Common fields ---
  content?: string;
  x: number;
  y: number;
  zIndex?: number;
  width?: number;
  height?: number;
  opacity?: number;

  // --- Text styling ---
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  fontWeight?: string;
  textAlign?: string;

  // --- Visuals / Backgrounds ---
  imageUrl?: string; // background images, border textures, decorative patterns
  backgroundColor?: string;

  // --- 🟨 Border-specific additions ---
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "none";
}

export type CertificateSize =
  | "a4-portrait"
  | "a4-landscape"
  | "letter-portrait"
  | "letter-landscape"
  | "legal-portrait"
  | "legal-landscape";

export interface CertificateData {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor?: string;
  backgroundImage?: string;
  size: CertificateSize;
  layers?: CertificateLayer[];
  elements: CertificateElement[];
  createdAt: Date;
  prompt?: string;
}

export interface AIPrompt {
  description: string;
  style: string;
  colors: string[];
  theme: string;
}

export interface CertificateLayer {
  id: string;
  type: "image";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}
=======
// src/types/certificate.ts

export interface CertificateElement {
	id: string;
	type:
		| "text"
		| "image"
		| "signature"
		| "background"
		| "border"
		| "cornerFrame"
		| "cornerOrnament"
		| "decorativeIcon"
		| "logo"
		| "qrCode"
		| "watermark"
		| "backgroundPattern"
		| "margin"
		| "frameElements"
		| "innerFrame";

	// --- Common fields ---
	content?: string; // For text/signature content, also used for QR Code URL/Data
	x: number;
	y: number;
	zIndex?: number;
	width?: number;
	height?: number;
	opacity?: number;

	// --- Text styling ---
	fontSize?: number;
	fontFamily?: string;
	color?: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	align?: "left" | "center" | "right";
	textAlign?: string;
	fontWeight?: string;
	letterSpacing?: number;
	lineHeight?: number;
	textTransform?: "uppercase" | "capitalize" | "none";
	wrap?: "word" | "char" | "none";

	textDecoration?: string;

	textFrameWidth?: number; // Fixed text frame width
	textFrameHeight?: number; // Fixed text frame height
	maxChars?: number; // Maximum characters allowed

	// --- Transform controls (Konva-compatible) ---
	scaleX?: number;
	scaleY?: number;
	rotation?: number;
	rotate?: number;

	// --- Metadata for corner frames ---
	metadata?: CornerFrameMetadata;

	// --- Signature-specific additions ---
	isSignatureLine?: boolean;

	// --- Visuals / Backgrounds / Images ---
	imageUrl?: string; // Background, corner frames, decorative icons, also used for QR Code base64 image
	backgroundColor?: string;
	style?: Record<string, string>;

	// --- Border-specific additions ---
	borderColor?: string;
	borderWidth?: number;
	borderStyle?: "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "none";

	// --- Fabric.js / Konva control flags ---
	selectable?: boolean;
	draggable?: boolean;

	// --- Auto-flow / manual placement ---
	autoFlow?: boolean; // participate in auto vertical flow
	manualY?: boolean; // user manually dragged
	measuredHeight?: number; // height measured after rendering
}

export interface CornerFrameMetadata {
	corner: "tl" | "tr" | "bl" | "br";
	isCornerFrame: true;
}

export type CertificateSize =
	| "a4-portrait"
	| "a4-landscape"
	| "letter-portrait"
	| "letter-landscape"
	| "legal-portrait"
	| "legal-landscape";

// ⭐️ UPDATED: Add a unique ID field to the bulk instance
export interface GeneratedCertificate {
    id: string; // ⭐️ NEW: Unique ID for the instance
	name: string;
	elements: CertificateElement[];
}

export interface CertificateData {
	id: string;
	name: string;
	width: number;
	height: number;
	backgroundColor?: string;
	backgroundImage?: string;
	size: CertificateSize;
	layers?: CertificateLayer[];
	elements: CertificateElement[];
	createdAt: Date;
	prompt?: string;
	// ⭐️ CRITICAL ADDITION: Field to hold the bulk exports
	generated_instances?: GeneratedCertificate[] | null;
}

export interface AIPrompt {
	description: string;
	style: string;
	colors: string[];
	theme: string;
}

export interface CertificateLayer {
	id: string;
	type: "image";
	src: string;
	x: number;
	y: number;
	width: number;
	height: number;
	zIndex?: number;
}
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
