// src/lib/openai/utils/sizeUtils.ts
<<<<<<< HEAD
=======
export const INCH_TO_PX = 96; // approx
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b

export interface CertificateSize {
  width: number;
  height: number;
}

export const SIZE_MAP: Record<string, CertificateSize> = {
  "a4-portrait": { width: 794, height: 1123 },
  "a4-landscape": { width: 1123, height: 794 },
<<<<<<< HEAD
  "legal-portrait": { width: 816, height: 1344 },
  "legal-landscape": { width: 1344, height: 816 },
=======
  "legal-portrait": { width: 816, height: 1248 },
  "legal-landscape": { width: 1248, height: 816 },
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
  "letter-portrait": { width: 816, height: 1056 },
  "letter-landscape": { width: 1056, height: 816 },
};
