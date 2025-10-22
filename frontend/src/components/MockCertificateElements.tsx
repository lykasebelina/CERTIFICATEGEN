import { Award, Shield, Star } from "lucide-react";
import { motion, useMotionValue } from "framer-motion";

interface MockCertificateElementsProps {
  onElementClick?: (elementName: string) => void;
}

function MockCertificateElements({ onElementClick }: MockCertificateElementsProps) {
  const handleClick = (elementName: string) => {
    onElementClick?.(elementName);
  };

  // Track positions for each draggable item




const Draggable = ({
  id,
  className,
  children,
  style,
  onClick,
  onDragEnd,
  defaultPosition = { x: 0, y: 0 },
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
  defaultPosition?: { x: number; y: number };
}) => {
  const x = useMotionValue(defaultPosition.x);
  const y = useMotionValue(defaultPosition.y);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      style={{ x, y, position: "absolute", ...style }}
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onDragEnd={() => {
        onDragEnd?.(id, x.get(), y.get());
      }}
    >
      {children}
    </motion.div>
  );
};


  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden select-none">
      {/* Watermark */}
      <Draggable
        id="watermark"
        className="absolute inset-0 flex items-center justify-center opacity-5 cursor-pointer hover:opacity-10 transition-opacity"
        onClick={() => handleClick("watermark")}
      >
        <Shield className="w-96 h-96 text-slate-600" />
      </Draggable>

      {/* Background Pattern */}
      <Draggable
        id="background-design"
        className="absolute inset-0 opacity-5 cursor-pointer hover:opacity-10 transition-opacity"
        onClick={() => handleClick("background-design")}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(100,116,139,.3) 35px, rgba(100,116,139,.3) 70px)",
          }}
        />
      </Draggable>

      {/* Certificate Border */}
      <Draggable
        id="certificate-border"
        className="absolute inset-0 border-[12px] border-double border-amber-700 m-6 cursor-pointer hover:border-amber-600 transition-colors"
        onClick={() => handleClick("certificate-border")}
      >
        <div className="absolute inset-0 border-[4px] border-amber-600 m-2" />
      </Draggable>

      {/* Corner Ornaments */}
      {[
        { id: "corner-ornament-tl", class: "top-4 left-4 border-t-4 border-l-4" },
        { id: "corner-ornament-tr", class: "top-4 right-4 border-t-4 border-r-4" },
        { id: "corner-ornament-bl", class: "bottom-4 left-4 border-b-4 border-l-4" },
        { id: "corner-ornament-br", class: "bottom-4 right-4 border-b-4 border-r-4" },
      ].map((corner) => (
        <Draggable
          key={corner.id}
          id={corner.id}
          className={`absolute w-16 h-16 border-amber-600 cursor-pointer hover:border-amber-500 transition-colors ${corner.class}`}
          onClick={() => handleClick(corner.id)}
        />
      ))}

      {/* Logo & Organization */}
      <Draggable id="logo-section" className="absolute top-[7%] left-0 right-0 flex flex-col items-center gap-2">
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg flex items-center justify-center border-4 border-amber-700 cursor-pointer hover:scale-110 transition-transform"
          onClick={() => handleClick("logo")}
        >
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h3
          className="text-xl font-bold text-slate-800 tracking-wide cursor-pointer hover:text-amber-700 transition-colors"
          onClick={() => handleClick("organization-name")}
        >
          Excellence Organization
        </h3>
        <p
          className="text-xs text-slate-600 italic cursor-pointer hover:text-slate-800 transition-colors"
          onClick={() => handleClick("tagline")}
        >
          Pursuing Excellence, Inspiring Greatness
        </p>
      </Draggable>

      {/* Title Section */}
      <Draggable id="certificate-title" className="absolute top-[28%] left-32 right-32 flex flex-col items-center text-center">
        <h1
          className="text-5xl font-serif font-bold mb-2 tracking-wider text-slate-900 cursor-pointer hover:text-amber-700 transition-colors"
          onClick={() => handleClick("certificate-title")}
        >
          CERTIFICATE
        </h1>
        <p
          className="text-lg text-slate-600 mb-4 tracking-widest font-light cursor-pointer hover:text-slate-800 transition-colors"
          onClick={() => handleClick("subtitle")}
        >
          OF APPRECIATION
        </p>
      </Draggable>

      {/* Recipient Section */}
      <Draggable id="recipient-section" className="absolute top-[40%] left-32 right-32 flex flex-col items-center text-center">
        <div
          className="bg-amber-50 border-2 border-amber-200 rounded-lg px-6 py-2 mb-4 cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => handleClick("award-statement")}
        >
          <p className="text-sm text-slate-700 italic">This certificate is proudly awarded to</p>
        </div>

        <h2
          className="text-4xl font-serif italic text-slate-800 mb-3 px-8 py-2 border-b-2 border-t-2 border-amber-400 cursor-pointer hover:text-amber-700 transition-colors"
          style={{ fontFamily: "cursive" }}
          onClick={() => handleClick("recipient-name")}
        >
          John Michael Doe
        </h2>

        <div
          className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500 shadow-lg mb-3 bg-slate-200 flex items-center justify-center cursor-pointer hover:border-amber-600 transition-colors"
          onClick={() => handleClick("recipient-photo")}
        >
          <span className="text-slate-400 text-xs">Photo</span>
        </div>

        <p
          className="text-sm text-slate-700 italic max-w-2xl mb-3 leading-relaxed cursor-pointer hover:text-slate-900 transition-colors"
          onClick={() => handleClick("recognition-statement")}
        >
          For outstanding dedication, exceptional performance, and valuable contributions to our organization.
        </p>
      </Draggable>

      {/* Signatures and Footer */}
      <Draggable id="signature-section" className="absolute bottom-[10%] left-32 right-32">
        <div className="flex justify-between items-end">
          {/* Left Signature */}
          <div className="flex flex-col items-center w-64">
            <div
              className="text-lg mb-1 cursor-pointer hover:text-amber-700 transition-colors"
              style={{ fontFamily: "cursive" }}
              onClick={() => handleClick("signature-1")}
            >
              Elizabeth M. Johnson
            </div>
            <div className="w-48 h-0.5 bg-slate-800 mb-1" />
            <div className="text-xs text-slate-600 tracking-wider">Company President</div>
          </div>

          {/* Seal */}
          <div className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center border-4 border-amber-800 shadow-xl">
              <Award className="w-12 h-12 text-amber-900" />
            </div>
          </div>

          {/* Right Signature */}
          <div className="flex flex-col items-center w-64">
            <div
              className="text-lg mb-1 cursor-pointer hover:text-amber-700 transition-colors"
              style={{ fontFamily: "cursive" }}
              onClick={() => handleClick("signature-2")}
            >
              Robert K. Anderson
            </div>
            <div className="w-48 h-0.5 bg-slate-800 mb-1" />
            <div className="text-xs text-slate-600 tracking-wider">Branch Manager</div>
          </div>
        </div>
      </Draggable>
    </div>
  );
}

export default MockCertificateElements;
