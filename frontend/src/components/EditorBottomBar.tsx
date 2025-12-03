import React from "react";
import { Grid, Maximize } from "lucide-react";

interface EditorBottomBarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
}

const EditorBottomBar: React.FC<EditorBottomBarProps> = ({ zoom, setZoom }) => {
  return (
    <div className="flex-none w-full h-20 flex flex-wrap justify-between items-center gap-4 p-5 border-t border-slate-700 bg-slate-900">
      <div className="px-3 py-1 border-0 border-cyan-400 rounded-full text-white text-sm font-medium">
    
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="range"
          min="25"
          max="100"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-48 md:w-56 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          style={{
            background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${
              ((zoom - 25) / 175) * 100
            }%, #475569 ${((zoom - 25) / 175) * 100}%, #475569 100%)`,
          }}
        />
        <span className="text-white text-sm font-semibold">{zoom}%</span>
        <div className="w-px h-6 bg-cyan-400"></div>
        <button className="p-2 hover:bg-slate-700 rounded transition">
          <Grid size={20} className="text-white" />
        </button>
        <button className="p-2 hover:bg-slate-700 rounded transition">
          <Maximize size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default EditorBottomBar;
