import React, { useState, useRef, useEffect } from 'react';
import { Share2, Download, Globe, Facebook, ChevronDown } from 'lucide-react';

interface UnifiedShareButtonProps {
  onOpenDownload: () => void;
  onOpenPublicLink: () => void;
  onShareFacebook: () => void;
  disabled?: boolean;
}

export const UnifiedShareButton: React.FC<UnifiedShareButtonProps> = ({ 
  onOpenDownload, 
  onOpenPublicLink, 
  onShareFacebook,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Share2 size={18} />
        Share
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-1">
            <button 
              onClick={() => handleAction(onOpenDownload)}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors text-left"
            >
              <div className="bg-purple-100 p-2 rounded-full">
                <Download size={18} className="text-purple-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">Download</span>
                <span className="text-[11px] text-slate-500">PDF, JPG, PNG</span>
              </div>
            </button>

            <button 
              onClick={() => handleAction(onOpenPublicLink)}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors text-left"
            >
              <div className="bg-green-100 p-2 rounded-full">
                <Globe size={18} className="text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">Public View Link</span>
                <span className="text-[11px] text-slate-500">Share a live link</span>
              </div>
            </button>

            <div className="h-px bg-slate-100 my-1 mx-2" />

            <button 
              onClick={() => handleAction(onShareFacebook)}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors text-left"
            >
              <div className="bg-blue-100 p-2 rounded-full">
                <Facebook size={18} className="text-blue-600 fill-blue-600" />
              </div>
              <span className="font-semibold text-slate-800">Share to Facebook</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};