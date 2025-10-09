import React, { useEffect, useRef, useState } from "react";

export interface CertificateLayoutProps {
  size:
    | "a4-portrait"
    | "a4-landscape"
    | "legal-portrait"
    | "legal-landscape"
    | "letter-portrait"
    | "letter-landscape";
  children: React.ReactNode;
}

const SIZE_MAP: Record<
  CertificateLayoutProps["size"],
  { width: number; height: number }
> = {
  "a4-portrait": { width: 8.27, height: 11.69 },
  "a4-landscape": { width: 11.69, height: 8.27 },
  "legal-portrait": { width: 8.5, height: 14 },
  "legal-landscape": { width: 14, height: 8.5 },
  "letter-portrait": { width: 8.5, height: 11 },
  "letter-landscape": { width: 11, height: 8.5 },
};

const CertificateLayout: React.FC<CertificateLayoutProps> = ({
  size,
  children,
}) => {
  const { width, height } = SIZE_MAP[size];
  const aspectRatio = width / height;
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const calculateSize = () => {
      if (!containerRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const containerWidth = containerRef.current.clientWidth;
      const padding = 48;
      const availableHeight = containerHeight - padding;
      const availableWidth = containerWidth - padding;

      let canvasWidth = availableWidth;
      let canvasHeight = canvasWidth / aspectRatio;

      if (canvasHeight > availableHeight) {
        canvasHeight = availableHeight;
        canvasWidth = canvasHeight * aspectRatio;
      }

      setCanvasSize({ width: canvasWidth, height: canvasHeight });
    };

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, [aspectRatio]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-y-auto flex items-center justify-center py-6">
      <div
        className="relative bg-white shadow-2xl border border-slate-300"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
      >
        <div className="w-full h-full">{children}</div>
      </div>
    </div>
  );
};

export default CertificateLayout;
