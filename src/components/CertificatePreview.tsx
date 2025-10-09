import { useState } from "react";
import { Share2, Sparkles } from "lucide-react";
import CertificateLayout from "../layouts/CertificateLayout";

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
  onBack?: () => void;
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

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPrompt(e.target.value);
    if (onPromptChange) onPromptChange(e.target.value);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <div className="flex-1 min-h-0">
        <CertificateLayout size={size}>
          <div
            className="w-full h-full bg-white relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute top-4 left-4 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md z-10">
              {size.toUpperCase().replace("-", " ")}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Blank Certificate Canvas</p>
            </div>

            <div
              className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <button
                onClick={() => {
                  if (onUseTemplate) onUseTemplate();
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium text-sm py-3 px-6 rounded-lg transition-all shadow-md"
              >
                USE TEMPLATE
              </button>
            </div>
          </div>
        </CertificateLayout>
      </div>

      <div className="flex-shrink-0 p-6 pt-4 flex items-center justify-center gap-3">
        <div className="flex items-center w-full max-w-3xl bg-[#1e2635] border border-slate-500 rounded-full px-5 py-3 focus-within:border-slate-300 transition-colors">
          <input
            type="text"
            placeholder="Describe your design idea or adjustments..."
            value={localPrompt}
            onChange={handlePromptChange}
            className="flex-1 bg-transparent text-slate-200 text-sm focus:outline-none placeholder-slate-500"
          />
          <Share2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>
        <button
          onClick={onGenerate}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

export default CertificatePreview;
