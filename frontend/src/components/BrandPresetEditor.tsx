import React, { useState } from 'react';
import { X, Upload, Palette, FileText, User, Building2, Image } from 'lucide-react';
import { BrandPresetFormData } from '../types/brandkit';

interface BrandPresetEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BrandPresetFormData) => Promise<void>;
  initialData?: Partial<BrandPresetFormData>;
  mode: 'create' | 'edit';
}

export const BrandPresetEditor: React.FC<BrandPresetEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<BrandPresetFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    logoAlignment: initialData?.logoAlignment || 'center',
    logoScale: initialData?.logoScale || 1,
    primaryColor: initialData?.primaryColor || '#3B82F6',
    secondaryColor: initialData?.secondaryColor || '#8B5CF6',
    backgroundColor: initialData?.backgroundColor || '#1E293B',
    textColor: initialData?.textColor || '#F1F5F9',
    signatoryName: initialData?.signatoryName || '',
    signatoryPosition: initialData?.signatoryPosition || '',
    signatoryVisible: initialData?.signatoryVisible || false,
    institutionName: initialData?.institutionName || '',
    departmentName: initialData?.departmentName || '',
    address: initialData?.address || '',
    motto: initialData?.motto || '',
    headerAlignment: initialData?.headerAlignment || 'center',
    headerFontFamily: initialData?.headerFontFamily || 'serif',
    headerFontSize: initialData?.headerFontSize || 24,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'logo' | 'colors' | 'signatory' | 'header'>('basic');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logoFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, signatureFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving preset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a2332] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-semibold text-slate-100">
            {mode === 'create' ? 'Create Brand Preset' : 'Edit Brand Preset'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-slate-700/50">
          {[
            { id: 'basic', label: 'Basic Info', icon: FileText },
            { id: 'logo', label: 'Logo', icon: Image },
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'signatory', label: 'Signatory', icon: User },
            { id: 'header', label: 'Header', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Preset Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g., PUP Main, IBITS Org"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    placeholder="Brief description to help organize presets"
                  />
                </div>
              </div>
            )}

            {activeTab === 'logo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Upload Logo
                  </label>
                  <div className="flex items-start gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-slate-800/30 transition-all">
                        <Upload className="mx-auto mb-3 text-slate-400" size={32} />
                        <p className="text-sm text-slate-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG</p>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logoPreview && (
                      <div className="w-48 h-48 bg-slate-800 rounded-lg border border-slate-600 flex items-center justify-center p-4">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Logo Alignment
                  </label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setFormData({ ...formData, logoAlignment: align as any })}
                        className={`flex-1 px-4 py-2 rounded-lg capitalize font-medium transition-all ${
                          formData.logoAlignment === align
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Logo Scale: {formData.logoScale.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={formData.logoScale}
                    onChange={(e) => setFormData({ ...formData, logoScale: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-16 h-12 rounded-lg cursor-pointer border border-slate-600"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-16 h-12 rounded-lg cursor-pointer border border-slate-600"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-16 h-12 rounded-lg cursor-pointer border border-slate-600"
                      />
                      <input
                        type="text"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-16 h-12 rounded-lg cursor-pointer border border-slate-600"
                      />
                      <input
                        type="text"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-3">Color Preview</p>
                  <div className="flex gap-2">
                    <div
                      className="flex-1 h-16 rounded-lg border border-slate-600 flex items-center justify-center"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      <span className="text-xs font-medium" style={{ color: formData.textColor }}>Primary</span>
                    </div>
                    <div
                      className="flex-1 h-16 rounded-lg border border-slate-600 flex items-center justify-center"
                      style={{ backgroundColor: formData.secondaryColor }}
                    >
                      <span className="text-xs font-medium" style={{ color: formData.textColor }}>Secondary</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'signatory' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Signatory Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.signatoryName}
                    onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g., Dr. Maria Santos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Position / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.signatoryPosition}
                    onChange={(e) => setFormData({ ...formData, signatoryPosition: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g., Dean, IBITS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Signature Upload
                  </label>
                  <div className="flex items-start gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-slate-800/30 transition-all">
                        <Upload className="mx-auto mb-3 text-slate-400" size={32} />
                        <p className="text-sm text-slate-400">Upload signature image</p>
                        <p className="text-xs text-slate-500 mt-1">PNG with transparent background</p>
                      </div>
                      <input
                        type="file"
                        accept="image/png"
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />
                    </label>
                    {signaturePreview && (
                      <div className="w-64 h-32 bg-slate-800 rounded-lg border border-slate-600 flex items-center justify-center p-4">
                        <img
                          src={signaturePreview}
                          alt="Signature preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <input
                    type="checkbox"
                    id="signatoryVisible"
                    checked={formData.signatoryVisible}
                    onChange={(e) => setFormData({ ...formData, signatoryVisible: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                  />
                  <label htmlFor="signatoryVisible" className="text-sm text-slate-300">
                    Display signature on certificates by default
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'header' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Institution / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g., Polytechnic University of the Philippines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    College / Department (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Institute of Business and Information Technology Studies"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Sto. Niño, Biñan City, Laguna"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Motto / Slogan (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.motto}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., The Country's 1st Polytechnic University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Text Alignment
                  </label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setFormData({ ...formData, headerAlignment: align as any })}
                        className={`flex-1 px-4 py-2 rounded-lg capitalize font-medium transition-all ${
                          formData.headerAlignment === align
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Font Family
                    </label>
                    <select
                      value={formData.headerFontFamily}
                      onChange={(e) => setFormData({ ...formData, headerFontFamily: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="serif">Serif</option>
                      <option value="sans-serif">Sans Serif</option>
                      <option value="monospace">Monospace</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Font Size: {formData.headerFontSize}px
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="48"
                      step="2"
                      value={formData.headerFontSize}
                      onChange={(e) => setFormData({ ...formData, headerFontSize: parseInt(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-slate-700/50 bg-slate-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Preset' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
