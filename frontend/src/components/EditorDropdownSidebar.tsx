import React, { useEffect, useRef, useState } from "react";
// 🟢 ADDED: Upload, Type, ImageIcon imports
import { Sparkles, Wand2, ListPlus, Type, Image as ImageIcon, QrCode, X, Loader2, CheckSquare, Square, Upload } from "lucide-react";
import { CertificateElement } from "../types/certificate";

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface EditorDropdownSidebarProps {
  onWidthChange?: (width: number) => void;
  onAutoBulkUpload: (file: File) => void;

  // Context for AI Panel
  selectedElement?: CertificateElement;
  isGenerating?: boolean;
  isAutofilling?: boolean;
  
  // PROPS FOR BULK CONTROL
  isBulkMode?: boolean;
  bulkCount?: number;
  
  // AI Props
  onAiGenerate?: (prompt: string, applyToAll: boolean) => Promise<void>;
  onAiAutofill?: (prompt: string) => Promise<void>;
  
  // QR Code Generation
  onGenerateQrCodes?: () => Promise<void>;
  isGeneratingQr?: boolean;

  // 🟢 ADDED: Text & Image Props
  onAddText?: (options: { text: string; fontSize: number; fontWeight: string; color: string }) => void;
  onUploadImage?: (file: File) => void;        
  onAddImageToCanvas?: (url: string) => void;  
  uploadedImages?: string[];                  
}

const SIDEBAR_WIDTH = 80;

const LAYER_NAMES: Record<number, string> = {
  1: "Background Layer",
  2: "Border",
  3: "Inner Frame",
  4: "Corner Frames",
  5: "Watermark",
  18: "Logo"
};

const EditorDropdownSidebar: React.FC<EditorDropdownSidebarProps> = ({
  onWidthChange,
  onAutoBulkUpload,
  selectedElement,
  onAiGenerate,
  onAiAutofill,
  isGenerating = false,
  isAutofilling = false,
  isBulkMode = false,
  bulkCount = 0,
  onGenerateQrCodes,
  isGeneratingQr = false,
  // 🟢 ADDED: Destructuring new props
  onAddText,
  onUploadImage,
  onAddImageToCanvas,
  uploadedImages = []
}) => {

  const fileInputRef = useRef<HTMLInputElement>(null);
  // 🟢 ADDED: Image Input Ref
  const imageUploadRef = useRef<HTMLInputElement>(null); 
  
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");
  const [applyToAll, setApplyToAll] = useState(true);

  const sidebarItems: SidebarItem[] = [
    { id: "ai-autofill", icon: <Sparkles size={20} />, label: "AI Autofill" },
    { id: "ai-design", icon: <Wand2 size={20} />, label: "AI Design" },
    { id: "auto-bulk", icon: <ListPlus size={20} />, label: "Auto Bulk" },
    // 🟢 ADDED: Text and Image Items
    { id: "text", icon: <Type size={20} />, label: "Text" },
    { id: "image", icon: <ImageIcon size={20} />, label: "Image" },
    { id: "qr-code", icon: <QrCode size={20} />, label: "QR Code" },
  ];

  const handleBulkClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAutoBulkUpload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🟢 ADDED: Image Upload Handler
  const handleImageUploadTrigger = () => {
    if (imageUploadRef.current) imageUploadRef.current.click();
  };

  // 🟢 ADDED: Image Change Handler
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(file);
    }
    if (imageUploadRef.current) imageUploadRef.current.value = ""; 
  };

  const handleItemClick = (id: string) => {
    if (id === 'auto-bulk') {
      handleBulkClick();
    } else if (id === 'ai-design') {
      setActivePanel(activePanel === 'ai-design' ? null : 'ai-design');
    } else if (id === 'ai-autofill') {
      setActivePanel(activePanel === 'ai-autofill' ? null : 'ai-autofill');
    } else if (id === 'qr-code') {
      setActivePanel(activePanel === 'qr-code' ? null : 'qr-code');
    } 
    // 🟢 ADDED: Toggle logic for text and image
    else if (id === 'text') {
      setActivePanel(activePanel === 'text' ? null : 'text');
    } else if (id === 'image') {
      setActivePanel(activePanel === 'image' ? null : 'image');
    }
    else {
      setActivePanel(null);
    }
  };

  const handleGenerateClick = () => {
    if (onAiGenerate && activePanel === 'ai-design' && promptText.trim()) {
      onAiGenerate(promptText, applyToAll);
    }
  };

  const handleAutofillClick = () => {
    if (onAiAutofill && promptText.trim()) {
      onAiAutofill(promptText);
    }
  };
  
  const handleGenerateQrCodesClick = () => {
    if (onGenerateQrCodes) {
      onGenerateQrCodes();
    }
  };

  // 🟢 ADDED: Helper for Text Options
  const handleAddText = (type: 'heading' | 'subheading' | 'body') => {
    if (!onAddText) return;
    
    switch(type) {
      case 'heading':
        onAddText({ text: "Add a Heading", fontSize: 48, fontWeight: "bold", color: "#000000" });
        break;
      case 'subheading':
        onAddText({ text: "Add a subheading", fontSize: 24, fontWeight: "600", color: "#334155" });
        break;
      case 'body':
        onAddText({ text: "Add a little bit of body text", fontSize: 16, fontWeight: "normal", color: "#475569" });
        break;
    }
  };

  // 🟢 ADDED: Render Text Panel
  const getTextPanelContent = () => {
    return (
      <div className="flex flex-col gap-3 mt-2">
         <div className="text-xs text-slate-400 mb-1">Click to add text</div>
         
         <button 
           onClick={() => handleAddText('heading')}
           className="w-full bg-slate-800 hover:bg-slate-700 p-4 rounded border border-slate-700 text-left transition-colors group"
         >
           <h1 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">Add a Heading</h1>
         </button>

         <button 
           onClick={() => handleAddText('subheading')}
           className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 text-left transition-colors group"
         >
           <h2 className="text-lg font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors">Add a subheading</h2>
         </button>

         <button 
           onClick={() => handleAddText('body')}
           className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 text-left transition-colors group"
         >
           <p className="text-sm text-slate-400 group-hover:text-cyan-400 transition-colors">Add a little bit of body text</p>
         </button>

         <div className="border-t border-slate-700 my-2"></div>
         <div className="text-xs text-slate-500 text-center italic">
            Select text on canvas to edit font and colors.
         </div>
      </div>
    );
  };

  // 🟢 ADDED: Render Image Panel
  const getImagePanelContent = () => {
    return (
      <div className="flex flex-col gap-3 mt-2 h-full">
         <button 
            onClick={handleImageUploadTrigger}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shrink-0"
         >
           <Upload size={18} /> Upload Image
         </button>

         <div className="text-xs text-slate-400 flex items-center gap-2 mt-2 shrink-0">
            <span className="h-px bg-slate-700 flex-1"></span>
            <span>Your Uploads</span>
            <span className="h-px bg-slate-700 flex-1"></span>
         </div>
         
         <div className="grid grid-cols-2 gap-2 mt-2 overflow-y-auto pr-1 pb-10" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {uploadedImages && uploadedImages.length > 0 ? (
                uploadedImages.map((imgUrl, idx) => (
                    <div 
                        key={idx} 
                        className="aspect-square bg-slate-800 rounded border border-slate-700 overflow-hidden cursor-pointer hover:border-cyan-400 transition-all relative group"
                        onClick={() => onAddImageToCanvas && onAddImageToCanvas(imgUrl)}
                    >
                        <img src={imgUrl} alt="upload" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-white bg-black/60 px-2 py-1 rounded">Click to Add</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-2 text-center text-slate-500 text-xs py-10 italic">
                    No images uploaded yet.
                </div>
            )}
         </div>
      </div>
    );
  };

  const getAiPanelContent = () => {
    if (!selectedElement) {
      return (
        <div className="text-slate-400 text-sm text-center italic mt-4">
          Please select an element on the canvas to regenerate.
        </div>
      );
    }

    if (selectedElement.type === 'text' || selectedElement.type === 'signature') {
      return (
        <div className="text-red-400 text-sm text-center mt-4 border border-red-500/30 bg-red-500/10 p-3 rounded">
          Text fields cannot be regenerated by AI Design. Please select an image, background, or frame.
        </div>
      );
    }

    let layerName = LAYER_NAMES[selectedElement.zIndex || 0] || `Layer (Index: ${selectedElement.zIndex})`;
    if (selectedElement.zIndex === 4) {
      layerName = "Corner Frames (Layer 4)";
    }

    return (
      <div className="flex flex-col gap-3 mt-2">
        <div className="bg-slate-800 p-2 rounded border border-slate-600 text-xs text-cyan-400 font-mono text-center">
          SELECTED: {layerName.toUpperCase()}
        </div>

        <label className="text-xs text-slate-400 mt-2">Describe what you want:</label>
        <textarea
          className="w-full h-24 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-cyan-500 focus:outline-none resize-none"
          placeholder="E.g., A minimalist golden border with floral corners..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />

        {isBulkMode && (
          <div
            className="flex items-center gap-2 mt-2 p-2 bg-slate-800/50 rounded border border-slate-700 cursor-pointer hover:bg-slate-800 transition"
            onClick={() => setApplyToAll(!applyToAll)}
          >
            <div className={`text-cyan-400 transition-all ${applyToAll ? "opacity-100" : "opacity-50"}`}>
              {applyToAll ? <CheckSquare size={16} /> : <Square size={16} />}
            </div>
            <span className="text-xs text-slate-300 select-none">
              Apply to all <strong>{bulkCount}</strong> certificates
            </span>
          </div>
        )}

        <button
          onClick={handleGenerateClick}
          disabled={isGenerating || !promptText.trim()}
          className="mt-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-2 rounded font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Generating...
            </>
          ) : (
            <>
              <Wand2 size={16} /> Generate
            </>
          )}
        </button>
        <p className="text-[10px] text-slate-500 text-center">
          Powered by DALL-E 3
        </p>
      </div>
    );
  };

  const getAiAutofillPanelContent = () => {
    return (
      <div className="flex flex-col gap-3 mt-2">

        {isBulkMode && (
          <div className="bg-yellow-900/30 p-2 rounded border border-yellow-700/50 text-xs text-yellow-300 font-medium text-center">
            Autofill will be applied to <strong>all {bulkCount}</strong> certificates.
          </div>
        )}

        <label className="text-xs text-slate-400 mt-2">Describe the certificate:</label>
        <textarea
          className="w-full h-24 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-cyan-500 focus:outline-none resize-none"
          placeholder="E.g., Certificate of completion for Mr. Juan Dela Cruz as a speaker on Digital Marketing at PUP Manila, given on December 1, 2025."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />

        <button
          onClick={handleAutofillClick}
          disabled={isAutofilling || !promptText.trim()}
          className="mt-2 w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white py-2 rounded font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAutofilling ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Filling...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Autofill Text Fields
            </>
          )}
        </button>
        <p className="text-[10px] text-slate-500 text-center">
          Powered by GPT-5.1
        </p>
      </div>
    );
  };

  const getQrCodePanelContent = () => {
    
    if (isBulkMode) {
      return (
        <div className="flex flex-col gap-4 mt-2">
          <div className="bg-blue-900/30 p-3 rounded border border-blue-700/50 text-xs text-blue-300 font-medium">
            <p className="mb-2">This will generate a **unique** QR code for each of the **{bulkCount} certificates**.</p>
            <p>The QR code will link to the public view of the corresponding certificate and be placed at the **bottom-left corner**.</p>
          </div>
          
          <button
            onClick={handleGenerateQrCodesClick}
            disabled={isGeneratingQr || bulkCount === 0}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGeneratingQr ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Generating QR Codes...
              </>
            ) : (
              <>
                <QrCode size={16} /> Generate {bulkCount} QR Codes
              </>
            )}
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-4 mt-2">
          <div className="bg-teal-900/30 p-3 rounded border border-teal-700/50 text-xs text-teal-300 font-medium">
            <p className="mb-2">This will generate a single QR code linking directly to the public view of this **template**.</p>
            <p>The QR code will be placed at the **bottom-left corner**.</p>
          </div>
          
          <button
            onClick={handleGenerateQrCodesClick}
            disabled={isGeneratingQr}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGeneratingQr ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Generating QR Code...
              </>
            ) : (
              <>
                <QrCode size={16} /> Generate Template QR Code
              </>
            )}
          </button>
        </div>
    );
  };

  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(SIDEBAR_WIDTH);
    }
  }, [onWidthChange]);

  return (
    <>
      {/* MAIN SIDEBAR */}
      <div
        className="fixed top-20 bottom-20 right-0 z-40 flex flex-col items-center bg-slate-900 border-l border-slate-700 shadow-2xl transition-all duration-300"
        style={{ width: `${SIDEBAR_WIDTH}px` }}
      >
        <div className="flex flex-col items-center w-full h-full p-1 overflow-y-auto">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
          />
          {/* 🟢 ADDED: Image Input */}
          <input 
            type="file" 
            ref={imageUploadRef} 
            style={{ display: 'none' }} 
            accept="image/png, image/jpeg, image/jpg, image/svg+xml" 
            onChange={handleImageChange} 
          />

          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex flex-col items-center justify-center gap-1.5 px-0.5 py-3 my-1 rounded-lg transition border-b border-slate-700 last:border-b-0 ${
                activePanel === item.id ? 'bg-slate-800 text-cyan-400' : 'text-white hover:bg-slate-700/70'
              }`}
              title={item.label}
            >
              <div className={`flex items-center justify-center ${activePanel === item.id ? 'text-cyan-400' : 'text-slate-300'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight ${activePanel === item.id ? 'text-cyan-400' : 'text-slate-300'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* EXTENDED PANEL: AI Design */}
      {activePanel === 'ai-design' && (
        <div
          className="fixed top-20 bottom-20 z-40 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col p-4"
          style={{
            right: `${SIDEBAR_WIDTH}px`,
            width: '280px',
            borderRight: '1px solid #334155'
          }}
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Wand2 size={18} className="text-purple-400" /> AI Designer
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          {getAiPanelContent()}
        </div>
      )}

      {/* EXTENDED PANEL: AI Autofill */}
      {activePanel === 'ai-autofill' && (
        <div
          className="fixed top-20 bottom-20 z-40 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col p-4"
          style={{
            right: `${SIDEBAR_WIDTH}px`,
            width: '280px',
            borderRight: '1px solid #334155'
          }}
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-blue-400" /> AI Autofill
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          {getAiAutofillPanelContent()}
        </div>
      )}
      
      {/* EXTENDED PANEL: QR Code */}
      {activePanel === 'qr-code' && (
        <div
          className="fixed top-20 bottom-20 z-40 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col p-4"
          style={{
            right: `${SIDEBAR_WIDTH}px`,
            width: '280px',
            borderRight: '1px solid #334155'
          }}
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <QrCode size={18} className="text-green-400" /> QR Code Menu
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          {getQrCodePanelContent()}
        </div>
      )}

      {/* 🟢 ADDED: Text Panel */}
      {activePanel === 'text' && (
        <div className="fixed top-20 bottom-20 z-40 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col p-4" style={{ right: `${SIDEBAR_WIDTH}px`, width: '280px', borderRight: '1px solid #334155' }}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
            <h3 className="font-bold text-white flex items-center gap-2"><Type size={18} /> Add Text</h3>
            <button onClick={() => setActivePanel(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
          </div>
          {getTextPanelContent()}
        </div>
      )}

      {/* 🟢 ADDED: Image Panel */}
      {activePanel === 'image' && (
        <div className="fixed top-20 bottom-20 z-40 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col p-4" style={{ right: `${SIDEBAR_WIDTH}px`, width: '280px', borderRight: '1px solid #334155' }}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
            <h3 className="font-bold text-white flex items-center gap-2"><ImageIcon size={18} /> Images</h3>
            <button onClick={() => setActivePanel(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
          </div>
          {getImagePanelContent()}
        </div>
      )}
    </>
  );
};

export default EditorDropdownSidebar;