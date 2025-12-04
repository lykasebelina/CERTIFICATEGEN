import React, { useState } from 'react';
import { X, ChevronDown, Info, Crown, FileDown } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (format: string, options: any) => void;
  isDownloading: boolean;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onConfirm, isDownloading }) => {
  const [fileType, setFileType] = useState('pdf');
  const [options, setOptions] = useState({
    compress: false,
    flatten: false,
    includeNotes: false,
    passwordProtection: false,
    saveSettings: false
  });

  if (!isOpen) return null;

  const handleCheckboxChange = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Download</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* File Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">File type</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                 <FileDown size={18} className="text-gray-500" />
              </div>
              <select 
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg p-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="pdf">PDF Standard</option>
                <option value="png">PNG Image</option>
                <option value="jpg">JPG Image</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
              {fileType === 'pdf' && (
                <span className="absolute top-1/2 -translate-y-1/2 right-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Suggested
                </span>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={options.compress} 
                  onChange={() => handleCheckboxChange('compress')}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                />
                <span className="text-sm text-gray-700">Compress PDF</span>
                <Info size={14} className="text-gray-400" />
              </div>
              <Crown size={14} className="text-amber-500" />
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={options.flatten}
                onChange={() => handleCheckboxChange('flatten')}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
              />
              <span className="text-sm text-gray-700">Flatten PDF</span>
              <Info size={14} className="text-gray-400" />
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={options.includeNotes}
                onChange={() => handleCheckboxChange('includeNotes')}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
              />
              <span className="text-sm text-gray-700">Include notes</span>
              <Info size={14} className="text-gray-400" />
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
               <input 
                  type="checkbox" 
                  checked={options.passwordProtection}
                  onChange={() => handleCheckboxChange('passwordProtection')}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                />
               <span className="text-sm text-gray-700">Password protection</span>
            </label>
          </div>

          {/* Select Pages */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Select pages</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-300 rounded-lg p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>All Pages</option>
                <option>Current Page</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="pt-2">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Preferences</label>
            <label className="flex items-center gap-2 cursor-pointer">
               <input 
                  type="checkbox" 
                  checked={options.saveSettings}
                  onChange={() => handleCheckboxChange('saveSettings')}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                />
               <span className="text-sm text-gray-600">Save download settings</span>
            </label>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => onConfirm(fileType, options)}
            disabled={isDownloading}
            className="w-full bg-[#8b3dff] hover:bg-[#7a35e0] text-white font-semibold py-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-md shadow-purple-200"
          >
            {isDownloading ? 'Processing...' : 'Download'}
          </button>
        </div>

      </div>
    </div>
  );
};