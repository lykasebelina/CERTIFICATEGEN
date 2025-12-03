import React, { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  Bold,
  Italic,
  Underline,
  Palette,
  Trash2,
  Save,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { UnifiedShareButton } from "./UnifiedShareButton";

export type ExportFormat = "jpg" | "png" | "pdf" | "pptx";

interface EditorTopBarProps {
  activeStyles?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    color?: string;
    textAlign?: string;
    textTransform?: "normal" | "upper" | "lower" | "title";
  };
  selectedElement?: string | null;
  onTextStyleChange?: (style: any) => void;
  onDeleteElement?: () => void;
  onSave?: () => void;
  
  onUndo?: () => void;
  onRedo?: () => void;

  isSaving?: boolean;
  activeToolTab?: "select" | "pattern";
  setActiveToolTab?: (tab: "select" | "pattern") => void;
  onRevert?: () => void;
  isBulkMode?: boolean;

  onOpenDownload?: () => void;
  onOpenShare?: () => void;
  onShareFacebook?: () => void;
}

const EditorTopBar: React.FC<EditorTopBarProps> = ({
  activeStyles = {},
  selectedElement,
  onTextStyleChange,
  onDeleteElement,
  onSave,
  onUndo,
  onRedo,
  isSaving = false,
  onOpenDownload,
  onOpenShare,
  onShareFacebook
}) => {
  const [fontSize, setFontSize] = useState(16.3);
  const [selectedFont, setSelectedFont] = useState("Canva Sans");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [textAlign, setTextAlign] = useState("left");
  const [textCase, setTextCase] = useState("normal");

  const [showTransformMenu, setShowTransformMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      }
      if (
        (isCtrlOrMeta && e.key.toLowerCase() === 'y') || 
        (isCtrlOrMeta && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        onRedo?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo]);

  useEffect(() => {
    if (activeStyles.fontSize) setFontSize(activeStyles.fontSize);
    if (activeStyles.fontFamily) setSelectedFont(activeStyles.fontFamily);
    if (activeStyles.color) setTextColor(activeStyles.color);
    setIsBold(activeStyles.fontWeight === "bold");
    setIsItalic(activeStyles.fontStyle === "italic");
    setIsUnderline(activeStyles.textDecoration === "underline");
    if (activeStyles.textAlign) setTextAlign(activeStyles.textAlign);
    if (activeStyles.textTransform) setTextCase(activeStyles.textTransform as string);
  }, [activeStyles]);

  useEffect(() => {
    setShowTransformMenu(false);
  }, [selectedElement]);

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

  const update = (style: any) => {
    if (!selectedElement) return;
    onTextStyleChange?.(style);
  };

  return (
    <div className="flex-none w-full h-20 flex flex-wrap justify-between items-center gap-4 px-5 py-3 bg-slate-900 border-b border-slate-700 z-60">

      {/* TEXT FORMATTING TOOLS - "FRAME" REMOVED */}
      {/* Removed bg-slate-800, rounded-2xl, shadow, padding, border */}
      <div className="flex items-center gap-3 hidden md:flex">

        <select
          value={selectedFont}
          onChange={(e) => {
            setSelectedFont(e.target.value);
            update({ fontFamily: e.target.value });
          }}
          disabled={!selectedElement}
          className="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 hover:border-slate-500 transition"
        >
          {fonts.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        <div className="w-px h-6 bg-slate-700"></div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const newSize = Math.max(8, fontSize - 1);
              setFontSize(newSize);
              update({ fontSize: newSize });
            }}
            disabled={!selectedElement}
            className="p-1.5 hover:bg-slate-700 rounded transition disabled:opacity-50"
          >
            <Minus size={16} className="text-slate-200" />
          </button>

          <input
            type="number"
            value={fontSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setFontSize(newSize);
              update({ fontSize: newSize });
            }}
            disabled={!selectedElement}
            className="w-16 px-2 py-1 text-center bg-slate-900 border border-slate-600 rounded text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />

          <button
            onClick={() => {
              const newSize = fontSize + 1;
              setFontSize(newSize);
              update({ fontSize: newSize });
            }}
            disabled={!selectedElement}
            className="p-1.5 hover:bg-slate-700 rounded transition disabled:opacity-50"
          >
            <Plus size={16} className="text-slate-200" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700"></div>

        <div className="relative group">
          <div
            className={`w-9 h-9 rounded-lg border-2 border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden relative ${
              !selectedElement ? "opacity-50" : ""
            }`}
            style={{ backgroundColor: textColor }}
          >
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                update({ color: e.target.value });
              }}
              disabled={!selectedElement}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {/* Show icon only if color is very dark, or just always show inverted */}
            <div className="pointer-events-none mix-blend-difference">
              <Palette size={16} className="text-white filter invert" />
            </div>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-700"></div>

        <button
          onClick={() => {
            const next = !isBold;
            setIsBold(next);
            update({ fontWeight: next ? "bold" : "normal" });
          }}
          disabled={!selectedElement}
          className={`p-2 rounded-lg transition ${
            isBold ? "bg-blue-600 text-white" : "hover:bg-slate-700 text-slate-200"
          } disabled:opacity-50`}
        >
          <Bold size={18} />
        </button>

        <button
          onClick={() => {
            const next = !isItalic;
            setIsItalic(next);
            update({ fontStyle: next ? "italic" : "normal" });
          }}
          disabled={!selectedElement}
          className={`p-2 rounded-lg transition ${
            isItalic ? "bg-blue-600 text-white" : "hover:bg-slate-700 text-slate-200"
          } disabled:opacity-50`}
        >
          <Italic size={18} />
        </button>

        <button
          onClick={() => {
            const next = !isUnderline;
            setIsUnderline(next);
            update({ textDecoration: next ? "underline" : "none" });
          }}
          disabled={!selectedElement}
          className={`p-2 rounded-lg transition ${
            isUnderline ? "bg-blue-600 text-white" : "hover:bg-slate-700 text-slate-200"
          } disabled:opacity-50`}
        >
          <Underline size={18} />
        </button>

        <div className="w-px h-6 bg-slate-700"></div>

        <div className="relative">
          <button
            onClick={() => {
              if (selectedElement) {
                setShowTransformMenu(!showTransformMenu);
              }
            }}
            className={`p-2 rounded-lg transition ${
              showTransformMenu ? "bg-slate-700" : "hover:bg-slate-700"
            } disabled:opacity-50`}
            disabled={!selectedElement}
          >
            <span className="text-slate-200 font-semibold text-sm">aA</span>
          </button>

          {showTransformMenu && selectedElement && (
            <div className="absolute top-full left-0 mt-2 bg-slate-800 shadow-xl rounded-lg border border-slate-600 w-40 z-50 overflow-hidden">
              {["normal", "upper", "lower", "title"].map((value) => (
                <button
                  key={value}
                  onClick={() => {
                    setTextCase(value);
                    update({ textTransform: value });
                    setShowTransformMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-700 text-sm text-slate-200 border-b border-slate-700 last:border-0 ${
                    textCase === value ? "bg-slate-700 font-bold text-blue-400" : ""
                  }`}
                >
                  {value === "normal" && "Normal"}
                  {value === "upper" && "UPPERCASE"}
                  {value === "lower" && "lowercase"}
                  {value === "title" && "Capitalize Words"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-700"></div>

        <div className="flex items-center gap-0.5">
          {[
            { type: "left", icon: <AlignLeft size={18} /> },
            { type: "center", icon: <AlignCenter size={18} /> },
            { type: "right", icon: <AlignRight size={18} /> },
          ].map((btn) => (
            <button
              key={btn.type}
              onClick={() => {
                setTextAlign(btn.type);
                update({ textAlign: btn.type });
              }}
              className={`p-2 rounded-lg transition ${
                textAlign === btn.type ? "bg-slate-600 text-white" : "hover:bg-slate-700 text-slate-200"
              } disabled:opacity-50`}
              disabled={!selectedElement}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIONS (RIGHT SIDE) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            {onUndo && (
            <button
                onClick={onUndo}
                className="p-2 hover:bg-slate-600 rounded-lg transition text-slate-300 hover:text-white"
                title="Undo (Ctrl+Z)"
            >
                <RotateCcw size={20} />
            </button>
            )}
            
            {onRedo && (
            <button
                onClick={onRedo}
                className="p-2 hover:bg-slate-600 rounded-lg transition text-slate-300 hover:text-white"
                title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            >
                <RotateCw size={20} />
            </button>
            )}
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition text-white font-medium shadow-sm"
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save"}
        </button>

        <UnifiedShareButton 
          onOpenDownload={onOpenDownload || (() => {})}
          onOpenPublicLink={onOpenShare || (() => {})}
          onShareFacebook={onShareFacebook || (() => {})}
          disabled={isSaving}
        />

        {selectedElement && (
          <>
            <div className="w-px h-6 bg-slate-600 mx-2"></div>
            <button
              onClick={onDeleteElement}
              className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm"
              title="Delete Element"
            >
              <Trash2 size={20} className="text-white" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditorTopBar;