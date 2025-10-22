export interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'signature';
  content: string;
  x: number;
  y: number;
  zIndex?: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
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


