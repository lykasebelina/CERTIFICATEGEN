import React from "react";
import { Circle, Columns3, Plus, Trash2 } from "lucide-react";

interface EditorTopBarProps {
  activeToolTab: "select" | "pattern";
  setActiveToolTab: (tab: "select" | "pattern") => void;
}

const EditorTopBar: React.FC<EditorTopBarProps> = ({
  activeToolTab,
  setActiveToolTab,
}) => {
  return (
    <div className="flex-none w-full h-20 flex flex-wrap justify-between items-center gap-4 p-5 bg-slate-900 border-b border-slate-700 z-30">
      {/* Left */}
      <div className="px-3 py-1 border-2 border-cyan-400 rounded-full text-white text-sm font-medium">
        Page 1
      </div>

      {/* Center Tool Selector */}
      <div className="flex flex-wrap items-center justify-center bg-white rounded-full shadow-xl border-2 border-cyan-400 overflow-hidden">
        <button
          onClick={() => setActiveToolTab("select")}
          className={`px-4 py-2 transition ${
            activeToolTab === "select" ? "bg-slate-100" : "hover:bg-slate-50"
          }`}
        >
          <Circle size={18} className="text-slate-800" />
        </button>
        <div className="w-px h-6 bg-slate-300"></div>
        <button
          onClick={() => setActiveToolTab("pattern")}
          className={`px-4 py-2 transition ${
            activeToolTab === "pattern" ? "bg-slate-100" : "hover:bg-slate-50"
          }`}
        >
          <Columns3 size={18} className="text-slate-800" />
        </button>
      </div>

      {/* Right */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="p-2 bg-white hover:bg-slate-100 rounded-lg transition">
          <Plus size={20} className="text-slate-800" />
        </button>
        <button className="p-2 bg-white hover:bg-slate-100 rounded-lg transition">
          <Plus size={20} className="text-slate-800" />
        </button>
        <button className="p-2 bg-white hover:bg-slate-100 rounded-lg transition">
          <Trash2 size={20} className="text-slate-800" />
        </button>
      </div>
    </div>
  );
};

export default EditorTopBar;
