<<<<<<< HEAD
//CertificatePreview.tsx


import { useState, useRef } from "react";
import { Share2, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import CertificateLayout from "../layouts/CertificateLayout";
import CertificateTemplate from "./CertificateTemplate";
import { CertificateElement } from "../types/certificate";
=======
import { useState, useRef, useEffect } from "react";
import { Share2, Sparkles, ZoomIn, ZoomOut, Save, X, Loader2 } from "lucide-react"; 
import html2canvas from "html2canvas"; // 🟢 Import html2canvas
import CertificateLayout from "../layouts/CertificateLayout";
import CertificateTemplate from "./CertificateTemplate";
import { CertificateElement } from "../types/certificate";
import { supabase } from "../lib/supabaseClient";
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b

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
  onBack?: () => void;
  onUseTemplate?: () => void;
  generatedElements?: CertificateElement[];
}

<<<<<<< HEAD
function CertificatePreview({
=======
export default function CertificatePreview({
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
  size,
  prompt,
  onPromptChange,
  onGenerate,
  onUseTemplate,
<<<<<<< HEAD
  generatedElements,
=======
  generatedElements = [],
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
}: CertificatePreviewProps) {
  const [localPrompt, setLocalPrompt] = useState(prompt || "");
  const [isHovered, setIsHovered] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(75);
<<<<<<< HEAD
  const layoutRef = useRef<HTMLDivElement>(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPrompt(e.target.value);
    onPromptChange?.(e.target.value);
=======
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  
  const [isRedirectPromptOpen, setIsRedirectPromptOpen] = useState(false);

  useEffect(() => {
    setLocalPrompt(prompt);
  }, [prompt]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalPrompt(value);
    onPromptChange?.(value);
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
  };

  const handleElementClick = (name: string) => {
    setSelectedElement(name);
  };

  const zoomOut = () => setZoom((z) => Math.max(25, z - 5));
  const zoomIn = () => setZoom((z) => Math.min(100, z + 5));
  const scale = zoom / 100;

<<<<<<< HEAD
=======
  const closeSaveModal = () => {
    setIsSaveOpen(false);
    setSaving(false);
  };

  const closeRedirectPrompt = () => {
      setIsRedirectPromptOpen(false);
  };

  const handleRedirect = () => {
      setIsRedirectPromptOpen(false);
      window.location.href = '/app/studio/generated-templates';
  };

  const handleSaveDesignClick = () => {
    if (!generatedElements || generatedElements.length === 0) {
        alert("Please generate a certificate design first.");
        return;
    }
    setSaveTitle("");
    setIsSaveOpen(true);
  };

  // 🟢 HELPER: Capture and Upload Thumbnail
  const captureAndUploadThumbnail = async (userId: string, certificateId: string) => {
    if (!layoutRef.current) return null;

    try {
      // 1. Capture High Quality Image
      const canvas = await html2canvas(layoutRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });

      return new Promise<string | null>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { resolve(null); return; }

          // 2. Upload to Supabase Storage
          const fileName = `${userId}/${Date.now()}_thumb.png`;
          const { error: uploadError } = await supabase.storage
            .from('thumbnails')
            .upload(fileName, blob, { upsert: true });

          if (uploadError) {
            console.error("Thumbnail upload failed:", uploadError);
            resolve(null);
            return;
          }

          // 3. Get Public URL
          const { data } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
          
          // 4. Update the Certificate Record in DB
          if (data.publicUrl) {
             await supabase
               .from("certificates")
               .update({ thumbnail_url: data.publicUrl })
               .eq("id", certificateId);
          }

          resolve(data.publicUrl);
        }, 'image/png');
      });
    } catch (err) {
      console.error("Error capturing thumbnail:", err);
      return null;
    }
  };

  const handleSave = async () => {
    if (!generatedElements || generatedElements.length === 0) {
      alert("No generated elements to save.");
      return;
    }

    setSaving(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const userId = sessionData?.session?.user?.id;

    if (!token || !userId) {
      alert("You must be signed in to save a certificate.");
      setSaving(false);
      return;
    }

    try {
      // 1. Save Data via Edge Function
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-certificate`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: saveTitle || null,
          prompt: localPrompt || null,
          size,
          elements: generatedElements,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error("Save error:", json);
        alert(json?.error || "Failed to save certificate");
        setSaving(false);
        return;
      }

      // 🟢 2. Generate and Update Thumbnail (Background process)
      if (json.certificate && json.certificate.id) {
         console.log("Generating thumbnail...");
         await captureAndUploadThumbnail(userId, json.certificate.id);
      }

      alert("Certificate saved successfully!");
      setIsSaveOpen(false);
      setIsRedirectPromptOpen(true); 
      
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed.");
    } finally {
        setSaving(false); 
    }
  };

>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <div className="flex-1 overflow-auto bg-transparent relative">
        <div className="min-h-full w-full flex items-start justify-center p-10 relative">
          <div
            className="relative"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              transition: "transform 0.1s ease",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
<<<<<<< HEAD
            <div ref={layoutRef}>
              <CertificateLayout size={size}>
                <div className="w-full h-full bg-white relative shadow-lg overflow-hidden">
                  <div className="absolute top-4 left-4 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md z-10">
                    {size.toUpperCase().replace("-", " ")}
                  </div>

                  {selectedElement && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md z-10">
                      Selected: {selectedElement.replace(/-/g, " ").toUpperCase()}
                    </div>
                  )}

=======
            {/* 🟢 Ref attached here to capture the design */}
            <div ref={layoutRef} className="shadow-2xl">
              <CertificateLayout size={size}>
                <div className="w-full h-full bg-white relative overflow-hidden">
                  
                  {/* Hide these overlays during capture if possible, mostly purely visual */}
                  <div className="absolute top-4 left-4 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md z-10 opacity-50 hover:opacity-100 transition-opacity">
                    {size.toUpperCase().replace("-", " ")}
                  </div>

>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
                  <CertificateTemplate
                    elements={generatedElements || []}
                    onElementSelect={handleElementClick}
                  />

<<<<<<< HEAD
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
=======
                  {/* Hover Overlay */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 z-50 ${
                      isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    // Ensure this layer is ignored by html2canvas if possible via ignoreElements, 
                    // or relying on it being opacity-0 when not hovered (mouse not over during save click ideally)
                  >
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveDesignClick}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium text-sm py-3 px-6 rounded-lg shadow-md transition-all z-50"
                      >
                        SAVE DESIGN
                      </button>
                    </div>
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
                  </div>
                </div>
              </CertificateLayout>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 p-6 pt-4 flex items-center justify-between gap-4 border-t border-slate-700">
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

        <button
          onClick={onGenerate}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </button>

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

          <span className="text-slate-300 text-sm w-12 text-center">{zoom}%</span>
        </div>
      </div>
<<<<<<< HEAD
    </div>
  );
}

export default CertificatePreview;
=======

      {/* Save Modal */}
      {isSaveOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75">
          <div className="absolute inset-0" onClick={() => { if (!saving) closeSaveModal(); }} />
          <div className="relative w-full max-w-md bg-slate-900 rounded-xl shadow-2xl p-6 z-[70] border border-slate-700 text-white">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
                <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Save size={24} className="text-green-500" /> Save Generated Design
                </h3>
                <button
                    className="text-slate-500 hover:text-white transition-colors"
                    onClick={() => closeSaveModal()}
                    disabled={saving}
                >
                    <X size={20} />
                </button>
            </div>
            <div className="text-sm text-slate-400 mb-6">
                <p>You must save the generated design before editing it as a custom template.</p>
            </div>
            <div className="mb-8">
                <label className="block text-sm font-medium text-slate-300 mb-2">Design Name</label>
                <input
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Enter a descriptive title"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    disabled={saving}
                />
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-3 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                onClick={() => closeSaveModal()}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-600/50 flex-1 max-w-[200px] flex items-center justify-center gap-2"
                onClick={handleSave} 
                disabled={saving}
              >
                {saving && <Loader2 className="animate-spin w-4 h-4" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Modal */}
      {isRedirectPromptOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75">
          <div className="absolute inset-0" onClick={closeRedirectPrompt} />
          <div className="relative w-full max-w-md bg-slate-900 rounded-xl shadow-2xl p-6 z-[70] border border-slate-700 text-white">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
                <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Sparkles size={24} className="text-blue-500" /> Redirect to Templates?
                </h3>
                <button className="text-slate-500 hover:text-white transition-colors" onClick={closeRedirectPrompt}>
                    <X size={20} />
                </button>
            </div>
            <div className="text-base text-slate-300 mb-8">
                <p>Your design has been saved successfully!</p>
                <p className="mt-2 text-sm text-slate-400">Would you like to continue to the Generated Certifcates section now?</p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-3 rounded-lg bg-slate-700 text-slate-300 font-semibold hover:bg-slate-600 transition-colors"
                onClick={closeRedirectPrompt}
              >
                Stay
              </button>
              <button
                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                onClick={handleRedirect}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
