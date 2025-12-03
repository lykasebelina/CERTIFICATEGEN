import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Stage, Layer, Rect, Line, Group, Text, Transformer } from "react-konva";
import { URLImage } from "../../components/CanvasHelpers";
import { 
 Undo, Redo, Upload, Plus, Trash2, 
 Maximize, ZoomIn, ZoomOut, Type, 
  LayoutTemplate, Image as LucideImage, Loader2, Save, X
} from "lucide-react";

// --- IMPORTS FOR SAVING ---
import { supabase } from "../../lib/supabaseClient";
import { saveTemplateToDatabase } from "../../utils/templateSaver";

// IMPORT SETTINGS PANEL
import TextSettingsPanel from "../../components/TextSettingsPanel";

// --- TYPES ---
interface TemplateElement {
  id: string;
  type: "background" | "innerFrame" | "border" | "corner" | "watermark" | "logo" | "text" | "customImage"; 
  src?: string;    
  color?: string;  
  
  // Text Properties
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;        
  textDecoration?: string; 
  textTransform?: string;  
  align?: string;
  lineHeight?: number;        
  letterSpacing?: number;  
  zIndex?: number;

  // Border Properties
  borderType?: "solid" | "dashed" | "dotted" | "double" | "none";
  borderColor?: string;
  borderThickness?: number;
  borderPadding?: number;
  
  // CSS Corner Properties
  isCss?: boolean; 
  
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity?: number;
}

interface CanvasState {
  background: TemplateElement | null;
  innerFrame: TemplateElement | null;
  border: TemplateElement | null;
  cornerFrames: TemplateElement | null;
  watermark: TemplateElement | null;
  logos: TemplateElement[];
  customImages: TemplateElement[]; 
  textFields: TemplateElement[]; 
}

const INITIAL_STATE: CanvasState = {
  background: null,
  innerFrame: null,
  border: null,
  cornerFrames: null,
  watermark: null,
  logos: [],
  customImages: [], 
  textFields: [], 
};

export default function CustomTemplateEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🟢 1. EXTRACT DATA FROM LOCATION (Load Existing)
  const { 
      width = 842, 
      height = 595, 
      initialState, 
      templateId: initialTemplateId,
      templateName: initialTemplateName 
  } = location.state || {};

  // --- REFS ---
  const stageRef = useRef<any>(null); 
  const layerRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  // --- ZOOM STATE ---
  const [scale, setScale] = useState(0.7);
  // --- TAB STATE (Design vs Text) ---
  const [activeTab, setActiveTab] = useState<"design" | "text">("design");

  // --- HISTORY STATE MANAGEMENT ---
  const [history, setHistory] = useState<CanvasState[]>([
    initialState || INITIAL_STATE
  ]);
  const [historyStep, setHistoryStep] = useState(0);
  
  // --- SELECTION STATE ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // --- TEXT EDITING STATE ---
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- SAVING STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState(initialTemplateName || "Untitled Design");

  const isPlaceholderId = initialTemplateId && (initialTemplateId.includes('imported') || initialTemplateId.includes('_'));

  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    isPlaceholderId ? null : initialTemplateId || null
  );
  
  // Guide Lines State
  const [guides, setGuides] = useState<Array<{ x?: number; y?: number; orientation: 'V' | 'H' }>>([]);

  const lastColorChangeTime = useRef<number>(0);
  const lastTextChangeTime = useRef<number>(0); 
  const isTypingRef = useRef<boolean>(false);    

  const currentState = history[historyStep];
  const primarySelectedId = selectedIds.length > 0 ? selectedIds[selectedIds.length - 1] : null;

  // --- TRANSFORMER EFFECT ---
  useEffect(() => {
    if (trRef.current && layerRef.current) {
      const nodes = selectedIds.map(id => layerRef.current.findOne('#' + id)).filter(Boolean);
      trRef.current.nodes(nodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, currentState]);

  const pushToHistory = (newState: CanvasState, replace = false) => {
    const newHistory = history.slice(0, historyStep + 1);
    
    if (replace && newHistory.length > 0) {
        newHistory[newHistory.length - 1] = newState;
    } else {
        newHistory.push(newState);
    }
    
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // --- ACTIONS ---

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3)); 
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5)); 

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setSelectedIds([]);
      setEditingId(null);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setSelectedIds([]);
      setEditingId(null);
    }
  };

  // 🟢 3. EXECUTE SAVE (Called by Modal Buttons)
  const executeSave = async (mode: 'create' | 'update') => {
    if (!templateName.trim()) {
        alert("Please enter a template name");
        return;
    }

    setIsSaving(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("You must be logged in to save.");
            setIsSaving(false);
            return;
        }
        
        let thumbnailUrl: string | undefined;
        if (stageRef.current) {
            thumbnailUrl = stageRef.current.toDataURL({
                mimeType: "image/png",
                quality: 1,
                pixelRatio: 3 
            });
        }

        const savedRecord = await saveTemplateToDatabase(
            currentState,
            user.id,
            width,
            height,
            templateName,
            mode,
            mode === 'update' && currentTemplateId ? currentTemplateId : undefined,
            thumbnailUrl
        );

        setCurrentTemplateId(savedRecord.id);
        setShowSaveModal(false);
        alert(`Template ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        
    } catch (error: any) {
        console.error("Save failed", error);
        alert(error.message || "Failed to save template.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleChange = (id: string, newAttrs: Partial<TemplateElement>, replace = false) => {
    const nextState = { ...currentState };
    const updateObj = (el: TemplateElement | null) => el?.id === id ? { ...el, ...newAttrs } as TemplateElement : el;

    if (nextState.background?.id === id) nextState.background = updateObj(nextState.background);
    else if (nextState.innerFrame?.id === id) nextState.innerFrame = updateObj(nextState.innerFrame);
    else if (nextState.border?.id === id) nextState.border = updateObj(nextState.border);
    else if (nextState.cornerFrames?.id === id) nextState.cornerFrames = updateObj(nextState.cornerFrames);
    else if (nextState.watermark?.id === id) nextState.watermark = updateObj(nextState.watermark);
    else {
      nextState.logos = nextState.logos.map(logo => logo.id === id ? { ...logo, ...newAttrs } as TemplateElement : logo);
      nextState.textFields = nextState.textFields.map(txt => txt.id === id ? { ...txt, ...newAttrs } as TemplateElement : txt);
      nextState.customImages = nextState.customImages.map(img => img.id === id ? { ...img, ...newAttrs } as TemplateElement : img);
    }
    pushToHistory(nextState, replace);
  };

  const handleBatchChange = (prop: string, value: any, isRapid = false) => {
      const idsToUpdate = selectedIds.length > 0 ? selectedIds : [];
      if(idsToUpdate.length === 0) return;

      const nextState = { ...currentState };

      const updateList = (list: TemplateElement[]) => {
          return list.map(item => {
              if (idsToUpdate.includes(item.id)) {
                  return { ...item, [prop]: value };
              }
              return item;
          });
      };

      nextState.textFields = updateList(nextState.textFields);
      
      if (nextState.cornerFrames && idsToUpdate.includes(nextState.cornerFrames.id)) {
          nextState.cornerFrames = { ...nextState.cornerFrames, [prop]: value };
      }

      pushToHistory(nextState, isRapid);
  };

  const handleTextStyleChange = (prop: string, value: any) => {
      if (!primarySelectedId) return;

      let isRapidChange = false;
      const rapidProps = ['color', 'fontSize', 'lineHeight', 'letterSpacing'];
      
      if (rapidProps.includes(prop)) {
          const now = Date.now();
          isRapidChange = (now - lastColorChangeTime.current) < 500;
          lastColorChangeTime.current = now;
      }

      handleBatchChange(prop, value, isRapidChange);
  };

  const recalculateSignatoryPositions = (fields: TemplateElement[]) => {
      const sigs = fields.filter(f => f.id.startsWith("signatory"));
      if (sigs.length === 0) return fields;

      const activeIndices = Array.from(new Set(sigs.map(s => s.id.split('_')[1]))).sort();
      const count = activeIndices.length;
      const isLandscape = width > height;
      
      const isSigName = (id: string) => id.startsWith('signatoryName_');
      
      const LETTER_HEIGHT_PX = 1056; 
      let ratio = height / LETTER_HEIGHT_PX;
      if (isLandscape) ratio = 1; 
      
      const BASE_Y_ROW1_PORTRAIT = 834;
      const BASE_Y_ROW2_PORTRAIT = 915; 
      
      let START_Y_ROW1, START_Y_ROW2, MARGIN;

      if (isLandscape) {
          START_Y_ROW1 = 580;
          START_Y_ROW2 = 670; 
          MARGIN = 150;
      } else {
          START_Y_ROW1 = BASE_Y_ROW1_PORTRAIT * ratio;
          START_Y_ROW2 = BASE_Y_ROW2_PORTRAIT * ratio; 
          MARGIN = width * 0.35; 
      }
      
      const getCenterX = (w: number) => (width - w) / 2;
      const getLeftX = (w: number) => MARGIN;
      const getRightX = (w: number) => width - w - MARGIN;

      return fields.map(field => {
          if (!field.id.startsWith("signatory")) return field;

          const parts = field.id.split('_');
          const isRole = parts[0] === 'signatoryRole'; 
          const idxStr = parts[1];
          const visualIndex = activeIndices.indexOf(idxStr); 

          let newX = field.x;
          let newY = field.y;
          const w = field.width;
          const isName = isSigName(field.id);
          const yOffset = isName ? 0 : 20;

          if (count === 1) {
              newX = getCenterX(w);
              newY = START_Y_ROW1 + yOffset;
          } 
          else if (count === 2) {
              if (visualIndex === 0) { // Sig 1
                  newX = getCenterX(w);
                  newY = START_Y_ROW1 + yOffset;
              } else { // Sig 2
                  newX = getCenterX(w);
                  newY = START_Y_ROW2 + yOffset;
              }
          } 
          else if (count === 3) {
              if (visualIndex === 0) { // Sig 1
                  newX = getLeftX(w);
                  newY = START_Y_ROW1 + yOffset;
              } else if (visualIndex === 1) { // Sig 2
                  newX = getRightX(w);
                  newY = START_Y_ROW1 + yOffset;
              } else { // Sig 3
                  newX = getCenterX(w);
                  newY = START_Y_ROW2 + yOffset;
              }
          } 
          else if (count === 4) {
              if (visualIndex === 0) { // Sig 1
                  newX = getLeftX(w);
                  newY = START_Y_ROW1 + yOffset;
              } else if (visualIndex === 1) { // Sig 2
                  newX = getRightX(w);
                  newY = START_Y_ROW1 + yOffset;
              } else if (visualIndex === 2) { // Sig 3
                  newX = getLeftX(w);
                  newY = START_Y_ROW2 + yOffset;
              } else { // Sig 4
                  newX = getRightX(w);
                  newY = START_Y_ROW2 + yOffset;
              }
          }

          return { ...field, x: newX, y: newY };
      });
  };

  const syncSignatureImages = (logos: TemplateElement[], textFields: TemplateElement[]) => {
      return logos.map(logo => {
          const match = logo.id.match(/^signature_img_(\d+)_/);
          if (match) {
              const index = match[1];
              const targetText = textFields.find(t => t.id === `signatoryName_${index}`);
              
              if (targetText) {
                  const newX = targetText.x + (targetText.width / 2) - (logo.width / 2);
                  const newY = targetText.y - logo.height + 10;
                  return { ...logo, x: newX, y: newY };
              }
          }
          return logo; 
      });
  };

  const handleDelete = (targetId?: string) => {
    const idsToDelete = targetId ? [targetId] : selectedIds;
    if (idsToDelete.length === 0) return;
    
    const nextState = { ...currentState };

    idsToDelete.forEach(id => {
        if (nextState.background?.id === id) nextState.background = null;
        if (nextState.innerFrame?.id === id) nextState.innerFrame = null;
        if (nextState.border?.id === id) nextState.border = null;
        if (nextState.cornerFrames?.id === id) nextState.cornerFrames = null;
        if (nextState.watermark?.id === id) nextState.watermark = null;
    });
    
    nextState.logos = nextState.logos.filter(l => !idsToDelete.includes(l.id));
    nextState.textFields = nextState.textFields.filter(t => !idsToDelete.includes(t.id));
    nextState.customImages = nextState.customImages.filter(i => !idsToDelete.includes(i.id));
    
    const sigDeleted = idsToDelete.some(id => id.startsWith("signatory"));
    if (sigDeleted) {
        nextState.textFields = recalculateSignatoryPositions(nextState.textFields);
        nextState.logos = syncSignatureImages(nextState.logos, nextState.textFields);
    }

    pushToHistory(nextState);
    
    if (!targetId) {
        setSelectedIds([]);
        setEditingId(null);
    } else {
        setSelectedIds(prev => prev.filter(pid => pid !== targetId));
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string, option: "fit" | "keep") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;

    img.onload = () => {
      let w = img.width;
      let h = img.height;
      let x = 0;
      let y = 0;

      if (type === "watermark" && option === "fit") {
          const MAX_DIMENSION = 600; 
          const scaleFactor = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height);
          w = img.width * scaleFactor;
          h = img.height * scaleFactor;
          x = (width - w) / 2;
          y = (height - h) / 2;
      }
      else if (type === "logo" || type === "customImage") {
          const TARGET_SIZE = 300; 
          const scaleFactor = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
          w = img.width * scaleFactor;
          h = img.height * scaleFactor;
          x = (width - w) / 2;
          y = (height - h) / 2;
      }
      else {
          if (option === "fit") { 
              w = width; 
              h = height; 
          }
          if (option === "keep") { 
              x = (width - w) / 2; 
              y = (height - h) / 2; 
          }
      }

      const MARGIN = 60; 

      // ⭐ DETERMINE Z-INDEX FOR UPLOADED ITEM
      let zIndex = 10; 
      if (type === 'background') zIndex = 1;
      if (type === 'border') zIndex = 2; // Matches Sidebar
      if (type === 'innerFrame') zIndex = 3; // Matches Sidebar
      if (type === 'corner') zIndex = 4;
      if (type === 'watermark') zIndex = 5;

      const newEl: TemplateElement = {
        id: `${type}-${Date.now()}`,
        type: type as any,
        src: url,
        x, y, width: w, height: h,
        rotation: 0,
        zIndex: zIndex // 👈 APPLY Z-INDEX
      };

      const nextState = { ...currentState };

      if (type === "background") nextState.background = newEl;
      else if (type === "innerFrame") {
        nextState.innerFrame = option === 'fit' 
            ? { ...newEl, x: MARGIN, y: MARGIN, width: width - (MARGIN * 2), height: height - (MARGIN * 2) } 
            : newEl;
      }
      else if (type === "border") {
          nextState.border = { ...newEl, borderType: undefined };
      }
      else if (type === "corner") nextState.cornerFrames = newEl;
      else if (type === "watermark") nextState.watermark = { ...newEl, opacity: 0.3 };
      else if (type === "logo") {
        nextState.logos = [...nextState.logos, newEl];
      }
      else if (type === "customImage") {
        nextState.customImages = [...nextState.customImages, newEl];
      }

      pushToHistory(nextState);
    };
    e.target.value = ""; 
  };

  const handleSignatureUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;

      img.onload = () => {
          const targetTextId = `signatoryName_${index}`;
          const targetText = currentState.textFields.find(t => t.id === targetTextId);

          const MAX_SIG_WIDTH = 120;
          const MAX_SIG_HEIGHT = 60; 

          let w = img.width;
          let h = img.height;

          const scale = Math.min(MAX_SIG_WIDTH / w, MAX_SIG_HEIGHT / h);
          w = w * scale;
          h = h * scale;

          let x = (width - w) / 2;
          let y = (height - h) / 2;

          if (targetText) {
              x = targetText.x + (targetText.width / 2) - (w / 2);
              y = targetText.y - h + 10;
          }

          const newSignature: TemplateElement = {
              id: `signature_img_${index}_${Date.now()}`,
              type: "logo", 
              src: url,
              x, y, width: w, height: h,
              rotation: 0
          };

          const nextState = { ...currentState };
          
          const signaturePrefix = `signature_img_${index}_`;
          const cleanLogos = nextState.logos.filter(l => !l.id.startsWith(signaturePrefix));

          nextState.logos = [...cleanLogos, newSignature];
          pushToHistory(nextState);
      };
      e.target.value = "";
  };

  const handleColor = (type: string, color: string) => {
    const now = Date.now();
    const isRapidChange = (now - lastColorChangeTime.current) < 500;
    lastColorChangeTime.current = now;

    let existingElement: TemplateElement | null = null;
    if (type === "background") existingElement = currentState.background;
    else if (type === "innerFrame") existingElement = currentState.innerFrame;
    else if (type === "corner" && currentState.cornerFrames?.isCss) existingElement = currentState.cornerFrames;

    const MARGIN = 60;
    const defaultX = type === 'innerFrame' ? MARGIN : 0;
    const defaultY = type === 'innerFrame' ? MARGIN : 0;
    const defaultWidth = type === 'innerFrame' ? width - (MARGIN * 2) : width;
    const defaultHeight = type === 'innerFrame' ? height - (MARGIN * 2) : height;

    const isCssCorner = type === "corner" && (existingElement?.isCss || false);

    // ⭐ DETERMINE Z-INDEX
    let zIndex = 1; // Default
    if (type === 'innerFrame') zIndex = 3; // Inner Frame is 3
    if (type === 'corner') zIndex = 4;

    const newEl: TemplateElement = {
      id: existingElement?.id || `${type}-${Date.now()}`,
      type: type as any,
      color: color,
      x: existingElement ? existingElement.x : defaultX,
      y: existingElement ? existingElement.y : defaultY,
      width: existingElement ? existingElement.width : defaultWidth,
      height: existingElement ? existingElement.height : defaultHeight,
      rotation: existingElement ? existingElement.rotation : 0,
      isCss: isCssCorner,
      zIndex: zIndex // 👈 APPLY Z-INDEX
    };

    const nextState = { ...currentState };
    if (type === "background") nextState.background = newEl;
    if (type === "innerFrame") nextState.innerFrame = newEl;
    if (type === "corner") nextState.cornerFrames = newEl;
    
    pushToHistory(nextState, isRapidChange);
  };

  const handleCssCorners = (option: 'create' | 'resize', value?: number) => {
      const nextState = { ...currentState };
      
      if (option === 'create') {
          const size = 300; 
          nextState.cornerFrames = {
              id: `corner-css-${Date.now()}`,
              type: 'corner',
              isCss: true,
              color: '#D4AF37', 
              width: size, height: size, 
              x: 0, y: 0, rotation: 0,
              zIndex: 4 // Explicitly set 4
          };
      } else if (option === 'resize' && nextState.cornerFrames && nextState.cornerFrames.isCss && value) {
          nextState.cornerFrames = {
              ...nextState.cornerFrames,
              width: value,
              height: value
          };
      }
      
      pushToHistory(nextState);
  };

  const handleTextToggle = (fieldDef: any | any[]) => {
      const nextState = { ...currentState };
      const defs = Array.isArray(fieldDef) ? fieldDef : [fieldDef];
      const isLandscape = width > height;

      defs.forEach(def => {
          const exists = nextState.textFields.find(t => t.id === def.id);

          if (exists) {
              nextState.textFields = nextState.textFields.filter(t => t.id !== def.id);
              setSelectedIds(prev => prev.filter(id => id !== def.id));
          } else {
              let calculatedWidth = 300; 
              if (def.widths) {
                  calculatedWidth = isLandscape ? def.widths.landscape : def.widths.portrait;
              } else if (def.width) {
                  calculatedWidth = def.width;
              }

              let baseDefaultY = 0;
              if (typeof def.defaultY === 'object') {
                  baseDefaultY = isLandscape ? def.defaultY.landscape : def.defaultY.portrait;
              } else {
                  baseDefaultY = def.defaultY || height / 2;
              }

              let calculatedY = baseDefaultY;
              
              if (!isLandscape && def.defaultY) {
                  const LETTER_HEIGHT_PX = 1056; 
                  if (Math.abs(height - LETTER_HEIGHT_PX) > 10) {
                      const scaleRatio = height / LETTER_HEIGHT_PX;
                      calculatedY = baseDefaultY * scaleRatio;
                  }
              }

              const newText: TemplateElement = {
                  id: def.id,
                  type: 'text',
                  textContent: def.text || def.label,
                  fontSize: def.fontSize || 20,
                  fontWeight: def.fontWeight || 'normal',
                  fontStyle: def.fontStyle || 'normal',
                  fontFamily: def.fontFamily || 'Arial',
                  textDecoration: '',
                  align: 'center',
                  lineHeight: def.lineHeight || 1.2, 
                  letterSpacing: def.letterSpacing || 0, 
                  zIndex: def.zIndex,
                  color: '#000000',
                  
                  x: (width - calculatedWidth) / 2, 
                  y: calculatedY,
                  
                  width: calculatedWidth, 
                  height: 50, 
                  rotation: 0,
                  opacity: 1
              };
              
              nextState.textFields = [...nextState.textFields, newText];
          }
      });
      
      nextState.textFields = recalculateSignatoryPositions(nextState.textFields);
      nextState.logos = syncSignatureImages(nextState.logos, nextState.textFields);

      pushToHistory(nextState);
  };

  const handleAddCustomText = () => {
    const nextState = { ...currentState };
    const id = `customText_${Date.now()}`;
    const newText: TemplateElement = {
        id: id, 
        type: 'text',
        textContent: "Double click to edit",
        fontSize: 24,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontFamily: 'Arial',
        textDecoration: '',
        align: 'center',
        lineHeight: 1.2,
        letterSpacing: 0,
        zIndex: 50, 
        color: '#000000',
        
        x: width / 2 - 150, 
        y: height / 2,        
        
        width: 300,
        height: 50,
        rotation: 0,
        opacity: 1
    };

    nextState.textFields = [...nextState.textFields, newText];
    pushToHistory(nextState);
    
    setSelectedIds([id]);
    setActiveTab('text');
  };

  const handlePanelTextChange = (id: string, newText: string) => {
      const nextState = { ...currentState };
      nextState.textFields = nextState.textFields.map(tf => 
          tf.id === id ? { ...tf, textContent: newText } : tf
      );

      let shouldReplace = true;

      if (editingId === id) {
          if (!isTypingRef.current) {
              shouldReplace = false;
              isTypingRef.current = true; 
          } else {
              shouldReplace = true;
          }
      } 
      else {
          const now = Date.now();
          shouldReplace = (now - lastTextChangeTime.current) < 500;
          lastTextChangeTime.current = now;
      }

      pushToHistory(nextState, shouldReplace);
  };

  const getCurrentTextValues = () => {
      const values: { [key: string]: string } = {};
      currentState.textFields.forEach(tf => {
          values[tf.id] = tf.textContent || "";
      });
      return values;
  };

  const getSelectedTextObject = () => {
      if(!primarySelectedId) return null;
      return currentState.textFields.find(t => t.id === primarySelectedId) || null;
  };

  const handleBorderSettings = (
      type: "solid" | "dashed" | "dotted" | "double" | "none", 
      color: string = "#000000", 
      thickness: number = 5, 
      padding: number = 40
  ) => {
      const newBorder: TemplateElement = {
          id: currentState.border?.id || `border-${Date.now()}`,
          type: "border",
          x: padding, y: padding,
          width: width - (padding * 2),
          height: height - (padding * 2),
          rotation: 0,
          borderType: type,
          borderColor: color,
          borderThickness: thickness,
          borderPadding: padding,
          zIndex: 2 // 👈 FORCE Z-INDEX 2
      };

      const now = Date.now();
      const isRapidChange = (now - lastColorChangeTime.current) < 500;
      lastColorChangeTime.current = now;

      const nextState = { ...currentState };
      nextState.border = newBorder;
      pushToHistory(nextState, isRapidChange);
  };

  const handleDragMove = (e: any) => {
    const node = e.target;
    setGuides([]);
    const SNAP_THRESHOLD = 10;
    const box = node.getClientRect({ relativeTo: node.getParent() });
    const absPos = node.position();
    let newX = absPos.x;
    let newY = absPos.y;
    const newGuides: Array<{ x?: number; y?: number; orientation: 'V' | 'H' }> = [];
    const verticalStops = [0, width / 2, width];
    
    const objectVerticalEdges = [
        { guide: Math.round(box.x), offset: absPos.x - box.x, edge: 'start' }, 
        { guide: Math.round(box.x + box.width / 2), offset: absPos.x - (box.x + box.width / 2), edge: 'center' }, 
        { guide: Math.round(box.x + box.width), offset: absPos.x - (box.x + box.width), edge: 'end' }, 
    ];

    let snappedX = false;
    verticalStops.forEach((stop) => {
        objectVerticalEdges.forEach((objEdge) => {
            if(Math.abs(objEdge.guide - stop) < SNAP_THRESHOLD) {
                if(!snappedX) {
                    newX = stop + objEdge.offset;
                    snappedX = true;
                    newGuides.push({ x: stop, orientation: 'V' });
                }
            }
        });
    });

    const horizontalStops = [0, height / 2, height];
    const objectHorizontalEdges = [
        { guide: Math.round(box.y), offset: absPos.y - box.y, edge: 'start' }, 
        { guide: Math.round(box.y + box.height / 2), offset: absPos.y - (box.y + box.height / 2), edge: 'center' }, 
        { guide: Math.round(box.y + box.height), offset: absPos.y - (box.y + box.height), edge: 'end' }, 
    ];

    let snappedY = false;
    horizontalStops.forEach((stop) => {
        objectHorizontalEdges.forEach((objEdge) => {
             if(Math.abs(objEdge.guide - stop) < SNAP_THRESHOLD) {
                if(!snappedY) {
                    newY = stop + objEdge.offset;
                    snappedY = true;
                    newGuides.push({ y: stop, orientation: 'H' });
                }
             }
        });
    });

    if(snappedX || snappedY) {
        node.position({ x: newX, y: newY });
    }
    setGuides(newGuides);
  };

  const handleDragEnd = (e: any, id: string) => {
      setGuides([]);
      
      if (selectedIds.includes(id) && selectedIds.length > 1) {
          const nextState = { ...currentState };
          const draggedNode = e.target;
          
          const oldItem = [
              ...currentState.textFields, 
              ...currentState.logos, 
              ...currentState.customImages
          ].find(i => i.id === id);
          
          if (!oldItem) return;
          
          const dx = draggedNode.x() - oldItem.x;
          const dy = draggedNode.y() - oldItem.y;

          const applyDelta = (list: TemplateElement[]) => {
              return list.map(item => {
                  if (selectedIds.includes(item.id)) {
                      return {
                          ...item,
                          x: item.x + dx,
                          y: item.y + dy
                      };
                  }
                  return item;
              });
          };

          nextState.textFields = applyDelta(nextState.textFields);
          nextState.logos = applyDelta(nextState.logos);
          nextState.customImages = applyDelta(nextState.customImages);
          
          pushToHistory(nextState);

      } else {
          handleChange(id, { x: e.target.x(), y: e.target.y() });
      }
  };


  const renderElement = (el: TemplateElement | null) => {
    if (!el) return null;
    const isSelected = selectedIds.includes(el.id);

    if (el.type === 'corner' && el.isCss) {
        const size = el.width; 
        const offset = size / 2; 
        const cornerProps = {
            width: size,
            height: size,
            fill: el.color,
            offsetX: offset,
            offsetY: offset,
            shadowColor: isSelected ? "#0096FF" : undefined,
            shadowBlur: isSelected ? 10 : 0,
        };

        return (
            <Group 
                id={el.id}
                onClick={(e) => {
                    const id = el.id;
                    if (e.evt.shiftKey) {
                        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                    } else {
                        setSelectedIds([id]);
                    }
                }}
                onTap={() => setSelectedIds([el.id])}
                draggable={false} 
            >
                <Rect x={0} y={0} rotation={45} {...cornerProps} />
                <Rect x={width} y={0} rotation={135} {...cornerProps} />
                <Rect x={0} y={height} rotation={315} {...cornerProps} />
                <Rect x={width} y={height} rotation={225} {...cornerProps} />
            </Group>
        );
    }

    const commonProps = {
      id: el.id,
      x: el.x, y: el.y, width: el.width, height: el.height, rotation: el.rotation, opacity: el.opacity ?? 1,
      draggable: true,
      onClick: (e: any) => {
        const id = el.id;
        if (e.evt.shiftKey) {
            setSelectedIds(prev => {
                if (prev.includes(id)) return prev.filter(i => i !== id);
                return [...prev, id];
            });
        } else {
            if (!selectedIds.includes(id)) {
                setSelectedIds([id]);
            } else if (selectedIds.length > 1) {
                 setSelectedIds([id]);
            }
        }
        
        if(el.type === 'text') setActiveTab('text');
      },
      onTap: () => setSelectedIds([el.id]),
      onDragStart: (e: any) => {
           if(!selectedIds.includes(el.id)) {
               setSelectedIds([el.id]);
           }
      },
      
      onTransform: (e: any) => {
          const node = e.target;
          
          if (el.type === 'innerFrame') {
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const isCorner = Math.abs(scaleX - 1) > 0.001 && Math.abs(scaleY - 1) > 0.001;

              let newWidth = Math.max(50, node.width() * scaleX);
              let newHeight = Math.max(50, node.height() * scaleY);
              const maxPadding = Math.min(width, height) / 2 - 25; 

              if (isCorner) {
                  let gap = (width - newWidth) / 2;
                  gap = Math.min(gap, maxPadding); 
                  newHeight = height - (gap * 2);
                  newWidth = width - (gap * 2);
                  node.scaleX(newWidth / node.width());
                  node.scaleY(newHeight / node.height());
                  node.x(gap);
                  node.y(gap);
              } 
              else {
                  if (Math.abs(scaleX - 1) > 0.001) {
                      const centerX = (width - newWidth) / 2;
                      node.scaleX(newWidth / node.width());
                      node.x(centerX);
                  }
                  if (Math.abs(scaleY - 1) > 0.001) {
                      const centerY = (height - newHeight) / 2;
                      node.scaleY(newHeight / node.height());
                      node.y(centerY);
                  }
              }
          } 
          else {
              handleDragMove(e);
          }
      },

      onTransformEnd: (e: any) => {
        setGuides([]);
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        let rotation = node.rotation();
        const snapTo = 45;
        const threshold = 5;
        const closestSnap = Math.round(rotation / snapTo) * snapTo;
        if (Math.abs(rotation - closestSnap) < threshold) {
            rotation = closestSnap;
            node.rotation(rotation);
        }

        node.scaleX(1); 
        node.scaleY(1);
        
        const finalWidth = Math.max(5, node.width() * scaleX);
        const finalHeight = Math.max(5, node.height() * scaleY);

        handleChange(el.id, {
          x: node.x(), 
          y: node.y(), 
          width: finalWidth,
          height: finalHeight,
          rotation: rotation, 
        });
      },
      
      onDragMove: handleDragMove,
      onDragEnd: (e: any) => handleDragEnd(e, el.id),
    };

    if (el.type === 'text') {
        const isEditing = editingId === el.id;
        
        let displayText = el.textContent || "";
        if (el.textTransform === 'uppercase') displayText = displayText.toUpperCase();
        else if (el.textTransform === 'lowercase') displayText = displayText.toLowerCase();
        else if (el.textTransform === 'capitalize') {
            displayText = displayText.replace(/\b\w/g, c => c.toUpperCase());
        }

        return (
            <Text
                {...commonProps}
                height="auto" 
                text={displayText}
                fontSize={el.fontSize}
                fontFamily={el.fontFamily || "Arial"}
                fontStyle={`${el.fontWeight || 'normal'} ${el.fontStyle || 'normal'}`} 
                textDecoration={el.textDecoration} 
                align={el.align}
                lineHeight={el.lineHeight || 1.2} 
                letterSpacing={el.letterSpacing || 0} 
                fill={el.color}
                stroke={isSelected ? "#0096FF" : null}
                strokeWidth={isSelected ? 1 : 0}
                onDblClick={() => {
                  setSelectedIds([el.id]);
                  setEditingId(el.id);
                  setActiveTab('text'); 
                  isTypingRef.current = false;
                }}
                onDblTap={() => {
                  setSelectedIds([el.id]);
                  setEditingId(el.id);
                  isTypingRef.current = false;
                }}
                opacity={isEditing ? 0 : (el.opacity ?? 1)}
            />
        );
    }

    if (el.borderType && el.borderType !== 'none') {
        const thickness = el.borderThickness || 5;
        const dashArray = el.borderType === 'dashed' ? [thickness * 3, thickness * 2] : 
                         el.borderType === 'dotted' ? [thickness, thickness * 2] : undefined;
        
        if (el.borderType === 'double') {
            const gap = thickness * 2;
            return (
                <Group {...commonProps}>
                    <Rect width={el.width} height={el.height} stroke={el.borderColor} strokeWidth={thickness} fillEnabled={false} />
                    <Rect x={gap} y={gap} width={el.width - (gap * 2)} height={el.height - (gap * 2)} stroke={el.borderColor} strokeWidth={thickness} fillEnabled={false} listening={false} />
                </Group>
            );
        }
        return (
            <Rect 
                {...commonProps} 
                stroke={el.borderColor} 
                strokeWidth={thickness} 
                dash={dashArray}
                fillEnabled={false} 
                shadowColor={isSelected ? "#0096FF" : undefined}
                shadowBlur={isSelected ? 10 : 0}
            />
        );
    }

    if (el.color) {
      return <Rect {...commonProps} fill={el.color} stroke={isSelected ? "#0096FF" : "transparent"} strokeWidth={isSelected ? 2 : 0} />;
    }
    if (el.src) {
      return <URLImage {...commonProps} src={el.src} isSelected={isSelected} />;
    }
    return null;
  };

  // --- KEYBOARD HANDLERS ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if((e.ctrlKey || e.metaKey) && e.key === 'z') {
              e.preventDefault();
              handleUndo();
          }
          if((e.ctrlKey || e.metaKey) && e.key === 'y') {
              e.preventDefault();
              handleRedo();
          }
          if(e.key === 'Delete' || e.key === 'Backspace') {
              if(selectedIds.length > 0 && !editingId) {
                  e.preventDefault();
                  handleDelete();
              }
          }
          if(editingId && e.key === 'Escape') {
            setEditingId(null);
          } else if (e.key === 'Escape') {
            setSelectedIds([]);
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
              if (!editingId) { 
                  e.preventDefault();
                  const allTextIds = currentState.textFields.map(t => t.id);
                  const allLogoIds = currentState.logos.map(l => l.id);
                  const allCustomIds = currentState.customImages.map(i => i.id);
                  setSelectedIds([...allTextIds, ...allLogoIds, ...allCustomIds]);
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStep, history, selectedIds, editingId]);

  const activeTextObj = editingId ? currentState.textFields.find(t => t.id === editingId) : null;

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      
      {/* 🟢 4. SAVE MODAL UI */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                <button 
                    onClick={() => setShowSaveModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                    <Save size={20} className="text-green-500"/> Save Template
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Template Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2.5 text-white focus:border-green-500 outline-none transition-colors"
                            placeholder="e.g. Corporate A4 Layout"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                    </div>

                    {isSaving && (
                        <div className="text-sm text-green-400 flex items-center gap-2 animate-pulse">
                            <Loader2 size={14} className="animate-spin"/> Saving your design...
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={() => executeSave('create')}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Save as New
                        </button>
                        
                        <button
                            onClick={() => executeSave('update')}
                            disabled={isSaving || !currentTemplateId}
                            className={`py-2 rounded font-medium border transition-colors ${
                                currentTemplateId 
                                ? "border-green-600 text-green-400 hover:bg-green-600/10" 
                                : "border-gray-600 text-gray-500 cursor-not-allowed"
                            }`}
                            title={!currentTemplateId ? "Save as new first" : "Overwrite existing template"}
                        >
                            Update Existing
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- LEFT PANEL: CANVAS PREVIEW --- */}
      <div className="flex-1 bg-gray-950 flex flex-col relative min-w-0">
        
        {/* Toolbar */}
        <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-6 justify-between z-10">
            <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded">
                    {width}px × {height}px
                </span>
                
                {/* ZOOM CONTROLS */}
                <div className="flex items-center bg-gray-900 rounded border border-gray-700 ml-4">
                   <button 
                        onClick={handleZoomOut}
                        className="p-2 text-gray-200 hover:bg-gray-700 border-r border-gray-700"
                        title="Zoom Out"
                   >
                        <ZoomOut size={16} />
                   </button>
                   <span className="px-3 text-xs text-gray-300 w-16 text-center select-none">
                        {Math.round(scale * 100)}%
                   </span>
                   <button 
                        onClick={handleZoomIn}
                        className="p-2 text-gray-200 hover:bg-gray-700 border-l border-gray-700"
                        title="Zoom In"
                   >
                        <ZoomIn size={16} />
                   </button>
                </div>

                <div className="flex items-center bg-gray-900 rounded border border-gray-700 ml-2">
                    <button 
                        onClick={handleUndo} 
                        disabled={historyStep === 0}
                        className={`p-2 border-r border-gray-700 ${historyStep === 0 ? 'text-gray-600' : 'text-gray-200 hover:bg-gray-700'}`}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo size={16} />
                    </button>
                    <button 
                        onClick={handleRedo} 
                        disabled={historyStep === history.length - 1}
                        className={`p-2 ${historyStep === history.length - 1 ? 'text-gray-600' : 'text-gray-200 hover:bg-gray-700'}`}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo size={16} />
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleDelete()} 
                        disabled={selectedIds.length === 0}
                        className={`p-2 rounded transition-colors ${selectedIds.length > 0 ? 'text-red-400 hover:bg-red-900/30' : 'text-gray-600 cursor-not-allowed'}`}
                        title="Delete Selected Element(s)"
                    >
                        <Trash2 size={18} />
                    </button>
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                    
                    {/* --- OPEN SAVE MODAL BUTTON --- */}
                    <button 
                        onClick={() => setShowSaveModal(true)}
                        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Save size={16} /> Save
                    </button>
            </div>
        </div>

        {/* Canvas Area */}
        <div 
            className="flex-1 overflow-auto flex justify-center items-start pt-12 px-12 pb-12 bg-gray-900"
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if(target.tagName === 'DIV' || target.className.includes('bg-gray-900')) {
                   setSelectedIds([]);
                   setEditingId(null);
                }
            }}
        >
            <div className="relative"> 
                <div className="shadow-2xl border border-gray-700 bg-white relative">
                    <Stage 
                        ref={stageRef} 
                        width={width * scale}    
                        height={height * scale} 
                        scaleX={scale}            
                        scaleY={scale}            
                        onMouseDown={(e) => {
                            const clickedOnEmpty = e.target === e.target.getStage();
                            if (clickedOnEmpty) {
                              setSelectedIds([]);
                              setEditingId(null);
                            }
                        }}
                    >
                        <Layer ref={layerRef}>
                            {/* 1. Background (Bottom) */}
                            {renderElement(currentState.background)}

                            {/* 2. Border (Now Second - Behind Inner Frame) */}
                            {renderElement(currentState.border)}   

                            {/* 3. Inner Frame (Now Third - On Top of Border) */}
                            {renderElement(currentState.innerFrame)}
                            
                            {renderElement(currentState.cornerFrames)}
                            {renderElement(currentState.watermark)}
                            
                            {currentState.logos.map((logo) => (
                                <React.Fragment key={logo.id}>
                                    {renderElement(logo)}
                                </React.Fragment>
                            ))}
                            
                            {currentState.customImages.map((img) => (
                                <React.Fragment key={img.id}>
                                    {renderElement(img)}
                                </React.Fragment>
                            ))}

                            {currentState.textFields
                                .slice()
                                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                                .map((text) => (
                                    <React.Fragment key={text.id}>
                                        {renderElement(text)}
                                    </React.Fragment>
                                ))}
                            
                            {guides.map((guide, i) => {
                                if (guide.orientation === 'V' && guide.x !== undefined) {
                                    return (
                                        <Line 
                                            key={i} 
                                            points={[guide.x, 0, guide.x, height]} 
                                            stroke="#00FFFF" 
                                            strokeWidth={1 / scale} 
                                            dash={[4, 4]} 
                                        />
                                    );
                                }
                                if (guide.orientation === 'H' && guide.y !== undefined) {
                                    return (
                                        <Line 
                                            key={i} 
                                            points={[0, guide.y, width, guide.y]} 
                                            stroke="#00FFFF" 
                                            strokeWidth={1 / scale} 
                                            dash={[4, 4]} 
                                        />
                                    );
                                }
                                return null;
                            })}

                            <Transformer 
                                ref={trRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    if (newBox.width < 5 || newBox.height < 5) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        </Layer>
                    </Stage>
                </div>

                {/* TEXT AREA OVERLAY FOR IN-CANVAS EDITING */}
                {activeTextObj && (
                  <textarea
                    autoFocus
                    value={activeTextObj.textContent}
                    ref={(node) => {
                        if (node) {
                            node.style.height = 'auto'; 
                            node.style.height = `${node.scrollHeight}px`; 
                            node.focus();
                        }
                    }}
                    onChange={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                        handlePanelTextChange(activeTextObj.id, e.target.value);
                    }}
                    onBlur={() => setEditingId(null)}
                    style={{
                      position: 'absolute',
                      top: activeTextObj.y * scale,
                      left: activeTextObj.x * scale,
                      width: activeTextObj.width * scale,
                      height: 'auto', 
                      fontSize: `${(activeTextObj.fontSize || 20) * scale}px`,
                      fontFamily: activeTextObj.fontFamily || 'Arial',
                      fontWeight: activeTextObj.fontWeight || 'normal',
                      fontStyle: activeTextObj.fontStyle || 'normal',
                      textDecoration: activeTextObj.textDecoration || 'none',
                      textTransform: (activeTextObj.textTransform as any) || 'none', 
                      textAlign: (activeTextObj.align as any) || 'center', 
                      color: activeTextObj.color,
                      lineHeight: activeTextObj.lineHeight || 1.2, 
                      letterSpacing: `${activeTextObj.letterSpacing || 0}px`, 
                      transform: `rotate(${activeTextObj.rotation}deg)`,
                      transformOrigin: 'top left',
                      background: 'transparent',
                      border: '1px dashed #0096FF', 
                      outline: 'none',
                      resize: 'none',
                      overflow: 'hidden',
                      zIndex: 100, 
                      padding: 0,
                      margin: 0,
                    }}
                  />
                )}
            </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: SETTINGS --- */}
      <div className="w-80 h-full bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden flex-shrink-0 z-20 shadow-xl">
        {/* FIXED HEADER */}
        <div className="p-4 font-bold border-b border-gray-700 flex items-center gap-2 flex-shrink-0 bg-gray-800 z-10">
          Template Setup
        </div>

        {/* FIXED TAB SWITCHER */}
        <div className="flex border-b border-gray-700 flex-shrink-0 bg-gray-800 z-10">
            <button 
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'design' 
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
            >
                <LayoutTemplate size={16} /> Design
            </button>
            <button 
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'text' 
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
            >
                <Type size={16} /> Text
            </button>
        </div>
        
        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 min-h-0 relative">
            {activeTab === 'design' ? (
                // Design Tab Content
                <div className="absolute inset-0 overflow-y-auto scrollbar-thin">
                    <Section title="Background" onUpload={(e: any, opt: any) => handleUpload(e, "background", opt)} onColor={(c: string) => handleColor("background", c)} />
                    <Section title="Inner Frame" onUpload={(e: any, opt: any) => handleUpload(e, "innerFrame", opt)} onColor={(c: string) => handleColor("innerFrame", c)} />
                    
                    {/* Border Section with CSS Options */}
                    <div className="p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <h3 className="font-semibold text-blue-400 text-sm mb-3">Border</h3>
                        
                        <div className="mb-4 space-y-4">
                            <div className="flex gap-2">
                                <select 
                                    className="bg-gray-900 text-xs text-white p-2 rounded border border-gray-600 flex-1"
                                    onChange={(e) => handleBorderSettings(
                                        e.target.value as any, 
                                        currentState.border?.borderColor, 
                                        currentState.border?.borderThickness,
                                        currentState.border?.borderPadding
                                    )}
                                >
                                    <option value="none">Select Style</option>
                                    <option value="solid">Solid Line</option>
                                    <option value="dashed">Dashed Line</option>
                                    <option value="dotted">Dotted Line</option>
                                    <option value="double">Double Line</option>
                                </select>
                                <input 
                                    type="color" 
                                    className="w-8 h-8 rounded border-none cursor-pointer"
                                    value={currentState.border?.borderColor || "#000000"}
                                    onChange={(e) => handleBorderSettings(
                                        currentState.border?.borderType || 'solid', 
                                        e.target.value, 
                                        currentState.border?.borderThickness,
                                        currentState.border?.borderPadding
                                    )}
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-16">Thickness:</span>
                                <input 
                                    type="range" min="1" max="20" 
                                    className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                    value={currentState.border?.borderThickness || 5}
                                    onChange={(e) => handleBorderSettings(
                                        currentState.border?.borderType || 'solid', 
                                        currentState.border?.borderColor, 
                                        parseInt(e.target.value),
                                        currentState.border?.borderPadding
                                    )}
                                />
                                <span className="text-xs text-gray-400 w-6">{currentState.border?.borderThickness || 5}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-16">Padding:</span>
                                <input 
                                    type="range" min="0" max="150" 
                                    className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                    value={currentState.border?.borderPadding || 40}
                                    onChange={(e) => handleBorderSettings(
                                        currentState.border?.borderType || 'solid', 
                                        currentState.border?.borderColor, 
                                        currentState.border?.borderThickness,
                                        parseInt(e.target.value)
                                    )}
                                />
                                <span className="text-xs text-gray-400 w-6">{currentState.border?.borderPadding || 40}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
                            <label className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-xs cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                                <Maximize size={12} className="text-gray-300"/> 
                                <span className="font-medium">Fit to Page</span>
                                <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "border", "fit")} />
                            </label>
                            <label className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-xs cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                                <Upload size={12} className="text-gray-300"/> 
                                <span className="font-medium">Original</span>
                                <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "border", "keep")} />
                            </label>
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-blue-400 text-sm">Corner Frames</h3>
                        </div>
                        
                        <div className="mb-4">
                            <button 
                                onClick={() => handleCssCorners('create')}
                                className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-xs font-medium flex items-center justify-center gap-2 mb-3"
                            >
                                Use CSS Corners
                            </button>

                            {currentState.cornerFrames?.isCss && (
                                <div className="space-y-3 p-3 bg-gray-900 rounded border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" 
                                            className="w-6 h-6 rounded cursor-pointer border-none"
                                            value={currentState.cornerFrames.color || "#D4AF37"}
                                            onChange={(e) => handleColor("corner", e.target.value)}
                                        />
                                        <span className="text-xs text-gray-400">Corner Color</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-8">Size:</span>
                                        <input 
                                            type="range" min="1" max="1000" 
                                            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                            value={currentState.cornerFrames.width}
                                            onChange={(e) => handleCssCorners('resize', parseInt(e.target.value))}
                                        />
                                        <span className="text-xs text-gray-400 w-8 text-right">{currentState.cornerFrames.width}px</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-gray-700 pt-3">
                            <label className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-xs cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                                <Maximize size={12} className="text-gray-300"/> 
                                <span className="font-medium">Fit to Page</span>
                                <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "corner", "fit")} />
                            </label>
                            <label className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-xs cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                                <Upload size={12} className="text-gray-300"/> 
                                <span className="font-medium">Original</span>
                                <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "corner", "keep")} />
                            </label>
                        </div>
                    </div>

                    <Section title="Watermark" onUpload={(e: any, opt: any) => handleUpload(e, "watermark", opt)} hideColor />
                    
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="font-semibold mb-3 text-blue-400 text-sm">Logos</h3>
                        <label className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-xs font-medium flex items-center justify-center gap-2 mb-0">
                        Add Logo
                            <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "logo", "keep")} />
                        </label>
                    </div>

                    {/* NEW SECTION: CUSTOM IMAGES */}
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="font-semibold mb-3 text-blue-400 text-sm">Custom Images</h3>
                        
                        {/* List of active custom images */}
                        <div className="space-y-2 mb-3">
                            {currentState.customImages.map((img, idx) => (
                                <div 
                                    key={img.id} 
                                    className={`flex items-center justify-between p-2 rounded border transition-colors ${
                                        selectedIds.includes(img.id) ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                                    }`}
                                >
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer flex-1" 
                                        onClick={(e) => {
                                            if (e.shiftKey) {
                                                setSelectedIds(prev => prev.includes(img.id) ? prev.filter(i => i !== img.id) : [...prev, img.id]);
                                            } else {
                                                setSelectedIds([img.id]);
                                            }
                                        }}
                                    >
                                        <LucideImage size={14} className="text-gray-400"/>
                                        <span className="text-sm text-gray-300">New Image {idx + 1}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); // Prevent selection
                                            handleDelete(img.id); 
                                        }} 
                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                        title="Delete"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <label className="flex items-center justify-center gap-2 bg-gray-900 border border-gray-600 p-2 rounded cursor-pointer hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all w-full text-xs font-medium text-gray-300 group">
                            <Plus size={16} className="text-gray-500 group-hover:text-white"/> Insert Custom Image
                            <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "customImage", "keep")} />
                        </label>
                    </div>
                </div>
            ) : (
                // Text Settings Panel
                <div className="absolute inset-0 overflow-hidden">
                    <TextSettingsPanel 
                        activeFieldIds={currentState.textFields.map(t => t.id)}
                        currentTexts={getCurrentTextValues()}
                        customFields={currentState.textFields.filter(t => t.id.startsWith("customText_"))}
                        onAddCustomText={handleAddCustomText}
                        selectedTextId={primarySelectedId} 
                        selectedTextStyle={getSelectedTextObject()} 
                        onToggle={handleTextToggle}
                        onTextChange={handlePanelTextChange}
                        onStyleChange={handleTextStyleChange} 
                        onSignatureUpload={handleSignatureUpload} 
                    />
                </div>
            )}
        </div>
      </div>

    </div>
  );
}

// --- SUB-COMPONENTS ---
const Section = ({ title, onUpload, onColor, hideColor }: any) => (
    <div className="p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
        <div className="flex justify-between items-center mb-2">
             <h3 className="font-semibold text-blue-400 text-sm">{title}</h3>
        </div>
        
        {!hideColor && (
            <div className="flex items-center gap-3 mb-3 bg-gray-900/50 p-2 rounded border border-gray-700/50">
                <div className="relative overflow-hidden w-8 h-8 rounded-full border border-gray-600 shadow-sm">
                    <input 
                        type="color" 
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 cursor-pointer border-none" 
                        onChange={(e) => onColor(e.target.value)} 
                    />
                </div>
                <span className="text-xs text-gray-400">Pick Color</span>
            </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
            <label className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-xs cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                <Maximize size={12} className="text-gray-300"/> 
                <span className="font-medium">Fit to Page</span>
                <input type="file" hidden accept="image/*" onChange={(e) => onUpload(e, "fit")} />
            </label>
            <label className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-xs cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                <Upload size={12} className="text-gray-300"/> 
                <span className="font-medium">Original</span>
                <input type="file" hidden accept="image/*" onChange={(e) => onUpload(e, "keep")} />
            </label>
        </div>
    </div>
);