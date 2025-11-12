//CertificateTemplate.tsx

import { CertificateElement } from "../types/certificate";

interface CertificateTemplateProps {
  elements?: CertificateElement[];
  onElementMove?: (id: string, x: number, y: number) => void;
  onElementSelect?: (id: string) => void;
}

export default function CertificateTemplate({
  elements = [],
  onElementMove,
  onElementSelect,
}: CertificateTemplateProps) {
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", elementId);
  };

  const handleDrag = (e: React.DragEvent, element: CertificateElement) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (onElementMove && x > 0 && y > 0) {
      onElementMove(element.id, x, y);
    }
  };

  const renderElement = (element: CertificateElement) => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: element.width ? `${element.width}px` : "auto",
      height: element.height ? `${element.height}px` : "auto",
      zIndex: element.zIndex ?? 1,
      opacity: element.opacity ?? 1,
      cursor: "move",
      userSelect: "none",
    };

    if (element.type === "text" || element.type === "signature") {
      baseStyle.transform = "translateX(-50%)";
    }

    if (element.imageUrl) {
      return (
        <div
          key={element.id}
          draggable
          onDragStart={(e) => handleDragStart(e, element.id)}
          onDrag={(e) => handleDrag(e, element)}
          onClick={() => onElementSelect?.(element.id)}
          style={baseStyle}
        >
          <img
            src={element.imageUrl}
            alt={element.type}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        </div>
      );
    }

    if (element.type === "text" || element.type === "signature") {
      return (
        <div
          key={element.id}
          draggable
          onDragStart={(e) => handleDragStart(e, element.id)}
          onDrag={(e) => handleDrag(e, element)}
          onClick={() => onElementSelect?.(element.id)}
          style={{
            ...baseStyle,
            fontSize: element.fontSize ? `${element.fontSize}px` : "14px",
            fontWeight: element.fontWeight ?? "normal",
            textAlign: (element.textAlign as "left" | "center" | "right") ?? "center",
            color: element.color ?? "#000000",
            whiteSpace: "pre-line",
            lineHeight: element.type === "signature" ? "1.4" : "1.6",
          }}
        >
          {element.content}
        </div>
      );
    }

    if (element.backgroundColor) {
      return (
        <div
          key={element.id}
          draggable
          onDragStart={(e) => handleDragStart(e, element.id)}
          onDrag={(e) => handleDrag(e, element)}
          onClick={() => onElementSelect?.(element.id)}
          style={{
            ...baseStyle,
            backgroundColor: element.backgroundColor,
            cursor: "default",
          }}
        />
      );
    }

    return null;
  };

  if (elements.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <p className="text-slate-500 text-lg">No elements generated yet</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-white">
      {elements
        .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
        .map((element) => renderElement(element))}
    </div>
  );
}
