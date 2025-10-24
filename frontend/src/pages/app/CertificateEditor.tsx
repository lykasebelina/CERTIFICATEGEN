import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CertificateElement, CertificateLayer } from "../../types/certificate";
import CertificateLayout from "../../layouts/CertificateLayout";
import MockCertificateElements from "../../components/MockCertificateElements";
import { useCertificate } from "../../context/CertificateContext";
import EditorTopBar from "../../components/EditorTopBar";
import EditorBottomBar from "../../components/EditorBottomBar";
import EditorDropdownSidebar from "../../components/EditorDropdownSidebar";

const CertificateEditor: React.FC = () => {
  const navigate = useNavigate();
  const { currentCertificate } = useCertificate();

  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [activeToolTab, setActiveToolTab] = useState<"select" | "pattern">("select");
  const [rightSidebarWidth, setRightSidebarWidth] = useState(0); // Track right sidebar width

  const layoutRef = useRef<HTMLDivElement>(null);
  const scale = zoom / 100;

  // Auto zoom for smaller screens
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("certificate-container");
      if (container && container.offsetWidth < 800) setZoom(80);
      else setZoom(75);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!currentCertificate) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-300">
        <p className="text-xl mb-4">No certificate loaded</p>
        <button
          onClick={() => navigate("/app/studio/ai-generate")}
          className="mt-8 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
        >
          Create New Certificate
        </button>
      </div>
    );
  }

  const handleMouseDown = (
    e: React.MouseEvent,
    element: CertificateElement | CertificateLayer
  ) => {
    e.stopPropagation();
    setActiveElement(element.id);
    const rect = layoutRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragging({
      id: element.id,
      offsetX: e.clientX - (rect.left + element.x * (zoom / 100)),
      offsetY: e.clientY - (rect.top + element.y * (zoom / 100)),
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !layoutRef.current) return;
    const rect = layoutRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - dragging.offsetX) / (zoom / 100);
    const y = (e.clientY - rect.top - dragging.offsetY) / (zoom / 100);

    if (currentCertificate.layers) {
      currentCertificate.layers = currentCertificate.layers.map((layer) =>
        layer.id === dragging.id ? { ...layer, x, y } : layer
      );
    }
    currentCertificate.elements = currentCertificate.elements.map((el) =>
      el.id === dragging.id ? { ...el, x, y } : el
    );
  };

  const handleMouseUp = () => setDragging(null);

  return (
    <div
      className="h-screen w-full bg-slate-900 flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <EditorTopBar
        activeToolTab={activeToolTab}
        setActiveToolTab={setActiveToolTab}
      />

      <div
        id="certificate-container"
        className="flex-1 overflow-auto bg-slate-900 flex justify-center items-start transition-all duration-300"
        style={{ marginRight: `${rightSidebarWidth}px` }} // Make room for right sidebar
      >
        <div
          className="inline-block mt-2"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease",
          }}
        >
          <div ref={layoutRef}>
            <CertificateLayout size={currentCertificate.size}>
              <div className="relative w-full h-full bg-white shadow-lg overflow-hidden">
                <MockCertificateElements />

                {currentCertificate.layers?.map((layer) => (
                  <div
                    key={layer.id}
                    className={`absolute cursor-move ${
                      activeElement === layer.id ? "ring-2 ring-cyan-400" : ""
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

                {currentCertificate.elements?.map((el) => (
                  <div
                    key={el.id}
                    className={`absolute cursor-move ${
                      activeElement === el.id ? "ring-2 ring-cyan-400" : ""
                    }`}
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      fontSize: `${el.fontSize || 16}px`,
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
            </CertificateLayout>
          </div>
        </div>
      </div>

      <EditorBottomBar zoom={zoom} setZoom={setZoom} />
      
      <EditorDropdownSidebar onWidthChange={setRightSidebarWidth} />
    </div>
  );
};

export default CertificateEditor;
