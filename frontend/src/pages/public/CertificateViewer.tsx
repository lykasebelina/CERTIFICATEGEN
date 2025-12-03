import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import { Download, Facebook, CheckCircle, AlertCircle } from "lucide-react"; 
import KonvaCanvas from "../../components/KonvaCanvas";
import { supabase } from "../../lib/supabaseClient"; 
import { CertificateElement } from "../../types/certificate"; 

// --- TYPES ---
interface GeneratedCertificateInstance {
  id?: string;
  name: string;
  elements: CertificateElement[];
}

interface PublicCertificateData {
  id: string;
  name: string; 
  width: number;
  height: number;
  template_elements: CertificateElement[]; 
  generated_instances: GeneratedCertificateInstance[] | null;
}

const SIZE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "a4-portrait": { width: 794, height: 1123 },
  "a4-landscape": { width: 1123, height: 794 },
  "legal-portrait": { width: 816, height: 1248 },
  "legal-landscape": { width: 1248, height: 816 },
  "letter-portrait": { width: 816, height: 1056 },
  "letter-landscape": { width: 1056, height: 816 },
};

// --- FETCH FUNCTION ---
const fetchPublicCertificateData = async (certId: string): Promise<PublicCertificateData | null> => {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select("id, title, size, width, height, elements, generated_instances") 
      .eq("id", certId)
      .single();

    if (error) {
      console.error("Supabase fetch error:", error);
      return null;
    }

    if (!data) return null;

    let finalWidth = data.width;
    let finalHeight = data.height;

    if (!finalWidth || !finalHeight) {
       const preset = SIZE_DIMENSIONS[data.size as string];
       if (preset) {
         finalWidth = preset.width;
         finalHeight = preset.height;
       } else {
         finalWidth = 1123;
         finalHeight = 794;
       }
    }

    return {
      id: data.id,
      name: data.title || "Untitled Certificate",
      width: finalWidth,
      height: finalHeight,
      template_elements: data.elements,
      generated_instances: data.generated_instances as GeneratedCertificateInstance[] | null,
    };

  } catch (e) {
    console.error("Error fetching certificate data:", e);
    return null;
  }
};

const CertificateViewer: React.FC = () => {
  const { certId } = useParams<{ certId: string }>();
  const [searchParams] = useSearchParams(); 
  
  const [data, setData] = useState<PublicCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  
  // Responsive Scale State
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (certId) {
      setLoading(true);
      fetchPublicCertificateData(certId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [certId]);

  // --- RESPONSIVE SCALING EFFECT ---
  useEffect(() => {
    const handleResize = () => {
      if (!data || !containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      // Use 75% of viewport height as max height constraint
      const containerHeight = window.innerHeight * 0.75; 

      const certificateWidth = data.width;
      const certificateHeight = data.height;
      
      // Calculate scale to fit container width, accounting for padding (32px)
      const widthScale = (containerWidth - 32) / certificateWidth;
      // Calculate scale to fit max container height
      const heightScale = containerHeight / certificateHeight;

      // Use the smaller scale to ensure it fits both dimensions, and don't upscale beyond 1
      let newScale = Math.min(widthScale, heightScale, 1);
      
      setScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); 

    return () => window.removeEventListener("resize", handleResize);
  }, [data]);


  const certificatesToRender: GeneratedCertificateInstance[] = useMemo(() => {
    if (!data) return [];

    const instanceIdParam = searchParams.get("instanceId");

    // 1. QR Code Mode: specific instance
    if (instanceIdParam && instanceIdParam !== "template-preview") {
      if (data.generated_instances) {
        const found = data.generated_instances.find(inst => inst.id === instanceIdParam);
        if (found) return [found];
      }
    }

    // 2. Bulk Mode: Show all
    if (data.generated_instances && Array.isArray(data.generated_instances) && data.generated_instances.length > 0) {
      return data.generated_instances;
    }

    // 3. Template Mode
    if (data.template_elements && Array.isArray(data.template_elements) && data.template_elements.length > 0) {
      return [{ name: data.name, elements: data.template_elements }];
    }

    return [];
  }, [data, searchParams]);

  // --- DOWNLOAD LOGIC ---
  const handleDownload = useCallback(async (index: number, name: string, format: 'image' | 'pdf') => {
    if (!data) return;
    
    const element = document.getElementById(`certificate-view-${index}`);
    if (!element) {
      alert("Could not find certificate element to capture.");
      return;
    }

    setDownloading(name);

    try {
      const canvas = await html2canvas(element, { 
          useCORS: true, 
          scale: 2, 
          backgroundColor: "#ffffff",
          windowWidth: data.width,
          windowHeight: data.height
      });

      const fileName = `${data.name} - ${name}`;

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = data.width;
        const imgHeight = data.height;
        const orientation = imgWidth > imgHeight ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'pt', 'a4');
        
        const a4Width = orientation === 'l' ? 841.89 : 595.28;
        const a4Height = orientation === 'l' ? 595.28 : 841.89;
        const ratio = Math.min(a4Width / imgWidth, a4Height / imgHeight);
        const pdfImgWidth = imgWidth * ratio;
        const pdfImgHeight = imgHeight * ratio;
        const xOffset = (a4Width - pdfImgWidth) / 2;
        const yOffset = (a4Height - pdfImgHeight) / 2;

        pdf.addImage(imgData, 'JPEG', xOffset, yOffset, pdfImgWidth, pdfImgHeight);
        pdf.save(`${fileName}.pdf`);
      } else {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      setDownloading(null);
    } catch (err) {
      console.error("Download failed:", err);
      alert(`Failed to download ${name}.`);
      setDownloading(null);
    } 
  }, [data]);

  const handleShareFacebook = (index: number, name: string) => {
    const url = window.location.href; 
    const shareTitle = `A Certificate for ${name} from ${data?.name}!`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg font-medium text-slate-300">Loading Certificate...</p>
      </div>
    );
  }

  if (!data || certificatesToRender.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h2>
        <p className="text-slate-400 max-w-md">
          We couldn't find the certificate you are looking for. It may have been deleted or the link is incorrect.
        </p>
      </div>
    );
  }
   
  const isVerifiedView = searchParams.get("instanceId") && searchParams.get("instanceId") !== "template-preview";

  return (
    <div className="min-h-screen bg-[#0f172a] py-8 sm:py-12 text-slate-200 font-sans overflow-x-hidden">
      <div ref={containerRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="text-center mb-10">
          {isVerifiedView && (
             <div className="flex items-center justify-center gap-2 mb-4 text-green-400">
                <CheckCircle size={24} />
                <span className="font-bold text-lg">Official Verified Certificate</span>
             </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{data.name}</h1>
          <p className="mt-3 text-lg text-slate-400">
            {isVerifiedView ? `Issued to ${certificatesToRender[0].name}` : 'Certificate Preview'}
          </p>
        </header>

        <div className="space-y-16">
          {certificatesToRender.map((cert, index) => (
            <div key={index} className="bg-[#1e293b] p-4 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col items-center">
              
              <h2 className="text-xl font-semibold text-center mb-6 text-white">
                {certificatesToRender.length > 1 && <span className="text-blue-500 mr-2">#{index + 1}</span>}
                {cert.name}
              </h2>

              <div 
                className="relative overflow-hidden shadow-2xl rounded-sm border border-slate-600 mb-8"
                style={{
                   width: data.width * scale,
                   height: data.height * scale
                }}
              >
                 <div 
                    style={{
                      width: data.width,
                      height: data.height,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                 >
                   <div id={`certificate-view-${index}`} className="bg-white w-full h-full">
                      <KonvaCanvas
                        width={data.width}
                        height={data.height}
                        elements={cert.elements}
                        isEditable={false}
                        onElementSelect={() => {}}
                      />
                   </div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto mt-2 z-10 relative">
                <button
                  onClick={() => handleDownload(index, cert.name, 'pdf')}
                  disabled={downloading !== null}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-blue-500/20 w-full sm:w-auto"
                >
                  <Download size={18} />
                  {downloading === cert.name ? 'Processing...' : 'Download PDF'}
                </button>
                
                <button
                  onClick={() => handleDownload(index, cert.name, 'image')}
                  disabled={downloading !== null}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl text-white font-bold transition-all shadow-lg border border-slate-600 w-full sm:w-auto"
                >
                  <Download size={18} />
                  {downloading === cert.name ? 'Processing...' : 'Download PNG'}
                </button>

                <button
                  onClick={() => handleShareFacebook(index, cert.name)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1877F2] hover:bg-[#166fe5] rounded-xl text-white font-bold transition-all shadow-lg w-full sm:w-auto"
                >
                  <Facebook size={18} /> Share
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CertificateViewer;