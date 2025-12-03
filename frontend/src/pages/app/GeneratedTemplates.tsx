import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import CertificateTemplate from "../../components/CertificateTemplate";
import { CertificateElement, GeneratedCertificate } from "../../types/certificate";
import { useCertificate } from "../../context/CertificateContext";
import ShareLinkButton from "../../components/ShareLinkButton"; 

// --- Icons  ---
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const IconLoader = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
// --- End Icons ---


// Map certificate sizes to dimensions (Fallback only)
const SIZE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "a4-portrait": { width: 794, height: 1123 },
  "a4-landscape": { width: 1123, height: 794 },
  "legal-portrait": { width: 816, height: 1248 },
  "legal-landscape": { width: 1248, height: 816 },
  "letter-portrait": { width: 816, height: 1056 },
  "letter-landscape": { width: 1056, height: 816 },
};

// ⭐️ UPDATED TYPE: Added width, height AND thumbnail_url
type CertificateRow = {
  id: string;
  user_id: string;
  title: string | null;
  prompt: string | null;
  size: string | null;
  width?: number; 
  height?: number; 
  thumbnail_url?: string; // 🟢 Added this field
  elements: CertificateElement[];
  created_at: string;
  generated_instances: GeneratedCertificate[] | null; 
};

export default function GeneratedTemplates() {
  const navigate = useNavigate();
  const { setCurrentCertificate } = useCertificate();
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // NEW STATE: To track selected certificates for bulk deletion
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]); 
  // NEW STATE: To track individual certificate deletion state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setSelectedCertificates([]); 

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // 🟢 1. Select all fields including thumbnail_url
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        // Map response to our type
        const mappedCertificates: CertificateRow[] = data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            title: item.title || item.name || "Untitled", 
            prompt: item.prompt,
            size: item.size,
            width: item.width,   
            height: item.height, 
            thumbnail_url: item.thumbnail_url, // 🟢 Map the thumbnail
            elements: item.elements || [],
            created_at: item.created_at,
            generated_instances: item.generated_instances
        }));
        setCertificates(mappedCertificates);
      } else if (error) {
        console.error("Failed to fetch certificates:", error);
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoading(false);
    }
  }, []); 

  // --- Filtering ---
  const filteredCertificates = certificates.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase() || "")
  );

  // --- Selection Handlers ---
  const handleSelectCertificate = (id: string, isChecked: boolean) => {
    setSelectedCertificates(prev => 
      isChecked ? [...prev, id] : prev.filter(certId => certId !== id)
    );
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      const allIds = filteredCertificates.map(c => c.id);
      setSelectedCertificates(allIds);
    } else {
      setSelectedCertificates([]);
    }
  };

  // --- Deletion Handlers ---
  const handleDeleteCertificate = async (certificateId: string, certificateTitle: string | null) => {
    if (!window.confirm("Are you sure you want to delete this certificate?")) {
      return;
    }
    
    setDeletingId(certificateId);
    setLoading(true); 

    try {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", certificateId);

      if (error) {
        throw error;
      }

      setCertificates((prev) => prev.filter((c) => c.id !== certificateId));
      alert(`Certificate "${certificateTitle || 'Untitled'}" deleted successfully.`);

    } catch (err) {
      console.error("Error deleting certificate:", err);
      alert("Failed to delete certificate. Please try again.");
    } finally {
      setLoading(false);
      setDeletingId(null); 
    }
  };

  const handleDeleteSelected = async () => {
    const count = selectedCertificates.length;
    if (count === 0) {
      alert("Please select at least one certificate to delete.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${count} selected certificate(s)? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .in("id", selectedCertificates);

      if (error) {
        throw error;
      }

      alert(`Successfully deleted ${count} selected certificate(s).`);
      fetchList(); 

    } catch (err) {
      console.error("Error deleting selected certificates:", err);
      alert("Failed to delete selected certificates. Please try again.");
      setLoading(false);
    }
  };


  const allFilteredSelected = filteredCertificates.length > 0 && 
                              filteredCertificates.every(c => selectedCertificates.includes(c.id));
  
  const isAnySelected = selectedCertificates.length > 0;
  
  // ⭐️ EDIT HANDLER
  const handleEdit = (c: CertificateRow) => {
    let width = c.width;
    let height = c.height;

    if (!width || !height) {
        const dimensions = SIZE_DIMENSIONS[c.size || "a4-portrait"];
        width = dimensions?.width || 794;
        height = dimensions?.height || 1123;
    }

    setCurrentCertificate({
        id: c.id,
        name: c.title || "Untitled",
        size: (c.size as any) || "custom", 
        width: width,   
        height: height, 
        backgroundColor: "#ffffff",
        elements: c.elements || [],
        createdAt: new Date(c.created_at),
        prompt: c.prompt || "",
        generated_instances: c.generated_instances, 
    });

    navigate("/app/studio/certificate-editor");
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Certificates</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Manage your saved designs. Edit to customize or generate new ones.
            </p>
          </div>
        </div>

        {/* Bulk Actions and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <input
                type="text"
                placeholder="Search certificates..."
                className="w-full md:flex-1 p-2 bg-slate-700 border border-slate-600 rounded text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
            />
            
            {filteredCertificates.length > 0 && !loading && (
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="selectAll"
                        className="h-4 w-4 text-yellow-500 bg-slate-800 border-slate-600 rounded focus:ring-yellow-500"
                        checked={allFilteredSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <label htmlFor="selectAll" className="text-sm font-medium text-slate-300">
                        Select All ({filteredCertificates.length})
                    </label>
                </div>
            )}

            <button
                className={`px-4 py-2 text-sm rounded transition ${
                    isAnySelected
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-red-900 text-slate-500 cursor-not-allowed"
                }`}
                onClick={handleDeleteSelected}
                disabled={!isAnySelected || loading}
            >
                Delete Selected ({selectedCertificates.length})
            </button>
        </div>

        {/* Content */}
        {loading ? (
          <p>Loading certificates...</p>
        ) : filteredCertificates.length === 0 ? (
          <div className="p-8 bg-slate-800 rounded shadow text-slate-400">
            No certificates found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((c) => {
                const isSelected = selectedCertificates.includes(c.id);
                
                // 🟢 Determine dimensions for Thumbnail Preview
                let tWidth = c.width;
                let tHeight = c.height;
                if (!tWidth || !tHeight) {
                    const d = SIZE_DIMENSIONS[c.size || "a4-landscape"];
                    tWidth = d?.width || 1123;
                    tHeight = d?.height || 794;
                }
                
                // Calculate scale for fallback live-render
                // Box height is fixed at h-56 (224px). 
                const scale = 200 / (tHeight || 1); 
                
                return (
                <div
                    key={c.id}
                    className={`group relative bg-slate-900 border rounded-xl overflow-hidden hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 flex flex-col ${
                        isSelected ? "border-yellow-500 ring-2 ring-yellow-500" : "border-slate-800"
                    }`}
                >
                    {/* Selection Checkbox */}
                    <div className="flex justify-end p-2 absolute top-0 right-0 z-10">
                        <input 
                            type="checkbox" 
                            className="h-4 w-4 text-yellow-500 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500"
                            checked={isSelected}
                            onChange={(e) => handleSelectCertificate(c.id, e.target.checked)}
                            disabled={loading}
                        />
                    </div>

                    {/* Preview / Thumbnail Area - UPDATED FOR IMAGE SUPPORT & STYLING */}
                    <div 
                        className="h-56 bg-slate-950/50 relative overflow-hidden border-b border-slate-800 flex items-center justify-center cursor-pointer p-4"
                        onClick={() => handleEdit(c)}
                    >
                         {/* 🟢 Aspect Ratio Container */}
                         <div 
                            style={{
                               aspectRatio: `${tWidth} / ${tHeight}`,
                            }}
                            className="w-full h-full flex items-center justify-center shadow-lg bg-white/5"
                         >
                            {c.thumbnail_url ? (
                                // 1. IMAGE PREVIEW (Prioritize this!)
                                <img 
                                    src={c.thumbnail_url} 
                                    alt={c.title || "Certificate"} 
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            ) : (
                                // 2. LIVE RENDER FALLBACK (If no image)
                                // We keep the scale logic but inside the aspect-ratio box so it centers nicely
                                <div className="flex items-center justify-center w-full h-full overflow-hidden">
                                     <div 
                                        style={{
                                            width: tWidth,
                                            height: tHeight,
                                            transform: `scale(${scale})`,
                                            transformOrigin: 'center',
                                        }}
                                        className="bg-white shadow-lg flex-shrink-0 origin-center"
                                     >
                                        <CertificateTemplate elements={c.elements ?? []} />
                                     </div>
                                </div>
                            )}
                         </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                         <span className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Click to Edit
                          </span>
                        </div>
                    </div>


                    {/* Card Body */}
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-semibold text-slate-100 truncate pr-2 flex-1 mb-1" title={c.title || "Untitled"}>
                            {(c.title || "Untitled Project").toUpperCase()}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] uppercase tracking-wider font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                                {c.size}
                            </span>
                            <span className="text-slate-500 text-xs">
                                • {new Date(c.created_at).toLocaleString()} 
                            </span>
                        </div>
                        
                        {/* Actions Footer */}
                        <div className="mt-auto flex items-center gap-2 pt-3 border-t border-slate-800/50">
                         {/* Edit Button */}
                         <button
                            onClick={() => handleEdit(c)}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-md transition-colors shadow-lg shadow-blue-900/20"
                          >
                            <IconEdit /> Edit
                          </button>
                          
                          {/* Share Button */}
                          <ShareLinkButton 
                                certificateId={c.id} 
                                certificateTitle={c.title} 
                                onShareClick={(e) => e.stopPropagation()}
                          />

                          {/* Delete Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCertificate(c.id, c.title); }}
                            disabled={deletingId === c.id}
                            className="flex items-center justify-center p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete Certificate"
                          >
                            {deletingId === c.id ? <IconLoader /> : <IconTrash />}
                          </button>
                        </div>
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
}