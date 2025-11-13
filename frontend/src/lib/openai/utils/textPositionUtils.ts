import { CertificateSize } from "./sizeUtils";

export interface TextPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateTextPosition(
  elementType: string,
  canvasSize: CertificateSize,
  existingElementCount: number
): TextPosition {
  const centerX = canvasSize.width / 2;
  const margin = 80;
  const maxWidth = canvasSize.width - margin * 2;

  const positions: Record<string, TextPosition> = {
    title: {
      x: centerX,
      y: canvasSize.height * 0.2,
      width: maxWidth,
      height: 80,
    },
    subtitle: {
      x: centerX,
      y: canvasSize.height * 0.35,
      width: maxWidth * 0.8,
      height: 40,
    },
    recipient: {
      x: centerX,
      y: canvasSize.height * 0.48,
      width: maxWidth * 0.7,
      height: 60,
    },
    body: {
      x: centerX,
      y: canvasSize.height * 0.62,
      width: maxWidth * 0.85,
      height: 100,
    },
    date: {
      x: centerX,
      y: canvasSize.height * 0.8,
      width: maxWidth * 0.4,
      height: 30,
    },
    signature: {
      x: centerX,
      y: canvasSize.height * 0.88,
      width: maxWidth * 0.5,
      height: 60,
    },
    footer: {
      x: centerX,
      y: canvasSize.height * 0.93,
      width: maxWidth,
      height: 30,
    },
  };

  return positions[elementType] || {
    x: centerX,
    y: canvasSize.height * 0.5 + existingElementCount * 50,
    width: maxWidth * 0.6,
    height: 40,
  };
}

export function adjustPositionForOrientation(
  position: TextPosition,
  isPortrait: boolean
): TextPosition {
  if (isPortrait) {
    return {
      ...position,
      y: position.y * 1.1,
    };
  }
  return position;
}

export function calculateSafeZone(canvasSize: CertificateSize): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const margin = Math.min(canvasSize.width, canvasSize.height) * 0.08;

  return {
    top: margin,
    right: canvasSize.width - margin,
    bottom: canvasSize.height - margin,
    left: margin,
  };
}

export function isPositionInSafeZone(
  x: number,
  y: number,
  canvasSize: CertificateSize
): boolean {
  const safeZone = calculateSafeZone(canvasSize);

  return (
    x >= safeZone.left &&
    x <= safeZone.right &&
    y >= safeZone.top &&
    y <= safeZone.bottom
  );
}
