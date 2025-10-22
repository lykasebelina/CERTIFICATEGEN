import { useState } from 'react';
import { Lightbulb, Palette, Plus, Layout, Sparkles } from 'lucide-react';
import CertificatePreview from '../../components/CertificatePreview';
import { useCertificate } from '../../context/CertificateContext';
import { useNavigate } from 'react-router-dom';

type CertificateSize =
  | 'a4-portrait'
  | 'a4-landscape'
  | 'legal-portrait'
  | 'legal-landscape'
  | 'letter-portrait'
  | 'letter-landscape';

function AIGenerate() {
  const navigate = useNavigate();
  const { createCertificateFromPreview, setCurrentCertificate } = useCertificate();
  const [prompt, setPrompt] = useState('');
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [selectedSize, setSelectedSize] = useState<CertificateSize>('a4-portrait');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sizes = [
    { id: 'a4-portrait' as CertificateSize, label: 'A4 (Portrait)' },
    { id: 'a4-landscape' as CertificateSize, label: 'A4 (Landscape)' },
    { id: 'legal-portrait' as CertificateSize, label: 'Legal Size (Portrait)' },
    { id: 'legal-landscape' as CertificateSize, label: 'Legal Size (Landscape)' },
    { id: 'letter-portrait' as CertificateSize, label: 'US Letter (Portrait)' },
    { id: 'letter-landscape' as CertificateSize, label: 'US Letter (Landscape)' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 2000);
  };

  const handleUseTemplate = () => {
    const certificate = createCertificateFromPreview(selectedSize, prompt);
    setCurrentCertificate(certificate);
//SHOW CERTIFICATE PREVIEW
    setShowPreview(false);
    setTimeout(() => {
      navigate('/app/studio/certificate-editor');
    }, 200);
  };

  if (isGenerating) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Generating certificate. Please wait...</p>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <CertificatePreview
        size={selectedSize}
        prompt={prompt}
        onBack={() => setShowPreview(false)}
        onUseTemplate={handleUseTemplate}
        onGenerate={handleGenerate}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 p-10">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-400 mb-1">Hello, Admin</h1>
          <p className="text-slate-400 text-base">What should we create today?</p>
        </div>
        <p className="text-slate-400 text-center mb-6 text-sm">
          Describe your certificate design and we'll generate beautiful, layered artwork using AI.
        </p>

        <div className="relative mb-5 flex justify-center">
          <div className="bg-slate-800 rounded-xl p-1.5 border border-slate-700 w-full max-w-3xl">
            <div className="flex">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your certificate... (e.g., elegant blue background with golden borders, vintage ornaments, professional award design)"
                className="flex-[1.5] bg-transparent text-slate-300 placeholder-slate-500 p-4 min-h-[120px] resize-none focus:outline-none text-sm"
              />
              <div className="flex flex-col gap-2 p-2 border-l border-slate-700 relative">
                <div className="relative group">
                  <button className="p-2 rounded-md transition-colors group/icon">
                    <Plus className="w-4 h-4 text-slate-400 group-hover/icon:text-blue-400" />
                  </button>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-slate-700 whitespace-nowrap">
                      Add Files
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <button className="p-2 rounded-md transition-colors group/icon">
                    <Lightbulb className="w-4 h-4 text-slate-400 group-hover/icon:text-blue-400" />
                  </button>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-slate-700 whitespace-nowrap">
                      Use Predefined Prompts
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <button className="p-2 rounded-md transition-colors group/icon">
                    <Palette className="w-4 h-4 text-slate-400 group-hover/icon:text-blue-400" />
                  </button>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-slate-700 flex items-center justify-between gap-2 whitespace-nowrap">
                      Brand Preset
                      <div className="w-9 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-0.5">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowSizeMenu(!showSizeMenu)}
                    className="p-2 rounded-md transition-colors group/icon"
                  >
                    <Layout className="w-4 h-4 text-slate-400 group-hover/icon:text-blue-400" />
                  </button>
                  {showSizeMenu && (
                    <div className="absolute left-full ml-2 top-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 p-2 w-48">
                      {sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => {
                            setSelectedSize(size.id);
                            setShowSizeMenu(false);
                          }}
                          className={`block w-full text-left px-4 py-1.5 text-xs rounded-md transition-colors ${
                            selectedSize === size.id
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 text-xs">
            Selected Size: <span className="text-blue-400 font-medium">{sizes.find(s => s.id === selectedSize)?.label}</span>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="w-1/2 max-w-md flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Sparkles className="w-4 h-4 text-white" />
            GENERATE CERTIFICATE
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIGenerate;
