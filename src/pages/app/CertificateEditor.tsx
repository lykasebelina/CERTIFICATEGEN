import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  Type,
  Layers,
  Ruler,
  Eye,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { CertificateData, CertificateElement, CertificateLayer } from "../../types/certificate";
import CertificateTemplate from "../../components/CertificateTemplate";

const CertificateEditor: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ receive data from AIGenerate via navigate("/editor", { state: { data } })
  const certificate = location.state?.data as CertificateData | null;

  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(
    null
  );
  const editorRef = useRef<HTMLDivElement>(null);

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300">
        <p>No certificate loaded.</p>
      </div>
    );
  }

  const handleMouseDown = (
    e: React.MouseEvent,
    element: CertificateElement | CertificateLayer
  ) => {
    e.stopPropagation();
    setActiveElement(element.id);
    const rect = editorRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragging({
      id: element.id,
      offsetX: e.clientX - (rect.left + element.x),
      offsetY: e.clientY - (rect.top + element.y),
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !editorRef.current) return;
    const rect = editorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragging.offsetX;
    const y = e.clientY - rect.top - dragging.offsetY;

    // move either element or layer
    if (certificate.layers) {
      certificate.layers = certificate.layers.map((layer) =>
        layer.id === dragging.id ? { ...layer, x, y } : layer
      );
    }
    certificate.elements = certificate.elements.map((el) =>
      el.id === dragging.id ? { ...el, x, y } : el
    );
  };

  const handleMouseUp = () => setDragging(null);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* ✅ Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <h2 className="text-slate-200 font-semibold text-sm">
            {certificate.title || "Untitled Certificate"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition">
            <Ruler size={16} /> Resize
          </button>
          <button className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition">
            <Layers size={16} /> Layers
          </button>
          <button className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition">
            <Type size={16} /> Text
          </button>
          <button className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition">
            <ImageIcon size={16} /> Image
          </button>
          <button className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition">
            <Eye size={16} /> Preview
          </button>
          <button className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition">
            <Sparkles size={16} /> Enhance
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-800 rounded-md transition">
            <Share2 size={16} className="text-slate-300" />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-md transition">
            <Download size={16} className="text-slate-300" />
          </button>
        </div>
      </div>

      {/* ✅ Editable Certificate Canvas */}
      <div
        ref={editorRef}
        className="flex-1 flex items-center justify-center bg-slate-800 p-10 overflow-auto"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative bg-white shadow-2xl transition-all"
          style={{
            width: certificate.width || 800,
            height: certificate.height || 600,
          }}
          onClick={() => setActiveElement(null)}
        >
          {/* Certificate Base Template */}
          <CertificateTemplate data={certificate} />

          {/* Editable Layers */}
          {certificate.layers?.map((layer) => (
            <div
              key={layer.id}
              className={`absolute cursor-move ${
                activeElement === layer.id ? "ring-2 ring-blue-500" : ""
              }`}
              style={{
                left: `${layer.x}px`,
                top: `${layer.y}px`,
                width: `${layer.width}px`,
                height: `${layer.height}px`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveElement(layer.id);
              }}
              onMouseDown={(e) => handleMouseDown(e, layer)}
            >
              <img
                src={layer.src}
                alt={layer.id}
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          ))}

          {/* Editable Text Elements */}
          {certificate.elements?.map((el) => (
            <div
              key={el.id}
              className={`absolute cursor-move ${
                activeElement === el.id ? "ring-2 ring-blue-500" : ""
              }`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                fontSize: `${el.fontSize}px`,
                fontFamily: el.fontFamily,
                color: el.color,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveElement(el.id);
              }}
              onMouseDown={(e) => handleMouseDown(e, el)}
            >
              {el.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateEditor;
