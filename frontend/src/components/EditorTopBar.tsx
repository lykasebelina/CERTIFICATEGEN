import React, { useState } from "react";
import {
  Minus,
  Plus,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Grid3x3,
  Move,
  Trash2,
} from "lucide-react";

interface EditorTopBarProps {
  activeToolTab: "select" | "pattern";
  setActiveToolTab: (tab: "select" | "pattern") => void;
  selectedElement?: string | null;
  onTextStyleChange?: (style: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: string;
  }) => void;
  onDeleteElement?: () => void;
}

const EditorTopBar: React.FC<EditorTopBarProps> = ({
  selectedElement,
  onTextStyleChange,
  onDeleteElement,
}) => {
  const [fontSize, setFontSize] = useState(16.3);
  const [selectedFont, setSelectedFont] = useState("Canva Sans");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("left");

  const fonts = [
    "Canva Sans",
    "Arial",
    "Times New Roman",
    "Georgia",
    "Helvetica",
    "Courier New",
    "Verdana",
    "Roboto",
    "Open Sans",
  ];

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    onTextStyleChange?.({ fontFamily: font });
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    onTextStyleChange?.({ fontSize: size });
  };

  const handleBoldToggle = () => {
    const newBold = !isBold;
    setIsBold(newBold);
    onTextStyleChange?.({ fontWeight: newBold ? "bold" : "normal" });
  };

  const handleAlignChange = (align: "left" | "center" | "right" | "justify") => {
    setTextAlign(align);
    onTextStyleChange?.({ textAlign: align });
  };

  return (
    <div className="flex-none w-full h-20 flex flex-wrap justify-between items-center gap-4 px-5 py-3 bg-slate-900 border-b border-slate-700 z-30">
      <div className="px-3 py-1 border-2 border-cyan-400 rounded-full text-white text-sm font-medium">
        Page 1
      </div>

      <div className="flex items-center gap-2 bg-white rounded-2xl shadow-xl px-4 py-2.5 border-2 border-slate-200">
        <select
          value={selectedFont}
          onChange={(e) => handleFontChange(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {fonts.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        <div className="w-px h-8 bg-slate-300"></div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleFontSizeChange(Math.max(8, fontSize - 0.5))}
            className="p-1.5 hover:bg-slate-100 rounded transition"
          >
            <Minus size={16} className="text-slate-800" />
          </button>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="w-14 px-2 py-1 text-center border border-slate-300 rounded text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
          />
          <button
            onClick={() => handleFontSizeChange(fontSize + 0.5)}
            className="p-1.5 hover:bg-slate-100 rounded transition"
          >
            <Plus size={16} className="text-slate-800" />
          </button>
        </div>

        <div className="w-px h-8 bg-slate-300"></div>

        <button className="relative w-9 h-9 rounded-lg overflow-hidden border-2 border-slate-300 hover:border-slate-400 transition group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/0 group-hover:bg-white/20 transition">
            <Palette size={16} className="text-white drop-shadow-md" />
          </div>
        </button>

        <div className="w-px h-8 bg-slate-300"></div>

        <button
          onClick={handleBoldToggle}
          className={`p-2 rounded-lg transition ${
            isBold ? "bg-purple-600 text-white" : "hover:bg-slate-100 text-slate-800"
          }`}
        >
          <Bold size={18} />
        </button>

        <button
          onClick={() => setIsItalic(!isItalic)}
          className={`p-2 rounded-lg transition ${
            isItalic ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-800"
          }`}
        >
          <Italic size={18} />
        </button>

        <div className="w-px h-8 bg-slate-300"></div>

        <button className="p-2 hover:bg-slate-100 rounded-lg transition">
          <span className="text-slate-800 font-semibold text-sm">aA</span>
        </button>

        <div className="w-px h-8 bg-slate-300"></div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => handleAlignChange("left")}
            className={`p-2 rounded-lg transition ${
              textAlign === "left" ? "bg-slate-200" : "hover:bg-slate-100"
            }`}
          >
            <AlignLeft size={18} className="text-slate-800" />
          </button>
          <button
            onClick={() => handleAlignChange("center")}
            className={`p-2 rounded-lg transition ${
              textAlign === "center" ? "bg-slate-200" : "hover:bg-slate-100"
            }`}
          >
            <AlignCenter size={18} className="text-slate-800" />
          </button>
          <button
            onClick={() => handleAlignChange("right")}
            className={`p-2 rounded-lg transition ${
              textAlign === "right" ? "bg-slate-200" : "hover:bg-slate-100"
            }`}
          >
            <AlignRight size={18} className="text-slate-800" />
          </button>
        </div>

        <div className="w-px h-8 bg-slate-300"></div>

        <button className="p-2 hover:bg-slate-100 rounded-lg transition">
          <Move size={18} className="text-slate-800" />
        </button>

        <div className="w-px h-8 bg-slate-300"></div>

        <button className="p-2 hover:bg-slate-100 rounded-lg transition">
          <Grid3x3 size={18} className="text-slate-800" />
        </button>

        <div className="w-px h-8 bg-slate-300"></div>

        <button className="px-4 py-1.5 hover:bg-slate-100 rounded-lg transition text-slate-800 font-semibold text-sm">
          Position
        </button>

        <div className="w-px h-8 bg-slate-300"></div>

        <button className="p-2 hover:bg-slate-100 rounded-lg transition">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-800"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="p-2 bg-white hover:bg-slate-100 rounded-lg transition">
          <Plus size={20} className="text-slate-800" />
        </button>
        <button className="p-2 bg-white hover:bg-slate-100 rounded-lg transition">
          <Plus size={20} className="text-slate-800" />
        </button>
        {selectedElement && (
          <button
            onClick={onDeleteElement}
            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
          >
            <Trash2 size={20} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EditorTopBar;
