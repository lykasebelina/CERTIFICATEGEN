import { useEffect, useRef } from "react";
import { Canvas, FabricImage, Textbox, FabricObject } from "fabric";
import { CertificateElement } from "../types/certificate";

interface FabricCanvasProps {
  width: number;
  height: number;
  elements: CertificateElement[];
  onElementSelect?: (id: string | null) => void;
  onElementUpdate?: (id: string, updates: Partial<CertificateElement>) => void;
}

export default function FabricCanvas({
  width,
  height,
  elements,
  onElementSelect,
  onElementUpdate,
}: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    canvas.on("selection:created", (e) => {
      const selected = e.selected?.[0];
      if (selected && (selected as FabricObject & { elementId?: string }).elementId) {
        onElementSelect?.((selected as FabricObject & { elementId?: string }).elementId!);
      }
    });

    canvas.on("selection:updated", (e) => {
      const selected = e.selected?.[0];
      if (selected && (selected as FabricObject & { elementId?: string }).elementId) {
        onElementSelect?.((selected as FabricObject & { elementId?: string }).elementId!);
      }
    });

    canvas.on("selection:cleared", () => {
      onElementSelect?.(null);
    });

    canvas.on("object:modified", (e) => {
      const obj = e.target as FabricObject & { elementId?: string };
      if (obj && obj.elementId) {
        onElementUpdate?.(obj.elementId, {
          x: obj.left ?? 0,
          y: obj.top ?? 0,
          width: obj.width ? obj.width * (obj.scaleX ?? 1) : undefined,
          height: obj.height ? obj.height * (obj.scaleY ?? 1) : undefined,
        });
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();

    const sortedElements = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

    sortedElements.forEach((element) => {
      if (element.imageUrl) {
        FabricImage.fromURL(element.imageUrl, {
          crossOrigin: "anonymous",
        }).then((img) => {
          img.set({
            left: element.x,
            top: element.y,
            scaleX: element.width ? element.width / (img.width ?? 1) : 1,
            scaleY: element.height ? element.height / (img.height ?? 1) : 1,
            opacity: element.opacity ?? 1,
            selectable: true,
            hasControls: true,
            hasBorders: true,
          });

          (img as FabricObject & { elementId?: string }).elementId = element.id;
          canvas.add(img);
          canvas.renderAll();
        });
      } else if (element.type === "text" || element.type === "signature") {
        const text = new Textbox(element.content || "", {
          left: element.x - (element.width ?? 100) / 2,
          top: element.y,
          width: element.width ?? 200,
          fontSize: element.fontSize ?? 16,
          fontFamily: element.fontFamily ?? "Arial",
          fill: element.color ?? "#000000",
          fontWeight: element.fontWeight ?? "normal",
          textAlign: element.textAlign as "left" | "center" | "right" | "justify" | undefined ?? "left",
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });

        (text as FabricObject & { elementId?: string }).elementId = element.id;
        canvas.add(text);
      }
    });

    canvas.renderAll();
  }, [elements]);

  return (
    <canvas
      ref={canvasRef}
      className="shadow-lg border border-slate-300"
    />
  );
}
