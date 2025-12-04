import React from "react";
import { 
  Type, Square, Plus, Trash2, Edit3, 
  Bold, Italic, Underline, ArrowUpDown, MoveHorizontal, Upload, PlusCircle,
  AlignLeft, AlignCenter, AlignRight, AlignJustify 
} from "lucide-react";

// --- UPDATED DEFINITIONS WITH PORTRAIT & LANDSCAPE POSITIONS ---
export const TEXT_FIELD_DEFINITIONS = [
  // > HEADER SECTION
  { 
    id: "institution", label: "Institution Name", section: "Header", zIndex: 6, 
    defaultY: { portrait: 161, landscape: 83 },
    fontSize: 13, fontFamily: "Arial", fontWeight: "normal", text: "Polytechnic University of the Philippines",
    lineHeight: 1.2, letterSpacing: 0, 
    widths: { portrait: 630, landscape: 550 } 
  },
  { 
    id: "department", label: "Department", section: "Header", zIndex: 7, 
    defaultY: { portrait: 182, landscape: 104 },
    fontSize: 13, fontFamily: "Arial", fontWeight: "normal", text: "Office of the Executive Vice President",
    lineHeight: 1.2, letterSpacing: 0,
    widths: { portrait: 630, landscape: 550 } 
  },
  { 
    id: "location", label: "Location", section: "Header", zIndex: 8, 
    defaultY: { portrait: 202, landscape: 124 },
    fontSize: 13, fontFamily: "Arial", fontWeight: "normal", text: "Information and Communications Technology Office",
    lineHeight: 1.2, letterSpacing: 0,
    widths: { portrait: 630, landscape: 550 } 
  },

  // > CERTIFICATE MAIN CONTENT
  { 
    id: "introPhrase", label: "Intro Phrase", section: "Main Content", zIndex: 9, 
    defaultY: { portrait: 263, landscape: 175 },
    fontSize: 13, fontFamily: "Arial",  fontStyle: "italic", text: "This",
    lineHeight: 1.2, letterSpacing: 0,
    widths: { portrait: 630, landscape: 550 } 
  },
  { 
    id: "certTitle", label: "Certificate Title", section: "Main Content", zIndex: 10, 
    defaultY: { portrait: 285, landscape: 198 },
    fontSize: 50, fontFamily: "Times New Roman", fontWeight: "bold", text: "CERTIFICATE OF APPRECIATION",
    lineHeight: 1.2, letterSpacing: 0, 
    widths: { portrait: 630, landscape: 950 } 
  },
  { 
    id: "preRecipient", label: "Pre-Recipient Phrase", section: "Main Content", zIndex: 11, 
    defaultY: { portrait: 410, landscape: 260 },
    fontSize: 13, fontFamily: "Arial",  fontStyle: "italic", text: "is hereby given to",
    lineHeight: 1.2, letterSpacing: 0,
    widths: { portrait: 630, landscape: 650 } 
  },
  { 
    id: "recipientName", label: "Recipient Name", section: "Main Content", zIndex: 12, 
    defaultY: { portrait: 453, landscape: 285 },
    fontSize: 36, fontFamily: "Arial", fontWeight: "bold", text: "Title. JUAN DELA CRUZ",
    lineHeight: 1.2, letterSpacing: 0,
    widths: { portrait: 630, landscape: 850 } 
  },
  { 
    id: "recipientRole", label: "Recipient Role", section: "Main Content", zIndex: 18, 
    defaultY: { portrait: 506, landscape: 336 },
    fontSize: 16, fontFamily: "Arial", fontStyle: "italic", text: "Position or Office Held",
    lineHeight: 1.2, letterSpacing: 0,
    widths: { portrait: 630, landscape: 500 } 
  },
  { 
    id: "recipientAffiliation", label: "Recipient Affiliation", section: "Main Content", zIndex: 19, 
    defaultY: { portrait: 532, landscape: 362 },
    fontSize: 16, fontFamily: "Arial", fontStyle: "italic", text: "Organization / Affiliation / Company / Government Agency",
    lineHeight: 1.2, letterSpacing: 0,
    widths: { portrait: 630, landscape: 550 } 
  },

  // > AWARD CITATION SECTION
  { 
    id: "ackPhrase", label: "Acknowledgment", section: "Citation", zIndex: 13, 
    defaultY: { portrait: 575, landscape: 395 },
    fontSize: 13, fontFamily: "Arial", text: "in grateful acknowledgement of his / her engagement and insightful academic contribution as",
    lineHeight: 1.5, letterSpacing: 0,
    widths: { portrait: 630, landscape: 750 } 
  },
  { 
    id: "awardRole", label: "Award Role / Part.", section: "Citation", zIndex: 14, 
    defaultY: { portrait: 597, landscape: 417 },
    fontSize: 14, fontFamily: "Arial", fontWeight: "bold", text: "RESOURCE SPEAKER / KEYNOTE SPEAKER / PANEL MEMBER / GUEST LECTURER / JUDGE / PANELIST / ETC",
    lineHeight: 1.7, letterSpacing: 0,
    widths: { portrait: 630, landscape: 850 } 
  },
  { 
    id: "citationPara", label: "Main Paragraph", section: "Citation", zIndex: 15, 
    defaultY: { portrait: 665, landscape: 450 },
    fontSize: 13, fontFamily: "Arial", text: "imparting unparalleled knowledge and expertise on [SINGLE STATEMENT DESCRIPTION OF HIS / HER TOPIC OR AREA OF EXPERTISE OR ROLE IN THE ACTIVITY] during the [TYPE OF EVENT], with the theme / title “[TITLE OR THEME OF THE ACTIVITY]” held on [DATE] at [VENUE].",
    lineHeight: 1.5, letterSpacing: 0,
    widths: { portrait: 630, landscape: 750 } 
  },
  { 
    id: "issuanceLine", label: "Issuance Line", section: "Citation", zIndex: 16, 
    defaultY: { portrait: 752, landscape: 515 },
    fontSize: 13, fontFamily: "Arial", text: "Given this [DATE] at the [VENUE], Philippines.",
    lineHeight: 1.2, letterSpacing: 0,
    widths: { portrait: 630, landscape: 650 } 
  },

  // > SIGNATORIES BLOCK
  ...Array.from({ length: 4 }).flatMap((_, i) => {
      return [
        { 
          id: `signatoryName_${i}`, label: `Signatory Name`, section: "Signatories", zIndex: 17, 
          defaultY: { portrait: 834, landscape: 580 },
          fontSize: 13, fontFamily: "Arial", fontWeight: "bold", text: "HEAD OF OFFICE, TITLE / HONORIFIC",
          lineHeight: 1.2, letterSpacing: 0,
          widths: { portrait: 630, landscape: 300 } 
        },
        { 
          id: `signatoryRole_${i}`, label: `Signatory Role`, section: "Signatories", zIndex: 17, 
          defaultY: { portrait: 855, landscape: 600 },
          fontSize: 13, fontFamily: "Arial", text: "Position, Office",
          lineHeight: 1.2, letterSpacing: 0,
          widths: { portrait: 630, landscape: 300 } 
        },
      ];
  })
];

// Helper to group by section
const groupedFields = TEXT_FIELD_DEFINITIONS.reduce((acc: any, field) => {
  if (!acc[field.section]) acc[field.section] = [];
  acc[field.section].push(field);
  return acc;
}, {});

interface Props {
  activeFieldIds: string[];
  currentTexts: { [key: string]: string };
  customFields: any[]; // NEW: List of active custom fields
  selectedTextId: string | null;
  selectedTextStyle: any | null;
  onToggle: (fieldDef: any | any[]) => void;
  onAddCustomText: () => void; // NEW: Handler to add text
  onTextChange: (id: string, newText: string) => void;
  onStyleChange: (styleProp: string, value: any) => void;
  onSignatureUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TextSettingsPanel({ 
  activeFieldIds, 
  currentTexts,
  customFields,
  selectedTextId, 
  selectedTextStyle, 
  onToggle, 
  onAddCustomText,
  onTextChange, 
  onStyleChange,
  onSignatureUpload
}: Props) {
  
  // Custom Render for Standard Field
  const renderField = (field: any, isCustom = false) => {
      const isActive = activeFieldIds.includes(field.id);
      const isSelected = selectedTextId === field.id;
      const fieldValue = currentTexts[field.id] !== undefined ? currentTexts[field.id] : field.text;
      
      return (
        <div
          key={field.id}
          className={`rounded transition-all border mb-3 ${
            isSelected 
                ? "bg-blue-900/20 border-blue-500 ring-1 ring-blue-500/50" 
                : isActive 
                    ? "bg-gray-800/80 border-blue-600/50" 
                    : "bg-gray-800 border-transparent hover:bg-gray-750"
          }`}
        >
          {/* Toggle Header */}
          <div 
            onClick={() => onToggle(field)}
            className="flex items-center justify-between p-2 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Type size={14} className={isActive ? "text-blue-400" : "text-gray-500"} />
              <span className={`text-sm ${isActive ? "text-white font-medium" : "text-gray-400"}`}>
                {field.label}
              </span>
            </div>
            
            {/* For Custom fields, showing a Trash icon makes more sense than a checkbox */}
            {isCustom ? (
                <div className="text-gray-500 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={14} />
                </div>
            ) : (
                isActive ? (
                   <div className="bg-blue-600/20 p-1 rounded"><Edit3 size={14} className="text-blue-400" /></div>
                ) : (
                  <Square size={16} className="text-gray-600" />
                )
            )}
          </div>

          {/* Edit Input */}
          {isActive && (
            <div className="px-2 pb-2 pt-0">
                <input 
                    type="text"
                    value={fieldValue}
                    onChange={(e) => onTextChange(field.id, e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:border-blue-500 outline-none transition-colors"
                    placeholder={`Enter ${field.label}`}
                />
            </div>
          )}
        </div>
      );
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* TEXT FORMAT SETTINGS TOOLBAR */}
      <div className="p-4 bg-gray-800/50 border-b border-gray-700 space-y-3">
         <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Format</h3>
            
            {/* --- UPDATED COLOR PICKER (Only Active if Text Selected) --- */}
            <div 
                className={`relative group transition-all duration-200 ${
                    !selectedTextId ? 'opacity-30 cursor-not-allowed grayscale' : 'opacity-100'
                }`}
                title={!selectedTextId ? "Select a text field to change color" : "Change Text Color"}
            >
                <div 
                    className={`w-6 h-6 rounded border border-gray-500 overflow-hidden ${!selectedTextId ? 'pointer-events-none' : 'cursor-pointer shadow-sm'}`} 
                    style={{ backgroundColor: selectedTextStyle?.color || '#555555' }} 
                >
                    <input 
                        type="color" 
                        className="opacity-0 w-full h-full cursor-pointer"
                        value={selectedTextStyle?.color || '#ffffff'}
                        onChange={(e) => onStyleChange('color', e.target.value)}
                        disabled={!selectedTextId} 
                    />
                </div>
            </div>
         </div>

         {/* Font and Style Controls */}
         <div className={`space-y-3 transition-opacity duration-200 ${!selectedTextId ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
             
             {/* Row 1: Font Family & Size */}
             <div className="flex gap-2">
                 <select 
                    className="flex-1 bg-gray-950 text-xs text-white border border-gray-700 rounded px-2 py-1 outline-none w-24"
                    value={selectedTextStyle?.fontFamily || "Arial"}
                    onChange={(e) => onStyleChange('fontFamily', e.target.value)}
                 >
                     <option value="Arial">Arial</option>
                     <option value="Times New Roman">Times New Roman</option>
                     <option value="Courier New">Courier New</option>
                     <option value="Verdana">Verdana</option>
                     <option value="Georgia">Georgia</option>
                     <option value="Impact">Impact</option>
                 </select>
                 
                 <input 
                    type="number" 
                    title="Font Size"
                    className="w-12 bg-gray-950 text-xs text-white border border-gray-700 rounded px-1 py-1 outline-none text-center"
                    value={selectedTextStyle?.fontSize || 20}
                    onChange={(e) => onStyleChange('fontSize', parseInt(e.target.value))}
                    min={8} max={200}
                 />
             </div>
             
             {/* Row 2: Line Height & Letter Spacing */}
             <div className="flex gap-2">
                 <div className="flex-1 flex items-center bg-gray-950 border border-gray-700 rounded px-2 py-1" title="Line Spacing">
                    <ArrowUpDown size={12} className="text-gray-500 mr-2"/>
                    <input 
                        type="number" 
                        step="0.1"
                        className="w-full bg-transparent text-xs text-white outline-none"
                        value={selectedTextStyle?.lineHeight || 1.2}
                        onChange={(e) => onStyleChange('lineHeight', parseFloat(e.target.value))}
                        min={0.5} max={3.0}
                    />
                 </div>

                 <div className="flex-1 flex items-center bg-gray-950 border border-gray-700 rounded px-2 py-1" title="Letter Spacing">
                    <MoveHorizontal size={12} className="text-gray-500 mr-2"/>
                    <input 
                        type="number" 
                        step="1"
                        className="w-full bg-transparent text-xs text-white outline-none"
                        value={selectedTextStyle?.letterSpacing || 0}
                        onChange={(e) => onStyleChange('letterSpacing', parseInt(e.target.value))}
                        min={-5} max={50}
                    />
                 </div>
             </div>

             {/* Row 3: Styles (Bold/Italic/Case) */}
             <div className="flex gap-1 justify-between bg-gray-950 p-1 rounded border border-gray-700">
                 <button 
                    onClick={() => onStyleChange('fontWeight', selectedTextStyle?.fontWeight === 'bold' ? 'normal' : 'bold')}
                    className={`p-1.5 rounded hover:bg-gray-800 ${selectedTextStyle?.fontWeight === 'bold' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400'}`}
                    title="Bold"
                 >
                     <Bold size={16} />
                 </button>
                 <button 
                    onClick={() => onStyleChange('fontStyle', selectedTextStyle?.fontStyle === 'italic' ? 'normal' : 'italic')}
                    className={`p-1.5 rounded hover:bg-gray-800 ${selectedTextStyle?.fontStyle === 'italic' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400'}`}
                    title="Italic"
                 >
                     <Italic size={16} />
                 </button>
                 <button 
                    onClick={() => onStyleChange('textDecoration', selectedTextStyle?.textDecoration === 'underline' ? '' : 'underline')}
                    className={`p-1.5 rounded hover:bg-gray-800 ${selectedTextStyle?.textDecoration === 'underline' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400'}`}
                    title="Underline"
                 >
                     <Underline size={16} />
                 </button>
                 
                 <div className="w-px bg-gray-700 mx-1"></div>

                 <select 
                    className="bg-transparent text-xs text-gray-300 outline-none w-20"
                    value={selectedTextStyle?.textTransform || 'none'}
                    onChange={(e) => onStyleChange('textTransform', e.target.value)}
                 >
                     <option value="none">Normal</option>
                     <option value="uppercase">ABC</option>
                     <option value="lowercase">abc</option>
                     <option value="capitalize">Abc</option>
                 </select>
             </div>

             {/* Row 4: Alignment (NEW) */}
             <div className="flex gap-1 justify-between bg-gray-950 p-1 rounded border border-gray-700">
                <button 
                    onClick={() => onStyleChange('align', 'left')}
                    className={`flex-1 p-1.5 rounded hover:bg-gray-800 flex justify-center ${selectedTextStyle?.align === 'left' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400'}`}
                    title="Align Left"
                >
                    <AlignLeft size={16} />
                </button>
                <button 
                    onClick={() => onStyleChange('align', 'center')}
                    className={`flex-1 p-1.5 rounded hover:bg-gray-800 flex justify-center ${selectedTextStyle?.align === 'center' || !selectedTextStyle?.align ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400'}`}
                    title="Align Center"
                >
                    <AlignCenter size={16} />
                </button>
                <button 
                    onClick={() => onStyleChange('align', 'right')}
                    className={`flex-1 p-1.5 rounded hover:bg-gray-800 flex justify-center ${selectedTextStyle?.align === 'right' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400'}`}
                    title="Align Right"
                >
                    <AlignRight size={16} />
                </button>
                <button 
                    onClick={() => onStyleChange('align', 'justify')}
                    className={`flex-1 p-1.5 rounded hover:bg-gray-800 flex justify-center ${selectedTextStyle?.align === 'justify' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400'}`}
                    title="Justify"
                >
                    <AlignJustify size={16} />
                </button>
             </div>

         </div>
      </div>

      {/* Field List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        
        {/* PREDEFINED SECTIONS */}
        {Object.entries(groupedFields).map(([section, fields]: [string, any]) => {
            
            if (section === "Signatories") {
                // Group signatories logic...
                const sigPairs = [];
                for(let i=0; i<4; i++) {
                    const nameDef = fields.find((f: any) => f.id === `signatoryName_${i}`);
                    const roleDef = fields.find((f: any) => f.id === `signatoryRole_${i}`);
                    if(nameDef && roleDef) sigPairs.push({ index: i, name: nameDef, role: roleDef });
                }

                const activePairs = sigPairs.filter(p => activeFieldIds.includes(p.name.id) || activeFieldIds.includes(p.role.id));
                const pairsToShow = activePairs.length > 0 ? activePairs : [sigPairs[0]]; 

                return (
                    <div key={section} className="space-y-2">
                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
                            {section}
                        </h3>
                        
                        {pairsToShow.map((pair, idx) => (
                            <div key={pair.index} className="pl-2 border-l-2 border-gray-700 mt-4 relative group">
                                <div className="flex justify-between items-center mb-2 pr-1">
                                  <span className="text-xs font-bold text-gray-500 uppercase">Signatory {pair.index + 1}</span>
                                  
                                  <div className="flex items-center gap-2">
                                      {activeFieldIds.includes(pair.name.id) && (
                                        <label 
                                            className="text-gray-600 hover:text-blue-400 transition-colors cursor-pointer"
                                            title="Upload Signature Image"
                                        >
                                            <Upload size={14}/>
                                            <input 
                                                type="file" 
                                                hidden 
                                                accept="image/*"
                                                onChange={(e) => onSignatureUpload(pair.index, e)}
                                            />
                                        </label>
                                      )}

                                      {activeFieldIds.includes(pair.name.id) && (
                                          <button 
                                              onClick={() => onToggle([pair.name, pair.role])}
                                              className="text-gray-600 hover:text-red-400 transition-colors"
                                              title="Remove Signatory"
                                          >
                                              <Trash2 size={14}/>
                                          </button>
                                      )}
                                  </div>
                                </div>
                                {renderField(pair.name)}
                                {renderField(pair.role)}
                            </div>
                        ))}

                        {activePairs.length < 4 && (
                            <button 
                              onClick={() => {
                                  const nextPair = sigPairs.find(p => !activeFieldIds.includes(p.name.id));
                                  if (nextPair) {
                                      onToggle([nextPair.name, nextPair.role]);
                                  }
                              }}
                              className="w-full mt-4 py-2 border border-dashed border-gray-600 rounded text-gray-400 text-xs hover:border-blue-500 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={14}/> Add Signatory
                            </button>
                        )}
                    </div>
                );
            }

            return (
              <div key={section} className="space-y-2">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
                  {section}
                </h3>
                <div className="space-y-1">
                  {fields.map((field: any) => renderField(field))}
                </div>
              </div>
            );
        })}

        {/* CUSTOM ADDITIONS SECTION */}
        <div className="space-y-2 pt-4 border-t border-gray-700">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
                Custom Additions
            </h3>
            
            {/* List existing custom fields */}
            <div className="space-y-1">
                {customFields.map((field, index) => {
                    // Create a definition object on the fly for renderField
                    const customDef = {
                        id: field.id,
                        label: `New Text ${index + 1}`,
                        text: field.textContent
                    };
                    return renderField(customDef, true); // Pass true to indicate it is custom
                })}
            </div>

            {/* Add New Button */}
            <button 
                onClick={onAddCustomText}
                className="w-full mt-2 py-2.5 bg-gray-900 border border-gray-600 rounded text-gray-300 text-xs font-medium hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
                <PlusCircle size={16} className="text-gray-500 group-hover:text-white"/> 
                Insert Custom Text
            </button>
        </div>

      </div>
    </div>
  );
}