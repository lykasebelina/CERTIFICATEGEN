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

  const safeZone = calculateSafeZone(canvasSize);
  const marginX = safeZone.left;
  const marginY = safeZone.top;

  const maxWidth = canvasSize.width - marginX * 2;
  const usableHeight = canvasSize.height - marginY * 2;

  const positions: Record<string, TextPosition> = {
    title: {
      x: centerX,
      y: marginY + usableHeight * 0.15,
      width: maxWidth * 0.9,
      height: 80,
    },
    subtitle: {
      x: centerX,
      y: marginY + usableHeight * 0.30,
      width: maxWidth * 0.8,
      height: 40,
    },
    recipient: {
      x: centerX,
      y: marginY + usableHeight * 0.45,
      width: maxWidth * 0.7,
      height: 60,
    },
    body: {
      x: centerX,
      y: marginY + usableHeight * 0.62,
      width: maxWidth * 0.85,
      height: 100,
    },
    date: {
      x: centerX,
      y: marginY + usableHeight * 0.80,
      width: maxWidth * 0.4,
      height: 30,
    },
    signature: {
      x: centerX,
      y: marginY + usableHeight * 0.90,
      width: maxWidth * 0.5,
      height: 60,
    },
    footer: {
      x: centerX,
      y: canvasSize.height - marginY - 30,
      width: maxWidth,
      height: 30,
    },
  };

  const position = positions[elementType] || {
    x: centerX,
    y: marginY + usableHeight * 0.5 + existingElementCount * 50,
    width: maxWidth * 0.6,
    height: 40,
  };

  if (position.y + (position.height || 0) > canvasSize.height - marginY) {
    position.y = canvasSize.height - marginY - (position.height || 40);
  }

  if (position.y < marginY) {
    position.y = marginY;
  }

  return position;
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
