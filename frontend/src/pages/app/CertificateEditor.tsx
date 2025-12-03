import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from "uuid";
// QR Code generation library
import QRCode from 'qrcode'; 

import { CertificateElement } from "../../types/certificate";
import { useCertificate } from "../../context/CertificateContext";
import { supabase } from "../../lib/supabaseClient";
import EditorTopBar, { ExportFormat } from "../../components/EditorTopBar";
import EditorBottomBar from "../../components/EditorBottomBar";
import EditorDropdownSidebar from "../../components/EditorDropdownSidebar";
import KonvaCanvas from "../../components/KonvaCanvas";

// MODALS AND BUTTONS
import { DownloadModal } from "../../components/DownloadModal";
import { ShareModal } from "../../components/ShareModal";

// UTILS
import { generateImageWithDALLE, determineImageSize } from "../../lib/openai/utils/dalleUtils";
import { uploadDalleImageToSupabase } from "../../lib/storageUtils";
import {
  getAiExtractedContent,
  AI_TEXT_MAP,
  AiExtractedContent,
  OLD_AI_ID_MAP
} from "../../lib/openai/generators/textGenerator";


// IMPLEMENTATION OF REAL QR CODE GENERATION
const generateQrCodeImage = async (data: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(data, { 
      width: 240, 
      margin: 1, 
      color: {
        dark: '#000000FF', 
        light: '#FFFFFFFF' 
      }
    });
    return dataUrl;
  } catch (err) {
    console.error("Failed to generate QR code with library:", err);
    const canvas = document.createElement('canvas');
    canvas.width = 100; canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if(ctx) {
      ctx.fillStyle = 'red'; 
      ctx.fillRect(0, 0, 100, 100);
    }
    return canvas.toDataURL();
  }
};


interface GeneratedCertificate {
  id: string; 
  name: string;
  elements: CertificateElement[];
}

const MAX_HISTORY_SIZE = 50;
const pushHistory = (
  history: CertificateElement[][],
  historyIndex: number,
  newElements: CertificateElement[]
): [CertificateElement[][], number] => {
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(newElements);
  if (newHistory.length > MAX_HISTORY_SIZE) {
    newHistory.shift();
  }
  const newIndex = newHistory.length - 1;
  return [newHistory, newIndex];
};


const CertificateEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCertificate, setCurrentCertificate } = useCertificate();

  // History State
  const initialElements = useMemo(() => currentCertificate?.elements || [], [currentCertificate]);
  const [history, setHistory] = useState<CertificateElement[][]>([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Selection State
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedCertificateIndex, setSelectedCertificateIndex] = useState<number | null>(null);

  const [zoom, setZoom] = useState(75);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(0);

  const [loadingImages, setLoadingImages] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Bulk State
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);
  const [bulkGeneratedCertificates, setBulkGeneratedCertificates] = useState<GeneratedCertificate[]>([]);

  // Text Adding State
  const [isAddingText, setIsAddingText] = useState(false);
  // AI Generation State
  const [isAiGenerating, setIsAiGenerating] = useState(false); 
  const [isAiAutofilling, setIsAiAutofilling] = useState(false); 
  
  // QR Code State
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  
  // Inherited Thumbnail
  const [inheritedThumbnail, setInheritedThumbnail] = useState<string | null>(null);

  // MODAL STATES
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // State for Sidebar Image Gallery
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // --- EFFECT: LOAD TEMPLATE ---
  useEffect(() => {
    if (location.state && location.state.loadFromTemplate && location.state.elements) {
      console.log("📥 Loading Template from Hub:", location.state.name);

      setCurrentCertificate({
        id: `imported_${Date.now()}`,
        name: location.state.name || "Customized Template",
        width: location.state.width || 842,
        height: location.state.height || 595,
        size: "custom",
        backgroundColor: "#ffffff",
        elements: location.state.elements,
        createdAt: new Date(),
        prompt: "",
      });

      if (location.state.thumbnailUrl) {
        setInheritedThumbnail(location.state.thumbnailUrl);
      }
      setHistory([location.state.elements]);
      setHistoryIndex(0);
    }
  }, [location.state, setCurrentCertificate]);

  // --- 🟢 FIX APPLIED HERE: Load saved bulk certificates ---
  useEffect(() => {
    if (currentCertificate) {
      if ('generated_instances' in currentCertificate) {
        const savedInstances = currentCertificate.generated_instances as GeneratedCertificate[] | undefined;
        if (savedInstances && Array.isArray(savedInstances) && savedInstances.length > 0) {
          const validatedInstances: GeneratedCertificate[] = savedInstances.map(inst => ({
            ...inst,
            id: inst.id || uuidv4() 
          }));
          setBulkGeneratedCertificates(validatedInstances);
        } else {
           // Only reset if we are intentionally loading a fresh certificate that has NO instances
           // We check current state length to avoid wiping it during small updates
           if (bulkGeneratedCertificates.length === 0) {
             setBulkGeneratedCertificates([]);
           }
        }
      }
    }
    // 🟢 CRITICAL FIX: Only run this when the Certificate ID changes (new file loaded),
    // not when the content of the certificate changes (like during AI Autofill).
  }, [currentCertificate?.id]); 

  // LOAD GLOBAL LIBRARY (Canva-Style)
  useEffect(() => {
    const fetchGlobalLibrary = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("🌍 Loading Global Image Library...");
      
      const { data, error } = await supabase
        .from('user_uploads')
        .select('file_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading library:", error);
      } else if (data) {
        setUploadedImages(data.map(item => item.file_url));
      }
    };

    fetchGlobalLibrary();
  }, []);

  // --- CORE STATE UPDATE ---
  const updateTemplateState = useCallback(
    (newElements: CertificateElement[]) => {
      if (!currentCertificate) return;
      const [newHistory, newIndex] = pushHistory(history, historyIndex, newElements);
      setHistory(newHistory);
      setHistoryIndex(newIndex);
      setCurrentCertificate({ ...currentCertificate, elements: newElements });
    },
    [currentCertificate, setCurrentCertificate, history, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (bulkGeneratedCertificates.length > 0) return;
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevElements = history[prevIndex];
      setCurrentCertificate((prevCert) => prevCert ? { ...prevCert, elements: prevElements } : null);
      setSelectedElement(null);
    }
  }, [history, historyIndex, setCurrentCertificate, bulkGeneratedCertificates.length]);

  // 🟢🟢🟢 REDO FUNCTIONALITY ADDED HERE 🟢🟢🟢
  const handleRedo = useCallback(() => {
    if (bulkGeneratedCertificates.length > 0) return;
    
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextElements = history[nextIndex];
      setCurrentCertificate((prevCert) => prevCert ? { ...prevCert, elements: nextElements } : null);
      setSelectedElement(null);
    }
  }, [history, historyIndex, setCurrentCertificate, bulkGeneratedCertificates.length]);

  const handleElementSelect = (index: number | null, id: string | null) => {
    setSelectedCertificateIndex(index);
    setSelectedElement(id);
  };

  const handleUniversalUpdate = (
    certIndex: number | null,
    elementId: string,
    updates: Partial<CertificateElement>,
    isFinal: boolean
  ) => {
    if (certIndex === null && currentCertificate) {
      const updatedElements = currentCertificate.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      );
      if (isFinal) updateTemplateState(updatedElements);
      else setCurrentCertificate({ ...currentCertificate, elements: updatedElements });
    } else if (certIndex !== null && bulkGeneratedCertificates.length > 0) {
      setBulkGeneratedCertificates(prev => {
        const newCertificates = [...prev];
        const targetCert = { ...newCertificates[certIndex] };
        targetCert.elements = targetCert.elements.map(el =>
          el.id === elementId ? { ...el, ...updates } : el
        );
        newCertificates[certIndex] = targetCert;
        return newCertificates;
      });
    }
  };

  const handleRealtimeUpdate = (certIndex: number | null) => (id: string, updates: Partial<CertificateElement>) => {
    handleUniversalUpdate(certIndex, id, updates, false);
  };

  const handleFinalUpdate = (certIndex: number | null) => (id: string, updates: Partial<CertificateElement>) => {
    handleUniversalUpdate(certIndex, id, updates, true);
  };

  const handleTextStyleChange = (style: any) => {
    if (!selectedElement) return;
    handleUniversalUpdate(selectedCertificateIndex, selectedElement, style, true);
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;
    if (selectedCertificateIndex === null && currentCertificate) {
      const updatedElements = currentCertificate.elements.filter(el => el.id !== selectedElement);
      updateTemplateState(updatedElements);
    } else if (selectedCertificateIndex !== null) {
      setBulkGeneratedCertificates(prev => {
        const newCertificates = [...prev];
        const targetCert = { ...newCertificates[selectedCertificateIndex] };
        targetCert.elements = targetCert.elements.filter(el => el.id !== selectedElement);
        newCertificates[selectedCertificateIndex] = targetCert;
        return newCertificates;
      });
    }
    setSelectedElement(null);
  };

  const handleAiGenerate = async (prompt: string, applyToAll: boolean) => {
    if (!selectedElement) return;
    const activeCert = isBulkMode ? bulkGeneratedCertificates[selectedCertificateIndex!] : currentCertificate;
    if (!activeCert) return;
    const elementToReplace = activeCert.elements.find(el => el.id === selectedElement);
    if (!elementToReplace) return;

    setIsAiGenerating(true);
    try {
      const sizeStr = determineImageSize(currentCertificate!.width, currentCertificate!.height);
      const safePrompt = `A high quality professional certificate design element, ${prompt}, abstract, soft texture, elegant style, white background`;
      const base64Data = await generateImageWithDALLE(safePrompt, sizeStr);
      if (!base64Data) throw new Error("DALL-E returned no data");

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || "guest";
      const permanentUrl = await uploadDalleImageToSupabase(base64Data, userId);
      if (!permanentUrl) throw new Error("Failed to save generated image to permanent storage.");

      const updateLayerInElements = (elementsToUpdate: CertificateElement[]) => {
        return elementsToUpdate.map(el => {
          if (el.zIndex === elementToReplace.zIndex) {
            return {
              ...el,
              type: elementToReplace.zIndex === 4 ? 'cornerFrame' : (el.type === 'background' ? 'background' : 'image'),
              imageUrl: permanentUrl,
              backgroundColor: 'transparent'
            };
          }
          return el;
        });
      };

      if (isBulkMode) {
        if (applyToAll) {
          setBulkGeneratedCertificates(prevCerts => prevCerts.map(cert => ({ ...cert, elements: updateLayerInElements(cert.elements) })));
          alert(`✅ Updated layer in ALL ${bulkGeneratedCertificates.length} certificates!`);
        } else if (selectedCertificateIndex !== null) {
          setBulkGeneratedCertificates(prevCerts => {
            const copy = [...prevCerts];
            copy[selectedCertificateIndex] = { ...copy[selectedCertificateIndex], elements: updateLayerInElements(copy[selectedCertificateIndex].elements) };
            return copy;
          });
          alert("✅ Updated this certificate only.");
        }
      } else {
        const newElements = updateLayerInElements(currentCertificate!.elements);
        updateTemplateState(newElements);
        alert("✅ Generation Complete!");
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      alert(`Failed to generate image: ${err.message}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // --- AI AUTOFIL LOGIC ---
  const applyAiAutofill = (
    elements: CertificateElement[],
    extractedData: AiExtractedContent,
    isBulkInstance: boolean
  ): CertificateElement[] => {

    console.log("Attempting to get AI data...");
    console.log("--- Starting AI Autofill Application ---");
    console.log("Extracted AI Data:", extractedData);
    console.log("Processing elements array with length:", elements.length);

    const newElements = elements.map(el => {

      let contentKey: any = null; // Use 'any' to handle the complex ContentMapValue type

      // Check if it's a Text or Signature element before checking maps
      if (el.type === 'text' || el.type === 'signature') {
        if (el.id in AI_TEXT_MAP) {
          contentKey = AI_TEXT_MAP[el.id];
        }
        else if (el.id in OLD_AI_ID_MAP) {
          contentKey = OLD_AI_ID_MAP[el.id];
        }
      }

      // --- Handle Mapped Content ---
      if ((el.type === 'text' || el.type === 'signature') && contentKey) {
        if (typeof contentKey === 'object' && 'signature' in contentKey) {
          const { index, signature } = contentKey;
          const sigData = extractedData.signatures[index];

          if (sigData) {
            const newContent = signature === 'name' ? sigData.name : sigData.title;
            return { ...el, content: newContent };
          } else {
            return { ...el, content: "" };
          }
        }
        else if (typeof contentKey === 'string') {
          if (isBulkInstance && (el.id === 'recipientName' || el.id === 'recName')) {
            return el;
          }
          const newContent = extractedData[contentKey as keyof AiExtractedContent];
          if (newContent) {
            return { ...el, content: newContent as string };
          }
        }
      }
      return el;
    });

    console.log("--- AI Autofill Application Complete ---");
    return newElements;
  };

  const handleAiAutofill = async (prompt: string) => {
    if (!currentCertificate) return;

    setIsAiAutofilling(true);
    try {
      const extractedData = await getAiExtractedContent(prompt);
      const updatedTemplateElements = applyAiAutofill(currentCertificate.elements, extractedData, false);
      
      // Update the template state first
      updateTemplateState(updatedTemplateElements);
      
      let updateCount = 1;

      // If we are in bulk mode, we update all instances
      if (isBulkMode) {
        setBulkGeneratedCertificates(prev => prev.map(cert => {
          const certElements = applyAiAutofill(cert.elements, extractedData, true);
          return { ...cert, elements: certElements };
        }));

        updateCount = bulkGeneratedCertificates.length + 1; // Template + Bulk
        alert(`✅ Successfully autofilled ALL ${updateCount} certificates (Template and Bulk instances)!`);
      } else {
        alert("✅ Autofill complete!");
      }

    } catch (err: any) {
      console.error("AI Autofill ERROR - API or Extraction Failed:", err);
      alert(`Failed to autofill text fields. Check console for details. (Is the AI server running?)`);
    } finally {
      setIsAiAutofilling(false);
    }
  };
  
  const handleGenerateQrCodes = async () => {
    if (!currentCertificate || !currentCertificate.id || currentCertificate.id.startsWith("imported_") || currentCertificate.id.startsWith("cert_")) {
      alert("Please save the certificate template first to generate a QR code.");
      return;
    }
    
    setIsGeneratingQr(true);
    try {
      const templateId = currentCertificate.id;
      const qrSize = 60; 
      const bottomPadding = 85; 

      let certificatesToUpdate: GeneratedCertificate[];
      let updateMessage: string;
      const isCurrentlyBulkMode = bulkGeneratedCertificates.length > 0;
      
      if (isCurrentlyBulkMode) {
        certificatesToUpdate = [...bulkGeneratedCertificates];
        updateMessage = `✅ Successfully generated and placed ${certificatesToUpdate.length} unique QR codes!`;
      } else {
        certificatesToUpdate = [{ id: currentCertificate.id, name: currentCertificate.name, elements: currentCertificate.elements }];
        updateMessage = `✅ Successfully generated and placed QR code on the template!`;
      }

      let elementIdCounter = 1;

      for (let i = 0; i < certificatesToUpdate.length; i++) {
        const cert = certificatesToUpdate[i];
        
        let uniqueDataUrl: string;
        if (isCurrentlyBulkMode) {
          uniqueDataUrl = `${window.location.origin}/verify/certificate/${templateId}?instanceId=${cert.id}`;
        } else {
          uniqueDataUrl = `${window.location.origin}/verify/certificate/${templateId}?instanceId=template-preview`;
        }
        
        const qrCodeDataUrl = await generateQrCodeImage(uniqueDataUrl);
        
        const newQrElement: CertificateElement = {
          id: `qr-code-${cert.id}-${uuidv4()}`, 
          type: "qrCode",
          x: (currentCertificate.width / 2) - (qrSize / 2), 
          y: currentCertificate.height - qrSize - bottomPadding, 
          width: qrSize, 
          height: qrSize, 
          zIndex: 1000 + elementIdCounter++, 
          imageUrl: qrCodeDataUrl,
          content: uniqueDataUrl, 
          draggable: true,
          selectable: true,
        };
        
        cert.elements = cert.elements.filter(el => el.type !== 'qrCode');
        cert.elements.push(newQrElement);
      }
      
      if (isCurrentlyBulkMode) {
        setBulkGeneratedCertificates(certificatesToUpdate);
      } else {
        updateTemplateState(certificatesToUpdate[0].elements);
      }
      alert(updateMessage);
    } catch (err: any) {
      console.error("QR Code Generation Error:", err);
      alert(`Failed to generate QR Codes: ${err.message}`);
    } finally {
      setIsGeneratingQr(false);
    }
  };


  const captureThumbnail = async (userId: string): Promise<string | null> => {
    try {
      const element = document.getElementById("certificate-render-target-template");
      if (!element) return null;

      const canvas = await html2canvas(element, { useCORS: true, scale: 2, backgroundColor: "#ffffff" });

      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { resolve(null); return; }
          const fileName = `${userId}/${Date.now()}_thumb.png`;
          const { error } = await supabase.storage.from('thumbnails').upload(fileName, blob, { contentType: 'image/png', upsert: true });
          if (error) { resolve(null); return; }
          const { data } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
          resolve(data.publicUrl);
        }, 'image/png', 0.8);
      });
    } catch (e) {
      console.error("Error capturing thumbnail:", e);
      return null;
    }
  };

  const handleSaveTemplate = async () => {
    if (!currentCertificate) return;
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("You must be logged in to save."); setIsSaving(false); return; }

      let thumbnailUrl = inheritedThumbnail;
      if (!thumbnailUrl) thumbnailUrl = await captureThumbnail(user.id);

      const payload: any = {
        user_id: user.id,
        title: currentCertificate.name,
        elements: currentCertificate.elements,
        width: currentCertificate.width,
        height: currentCertificate.height,
        size: currentCertificate.size || 'custom',
        updated_at: new Date().toISOString(),
        ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
        uploads: uploadedImages 
      };

      let result;
      if (currentCertificate.id.startsWith("imported_") || currentCertificate.id.startsWith("cert_")) {
        result = await supabase.from("certificates").insert([payload]).select().single();
      } else {
        result = await supabase.from("certificates").update(payload).eq("id", currentCertificate.id).select().single();
      }

      if (result.error) throw result.error;

      if (result.data) {
        setCurrentCertificate({ ...currentCertificate, id: result.data.id, uploads: uploadedImages } as any);
      }
      alert("Certificate saved successfully!");
    } catch (err: any) {
      console.error("Error saving:", err);
      alert(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBulkCertificates = async () => {
    if (!currentCertificate || bulkGeneratedCertificates.length === 0) return;
    if (!window.confirm(`Save ${bulkGeneratedCertificates.length} certificates?`)) return;
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("You must be logged in to save."); setIsSaving(false); return; }

      let targetId = currentCertificate.id;
      let thumbnailUrl = inheritedThumbnail;
      if (!thumbnailUrl) thumbnailUrl = await captureThumbnail(user.id);

      if (targetId.startsWith("imported_") || targetId.startsWith("cert_")) {
        const payload: any = {
          user_id: user.id,
          title: currentCertificate.name,
          elements: currentCertificate.elements,
          width: currentCertificate.width,
          height: currentCertificate.height,
          size: currentCertificate.size || 'custom',
          updated_at: new Date().toISOString(),
          ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
          uploads: uploadedImages 
        };
        const { data: newCert, error: insertError } = await supabase.from("certificates").insert([payload]).select().single();
        if (insertError) throw insertError;
        targetId = newCert.id;
        setCurrentCertificate({ ...currentCertificate, id: targetId });
      }

      const { error } = await supabase.from("certificates").update({
        generated_instances: bulkGeneratedCertificates,
        updated_at: new Date().toISOString(),
        ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
        uploads: uploadedImages
      }).eq("id", targetId);

      if (error) throw error;
      setCurrentCertificate((prev) => prev ? ({ ...prev, id: targetId, generated_instances: bulkGeneratedCertificates }) : null);
      alert(`Successfully saved ${bulkGeneratedCertificates.length} certificates!`);
    } catch (err: any) {
      console.error("Error saving bulk:", err);
      alert(`Failed to save bulk: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevertToTemplate = () => {
    if (bulkGeneratedCertificates.length > 0) {
      if (window.confirm("Exit bulk view? Unsaved changes will be lost.")) {
        setBulkGeneratedCertificates([]);
        setSelectedCertificateIndex(null);
        setSelectedElement(null);
      }
    }
  };

  const handleProcessDownload = async (formatStr: string, options: any) => {
    setShowDownloadModal(false);
    let exportFormat: ExportFormat = 'pdf';
    if (formatStr === 'png') exportFormat = 'png';
    if (formatStr === 'jpg') exportFormat = 'jpg';
    await handleDownload(exportFormat);
  };

  const handleDownload = async (format: ExportFormat) => {
    if (!currentCertificate) return;
    if (bulkGeneratedCertificates.length > 0) {
      alert("Please revert to single template view to download.");
      return;
    }
    const element = document.getElementById("certificate-render-target-template");
    if (!element) {
      alert("Could not find certificate element.");
      return;
    }
    const fileName = `${currentCertificate.name || "certificate"}`;

    try {
      if (format === 'jpg' || format === 'png' || format === 'pdf') {
        const canvas = await html2canvas(element, { useCORS: true, scale: 2, backgroundColor: currentCertificate.backgroundColor || "#ffffff" });

        if (format === 'pdf') {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const imgWidth = currentCertificate.width;
          const imgHeight = currentCertificate.height;
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
          link.download = `${fileName}.${format}`;
          link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png');
          link.click();
        }
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert(`Failed to download.`);
    }
  };

  const handleFacebookShare = () => {
    if (!currentCertificate?.id || currentCertificate.id.startsWith("imported_") || currentCertificate.id.startsWith("cert_")) {
      alert("Please save the certificate first.");
      return;
    }
    const origin = window.location.origin;
    const shareUrl = `${origin}/view/certificate/${currentCertificate.id}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  // 🟢🟢🟢 UPDATED: AUTO BULK FUNCTIONALITY WITH NAME VALIDATION 🟢🟢🟢
  const handleAutoBulkUpload = async (file: File) => {
    if (!currentCertificate || isBulkProcessing) {
      alert("Please ensure a template is loaded.");
      return;
    }
    const placeholderElement = currentCertificate.elements.find(
      el => (el.zIndex === 12 && el.type === "text") || (el.content?.includes("Name") || el.content?.includes("Recipient"))
    );
    if (!placeholderElement) {
      alert(`❌ Error: Could not detect a 'Name' field.`);
      return;
    }
    setIsBulkProcessing(true);
    setBulkGeneratedCertificates([]);
    setSelectedCertificateIndex(null);
    setSelectedElement(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // 🟢 VALIDATION: Filter AND Format Names to Title Case
      const names = json.slice(1)
        .map(row => row[0])
        .filter(name => typeof name === 'string' && name.trim() !== '')
        .map(name => {
           // CONVERT TO TITLE CASE (e.g. "LYKA MAE" -> "Lyka Mae")
           return name.toLowerCase().replace(/(?:^|\s)\w/g, (match: string) => match.toUpperCase());
        });

      if (names.length === 0) { alert("No names found."); setIsBulkProcessing(false); return; }

      const templateElements = currentCertificate.elements.filter(el => el.id !== placeholderElement.id);
      const newCertificates: GeneratedCertificate[] = names.map((name, index) => {
        const newElements: CertificateElement[] = JSON.parse(JSON.stringify(templateElements));
        const newNameElement: CertificateElement = {
          ...placeholderElement,
          id: `bulk-name-${index}-${Date.now()}`,
          content: name,
          zIndex: placeholderElement.zIndex
        };
        return { 
          id: uuidv4(), 
          name: name, 
          elements: [...newElements, newNameElement] 
        };
      });
      setBulkGeneratedCertificates(newCertificates);
      alert(`Generated ${newCertificates.length} certificates.`);
    } catch (error) {
      console.error("Bulk upload failed:", error);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handlePlaceTextAt = (pos: { x: number; y: number }) => {
    if (!currentCertificate) { setIsAddingText(false); return; }
    const id = uuidv4();
    const newText: CertificateElement = {
      id, type: "text", x: Math.round(pos.x), y: Math.round(pos.y),
      content: "New Text", fontSize: 24, fontFamily: "Arial", fontWeight: "normal", fontStyle: "normal",
      textDecoration: "none", textAlign: "left", textTransform: "none", lineHeight: 1.2, color: "#000000",
      width: 200, height: 50, rotation: 0, draggable: true, zIndex: 100,
    };
    if (selectedCertificateIndex !== null && bulkGeneratedCertificates.length > 0) {
      setBulkGeneratedCertificates(prev => {
        const newCerts = [...prev];
        newCerts[selectedCertificateIndex].elements.push(newText);
        return newCerts;
      });
    } else {
      updateTemplateState([...currentCertificate.elements, newText]);
    }
    setSelectedElement(id);
    setIsAddingText(false);
  };

  const handleAddText = (options: { text: string; fontSize: number; fontWeight: string; color: string }) => {
    if (!currentCertificate) return;
    
    const canvasWidth = currentCertificate.width;
    const canvasHeight = currentCertificate.height;
    const estimatedWidth = 300; 
    
    const centerX = (canvasWidth / 2) - (estimatedWidth / 2);
    const centerY = (canvasHeight / 2) - (options.fontSize / 2);

    const id = uuidv4();
    const newTextElement: CertificateElement = {
        id,
        type: 'text',
        content: options.text,
        x: centerX,
        y: centerY,
        width: estimatedWidth,
        height: 50,
        fontSize: options.fontSize,
        fontFamily: 'Inter',
        fontWeight: options.fontWeight,
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: 'center',
        textTransform: "none",
        lineHeight: 1.2,
        color: options.color,
        fill: options.color, 
        align: 'center',
        rotation: 0,
        zIndex: 100,
        draggable: true,
        selectable: true,
    };

    if (selectedCertificateIndex !== null && bulkGeneratedCertificates.length > 0) {
        setBulkGeneratedCertificates(prev => {
            const newCerts = [...prev];
            newCerts[selectedCertificateIndex].elements.push(newTextElement);
            return newCerts;
        });
    } else {
        updateTemplateState([...currentCertificate.elements, newTextElement]);
    }
    setSelectedElement(id);
  };

  // Upload to Global Library
  const handleUploadToLibrary = async (file: File) => {
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("You must be logged in to upload images.");
        return;
    }

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images') 
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        // Insert into Global Table
        await supabase
          .from('user_uploads')
          .insert({
            user_id: user.id,
            file_url: publicUrl
          });

        const newUploads = [publicUrl, ...uploadedImages];
        setUploadedImages(newUploads);

    } catch (error: any) {
        console.error("Upload error:", error);
        alert("Failed to upload image: " + error.message);
    }
  };

  const handleAddImageFromLibrary = (url: string) => {
    if (!currentCertificate) return;

    const img = new Image();
    img.src = url;
    
    img.onload = () => {
        const aspectRatio = img.width / img.height;
        const initialWidth = 300;
        const initialHeight = 300 / aspectRatio;
        
        const centerX = (currentCertificate.width / 2) - (initialWidth / 2);
        const centerY = (currentCertificate.height / 2) - (initialHeight / 2);

        const id = uuidv4();
        const newImageElement: CertificateElement = {
            id,
            type: 'image',
            imageUrl: url,
            content: url,
            x: centerX,
            y: centerY,
            width: initialWidth,
            height: initialHeight,
            rotation: 0,
            opacity: 1,
            zIndex: 50,
            draggable: true,
            selectable: true,
            style: { objectFit: 'contain' }
        };

        if (selectedCertificateIndex !== null && bulkGeneratedCertificates.length > 0) {
            setBulkGeneratedCertificates(prev => {
                const newCerts = [...prev];
                newCerts[selectedCertificateIndex].elements.push(newImageElement);
                return newCerts;
            });
        } else {
             updateTemplateState([...currentCertificate.elements, newImageElement]);
        }
        setSelectedElement(id);
    };
  };

  const getActiveElement = (): CertificateElement | undefined => {
    if (!selectedElement) return undefined;
    if (selectedCertificateIndex !== null && bulkGeneratedCertificates.length > 0) {
      return bulkGeneratedCertificates[selectedCertificateIndex].elements.find(el => el.id === selectedElement);
    }
    return currentCertificate?.elements.find(el => el.id === selectedElement);
  };

  const activeElementObj = getActiveElement();
  const isBulkMode = bulkGeneratedCertificates.length > 0;
  const certificatesToRender = isBulkMode 
    ? bulkGeneratedCertificates 
    : [{ id: currentCertificate?.id || 'template', name: currentCertificate?.name || "Template", elements: currentCertificate?.elements || [] }];

  if (!currentCertificate) return <div className="text-white p-10">Loading certificate...</div>;
  const scale = zoom / 100;

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col relative">

      <EditorTopBar
        selectedElement={selectedElement}
        activeStyles={activeElementObj as any}
        onTextStyleChange={handleTextStyleChange}
        onDeleteElement={handleDeleteElement}
        onSave={isBulkMode ? handleSaveBulkCertificates : handleSaveTemplate}
        isBulkMode={isBulkMode}

        onOpenDownload={() => setShowDownloadModal(true)}
        onOpenShare={() => setShowShareModal(true)}
        onShareFacebook={handleFacebookShare}

        onRevert={handleRevertToTemplate}
        isSaving={isSaving || isBulkProcessing}
        onUndo={handleUndo}
        // 🟢🟢🟢 PASSING REDO HANDLER 🟢🟢🟢
        onRedo={handleRedo}
      />

      {isBulkProcessing && ( <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[50] text-white text-xl font-bold">Processing...</div> )}

      <div
        id="certificate-container"
        className="flex-1 overflow-auto bg-slate-900 flex flex-col items-center p-10 transition-all duration-300"
        style={{ marginRight: `${rightSidebarWidth}px`, scrollbarWidth: 'none' }}
      >
        {certificatesToRender.map((cert, index) => {
          const effectiveIndex = isBulkMode ? index : null;
          const renderId = isBulkMode ? `certificate-render-target-${index}` : `certificate-render-target-template`;
          return (
            <React.Fragment key={cert.id}> 
              {isBulkMode && ( <h2 className="text-xl font-semibold text-slate-300 my-4 pt-10">#{index + 1}: {cert.name} (ID: {cert.id.substring(0, 8)}...)</h2> )}
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top center", marginBottom: '40px', boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}>
                <div id={renderId} className="bg-white">
                  <KonvaCanvas
                    width={currentCertificate.width}
                    height={currentCertificate.height}
                    elements={cert.elements}
                    onElementSelect={(id) => handleElementSelect(effectiveIndex, id)}
                    onElementUpdate={handleRealtimeUpdate(effectiveIndex)}
                    onElementFinalUpdate={handleFinalUpdate(effectiveIndex)}
                    onImagesLoaded={() => index === 0 && setLoadingImages(false)}
                    isEditable={true}
                    isAddingText={isAddingText}
                    onPlaceAt={handlePlaceTextAt}
                    onCancelAddMode={() => setIsAddingText(false)}
                  />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <EditorBottomBar zoom={zoom} setZoom={setZoom} />
      <EditorDropdownSidebar
        onWidthChange={setRightSidebarWidth}
        onAutoBulkUpload={handleAutoBulkUpload}
        selectedElement={activeElementObj}
        onAiGenerate={handleAiGenerate}
        onAiAutofill={handleAiAutofill}
        isGenerating={isAiGenerating}
        isAutofilling={isAiAutofilling}
        isBulkMode={isBulkMode}
        bulkCount={bulkGeneratedCertificates.length}
        onGenerateQrCodes={handleGenerateQrCodes} 
        isGeneratingQr={isGeneratingQr}
        onAddText={handleAddText}
        onUploadImage={handleUploadToLibrary}
        onAddImageToCanvas={handleAddImageFromLibrary}
        uploadedImages={uploadedImages}
      />

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={handleProcessDownload}
        isDownloading={false}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentId={currentCertificate?.id || ''}
        certificateTitle={currentCertificate?.name || ''}
      />
    </div>
  );
};

export default CertificateEditor;