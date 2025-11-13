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
