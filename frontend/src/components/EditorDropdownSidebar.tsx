import React, { useState, useEffect } from "react";
import { Sparkles, Wand2, Users, Type, Image, Palette } from "lucide-react";

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface EditorDropdownSidebarProps {
  onWidthChange?: (width: number) => void;
}

const EditorDropdownSidebar: React.FC<EditorDropdownSidebarProps> = ({ onWidthChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { id: "ai-autofill", icon: <Sparkles size={18} />, label: "AI Autofill" },
    { id: "ai-design", icon: <Wand2 size={18} />, label: "AI Design" },
    { id: "icons", icon: <Users size={18} />, label: "Icons" },
    { id: "text", icon: <Type size={18} />, label: "Text" },
    { id: "image", icon: <Image size={18} />, label: "Image" },
    { id: "brand-kit", icon: <Palette size={18} />, label: "Brand Kit" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Notify parent about sidebar width (so main canvas can shift)
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(isMenuOpen ? 120 : 0); // 120px width when open
    }
  }, [isMenuOpen, onWidthChange]);

  return (
    <div
      className="fixed top-[88px] right-6 z-50 flex flex-col items-center"
      // 88px = just below your 80px top bar + small spacing
    >
      {/* Button container */}
      <div className="relative flex flex-col items-center">
        {/* Toggle button (always in the same spot) */}
        <button
          onClick={toggleMenu}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center transition-all shadow-xl hover:scale-110 hover:shadow-blue-500/50"
        >
          <Sparkles size={22} />
        </button>

        {/* Dropdown (slides down vertically under button) */}
        {isMenuOpen && (
          <div className="absolute top-14 right-0 bg-gradient-to-b from-blue-600 via-blue-700 to-purple-700 rounded-2xl shadow-xl overflow-hidden w-24 animate-in fade-in slide-in-from-top-2 duration-200">
            {sidebarItems.map((item, index) => (
              <button
                key={item.id}
                className={`w-full flex flex-col items-center justify-center gap-1.5 px-2 py-3 text-white hover:bg-white/10 transition ${
                  index !== sidebarItems.length - 1 ? "border-b border-white/20" : ""
                }`}
              >
                <div className="flex items-center justify-center">{item.icon}</div>
                <span className="text-[10px] font-medium text-center leading-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorDropdownSidebar;
