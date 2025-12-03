import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Edit, Wand2, Trash2, Loader2, FileImage } from "lucide-react"; 
import { supabase } from "../../lib/supabaseClient";
import { convertCustomStateToElements } from "../../utils/templateAdapter";

// ⭐️ UPDATED TO 96 DPI
const PAPER_SIZES = {
  A4: { width: 794, height: 1123 },
  LEGAL: { width: 816, height: 1248 },
  LETTER: { width: 816, height: 1056 },
};

interface TemplateData {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnail_url?: string; // ⭐ ADDED: For displaying the preview image
  canvas_state: any;
  created_at: string;
}

export default function CustomTemplateHub() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("A4");
  const [orientation, setOrientation] = useState<"PORTRAIT" | "LANDSCAPE">("LANDSCAPE");
  
  // Data State
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH TEMPLATES ---
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(!window.confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // --- ACTIONS ---

  const handleCreateNew = () => {
    const baseSize = PAPER_SIZES[selectedFormat as keyof typeof PAPER_SIZES];
    const width = orientation === "LANDSCAPE" ? baseSize.height : baseSize.width;
    const height = orientation === "LANDSCAPE" ? baseSize.width : baseSize.height;

    // Navigate to Structural Editor (Fresh)
    navigate("/app/studio/custom-template/editor", {
      state: { width, height, format: selectedFormat, orientation },
    });
  };

  const handleEditTemplate = (template: TemplateData) => {
    // Navigate to Structural Editor (Load Existing)
    // Note: You need to update CustomTemplateEditor to accept `state.templateData`
    navigate("/app/studio/custom-template/editor", {
      state: { 
        width: template.width, 
        height: template.height, 
        templateId: template.id,
        initialState: template.canvas_state // Pass the raw JSON back to the creator
      },
    });
  };

  const handleCustomizeWithAi = (template: TemplateData) => {
    // 1. Convert structural JSON to Flat Element Array
    const convertedElements = convertCustomStateToElements(template.canvas_state);
    
    // 2. Navigate to AI Certificate Editor with converted data
    navigate("/app/studio/certificate-editor", {
      state: { 
        loadFromTemplate: true,
        width: template.width,
        height: template.height,
        elements: convertedElements,
        name: template.name,
        // ⭐ PASS THE THUMBNAIL URL HERE
        thumbnailUrl: template.thumbnail_url 
      },
    });
  };

  return (
    <div className="p-8 text-white min-h-screen bg-gray-900">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Custom Template Hub</h1>
          <p className="text-gray-400 mt-1">Design structural layouts or customize existing ones.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} /> Create New Template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-400 gap-2">
          <Loader2 className="animate-spin" /> Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed">
          <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <FileImage className="text-gray-500" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-300">No custom templates yet</h3>
          <p className="text-gray-500 mt-2 mb-6">Create a structure to start mass-producing certificates.</p>
          <button
             onClick={() => setIsModalOpen(true)}
             className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Create one now &rarr;
          </button>
        </div>
      ) : (
        /* GRID OF TEMPLATES */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((t) => (
            <div key={t.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all shadow-lg group flex flex-col">
              
              {/* Preview Area - UPDATED TO FIX BLUR */}
              <div className="h-56 bg-gray-900/50 relative flex items-center justify-center overflow-hidden p-4">
                {/* We use a wrapper to force the correct aspect ratio so object-contain works perfectly */}
                <div style={{ aspectRatio: `${t.width} / ${t.height}` }} className="w-full h-full flex items-center justify-center shadow-md">
                    {t.thumbnail_url ? (
                    <img 
                        src={t.thumbnail_url} 
                        alt={t.name} 
                        className="w-full h-full object-contain" 
                    />
                    ) : (
                    // Simple Fallback 
                    <div className="bg-gray-800 w-full h-full flex items-center justify-center">
                        <div className="flex items-center justify-center text-gray-500 text-sm uppercase font-bold tracking-widest p-4 text-center">
                            <FileImage size={24} className="mr-2"/> No Preview
                        </div>
                    </div>
                    )}
                </div>
                
                {/* Delete Button (Visible on Hover) */}
                <button 
                  onClick={(e) => handleDelete(t.id, e)}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Template"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Info Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white truncate" title={t.name}>{t.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.width} x {t.height}px • Updated {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5">
                  <button 
                    onClick={() => handleEditTemplate(t)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit size={14} /> Edit Structure
                  </button>
                  <button 
                    onClick={() => handleCustomizeWithAi(t)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Wand2 size={14} /> AI Customize
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md relative shadow-2xl border border-gray-700">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white">Create New Template</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Paper Format</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="A4">A4 (Standard)</option>
                  <option value="LEGAL">Legal</option>
                  <option value="LETTER">US Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Orientation</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOrientation("PORTRAIT")}
                    className={`p-3 rounded-lg border flex items-center justify-center transition-all ${
                      orientation === "PORTRAIT"
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setOrientation("LANDSCAPE")}
                    className={`p-3 rounded-lg border flex items-center justify-center transition-all ${
                      orientation === "LANDSCAPE"
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateNew}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-blue-900/30 mt-2"
              >
                Open Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}