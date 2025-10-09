import { Award } from "lucide-react";
import CertificateLayout, { CertificateLayoutProps } from "../layouts/CertificateLayout";

interface CertificateData {
  recipientName: string;
  title: string;
  description: string;
  companyPresident: string;
  branchManager: string;
}

interface CertificateTemplateProps {
  data: CertificateData;
  size: CertificateLayoutProps["size"];
}

function CertificateTemplate({ data, size }: CertificateTemplateProps) {
  return (
    <CertificateLayout size={size}>
      <div className="relative w-full h-full bg-white overflow-hidden rounded-none shadow-2xl">
        {/* Left Panel */}
        <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-gradient-to-b from-sky-600 via-sky-700 to-sky-800 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)"
          }} />
          <div className="relative w-[60%] h-[60%] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center border-[0.5%] border-slate-800 shadow-xl">
              <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Award className="w-[50%] h-[50%] text-amber-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-gradient-to-b from-sky-600 via-sky-700 to-sky-800 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)"
          }} />
          <div className="relative w-[60%] h-[60%] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center border-[0.5%] border-slate-800 shadow-xl">
              <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Award className="w-[50%] h-[50%] text-amber-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center px-[5%]">
          <div className="relative w-full h-full bg-white border-[2%] border-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-[2%]">
            <h1 className="text-[3vw] font-serif font-bold mb-[1vw] tracking-wide">
              {data.title.toUpperCase()}
            </h1>
            <p className="text-[1.2vw] text-slate-600 mb-[2vw] font-light tracking-widest">
              OF APPRECIATION
            </p>

            <p className="text-[1vw] text-slate-600 mb-[1.5vw]">This certificate is proudly awarded to</p>

            <h2 className="text-[2vw] font-serif italic text-slate-800 mb-[2vw]" style={{ fontFamily: 'cursive' }}>
              {data.recipientName}
            </h2>

            <p className="text-[0.9vw] text-slate-600 italic max-w-[60%] mb-[3vw] leading-relaxed">
              {data.description}
            </p>

            {/* Signatures */}
            <div className="flex w-full justify-around">
              <div className="flex flex-col items-center">
                <div className="text-[1vw] mb-[0.5vw]" style={{ fontFamily: 'cursive' }}>
                  {data.companyPresident}
                </div>
                <div className="w-[40%] h-[0.2vw] bg-slate-800 mb-[0.5vw]"></div>
                <div className="text-[0.7vw] text-slate-600 tracking-wider">Company President</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-[1vw] mb-[0.5vw]" style={{ fontFamily: 'cursive' }}>
                  {data.branchManager}
                </div>
                <div className="w-[40%] h-[0.2vw] bg-slate-800 mb-[0.5vw]"></div>
                <div className="text-[0.7vw] text-slate-600 tracking-wider">Branch Manager</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CertificateLayout>
  );
}

export default CertificateTemplate;
