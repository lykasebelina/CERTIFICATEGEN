import { useState, useRef, useLayoutEffect } from "react";
import { Share2, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import CertificateLayout from "../layouts/CertificateLayout";
import MockCertificateElements from "./MockCertificateElements";

type CertificateSize =
  | "a4-portrait"
  | "a4-landscape"
  | "legal-portrait"
  | "legal-landscape"
  | "letter-portrait"
  | "letter-landscape";

interface CertificatePreviewProps {
  size: CertificateSize;
  prompt: string;
  onPromptChange?: (value: string) => void;
  onGenerate?: () => void;
  onUseTemplate?: () => void;
}

function CertificatePreview({
  size,
  prompt,
  onPromptChange,
  onGenerate,
  onUseTemplate,
}: CertificatePreviewProps) {
  const [localPrompt, setLocalPrompt] = useState(prompt || "");
  const [isHovered, setIsHovered] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(75);

  const layoutRef = useRef<HTMLDivElement>(null);
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 });

  // 🧭 Measure actual certificate layout size
  useLayoutEffect(() => {
    if (layoutRef.current) {
      const rect = layoutRef.current.getBoundingClientRect();
      setLayoutSize({ width: rect.width, height: rect.height });
    }
  }, [size]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPrompt(e.target.value);
    onPromptChange?.(e.target.value);
  };

  const handleElementClick = (name: string) => {
    setSelectedElement(name);
  };

  const zoomOut = () => setZoom((z) => Math.max(25, z - 5));
  const zoomIn = () => setZoom((z) => Math.min(100, z + 5));
  const scale = zoom / 100;

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* ========== PREVIEW AREA ========== */}
      <div className="flex-1 overflow-auto bg-transparent relative">
        <div className="min-h-full w-full flex items-start justify-center p-10 relative">
          {/* ✅ Scaled + centered certificate container */}
          <div
            className="relative"
            style={{
              transform: `translate(calc((100% - ${
                layoutSize.width * scale
              }px) / 100), 0) scale(${scale})`,
              transformOrigin: "top center",
              transition: "transform 0.1s ease",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Actual certificate layout */}
            <div ref={layoutRef}>
              <CertificateLayout size={size}>
                <div className="w-full h-full bg-white relative shadow-lg overflow-hidden">
                  {/* Format label */}
                  <div className="absolute top-4 left-4 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md z-10">
                    {size.toUpperCase().replace("-", " ")}
                  </div>

                  {/* Selected element label */}
                  {selectedElement && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md z-10">
                      Selected:{" "}
                      {selectedElement.replace(/-/g, " ").toUpperCase()}
                    </div>
                  )}

                  {/* Clickable certificate content */}
                  <MockCertificateElements
                    onElementClick={handleElementClick}
                  />

                  {/* Hover overlay */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                      isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <button
                      onClick={onUseTemplate}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium text-sm py-3 px-6 rounded-lg shadow-md transition-all"
                    >
                      USE TEMPLATE
                    </button>
                  </div>
                </div>
              </CertificateLayout>
            </div>
          </div>
        </div>
      </div>

      {/* ========== BOTTOM CONTROLS ========== */}
      <div className="flex-shrink-0 p-6 pt-4 flex items-center justify-between gap-4 border-t border-slate-700">
        {/* Prompt input */}
        <div className="flex items-center w-full max-w-3xl bg-[#1e2635] border border-slate-500 rounded-full px-5 py-3">
          <input
            type="text"
            placeholder="Describe your design idea or adjustments..."
            value={localPrompt}
            onChange={handlePromptChange}
            className="flex-1 bg-transparent text-slate-200 text-sm focus:outline-none placeholder-slate-500"
          />
          <Share2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>

        {/* Generate button */}
        <button
          onClick={onGenerate}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded-md bg-[#1e2635] text-slate-300 hover:bg-slate-700 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={25}
            max={100}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <button
            onClick={zoomIn}
            className="p-2 rounded-md bg-[#1e2635] text-slate-300 hover:bg-slate-700 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-slate-300 text-sm w-12 text-center">
            {zoom}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default CertificatePreview;
