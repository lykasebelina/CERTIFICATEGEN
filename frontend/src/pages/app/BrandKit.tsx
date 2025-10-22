import React, { useState, useEffect } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { BrandPresetCard } from '../../components/BrandPresetCard';
import { BrandPresetEditor } from '../../components/BrandPresetEditor';
import { BrandPreset, BrandPresetFormData } from '../../types/brandkit';

export const BrandKit: React.FC = () => {
  const [presets, setPresets] = useState<BrandPreset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<BrandPreset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setIsLoading(true);
    try {
      setPresets([
        {
          id: '1',
          name: 'PUP Main',
          description: 'Main institutional branding for PUP',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
          logo: {
            url: '/placeholder-logo.png',
            alignment: 'center',
            scale: 1,
          },
          colors: {
            primary: '#8B0000',
            secondary: '#FFD700',
            background: '#1E293B',
            text: '#F1F5F9',
          },
          signatory: {
            name: 'Dr. Emanuel C. De Guzman',
            position: 'University President',
            visible: true,
          },
          header: {
            institutionName: 'Polytechnic University of the Philippines',
            departmentName: 'Office of the President',
            address: 'Mabini Campus, Sta. Mesa, Manila',
            motto: "The Country's 1st Polytechnic University",
            alignment: 'center',
            fontFamily: 'serif',
            fontSize: 24,
          },
        },
        {
          id: '2',
          name: 'IBITS Org',
          description: 'Institute of Business and Information Technology Studies',
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
          colors: {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            background: '#1E293B',
            text: '#F1F5F9',
          },
          signatory: {
            name: 'Dr. Maria Santos',
            position: 'Dean, IBITS',
            visible: false,
          },
          header: {
            institutionName: 'Polytechnic University of the Philippines',
            departmentName: 'Institute of Business and Information Technology Studies',
            address: 'Sto. Niño, Biñan City, Laguna',
            alignment: 'center',
            fontFamily: 'serif',
            fontSize: 22,
          },
        },
      ]);
    } catch (error) {
      console.error('Error loading presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePreset = async (data: BrandPresetFormData) => {
    const newPreset: BrandPreset = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      logo: data.logoFile
        ? {
            url: URL.createObjectURL(data.logoFile),
            alignment: data.logoAlignment,
            scale: data.logoScale,
          }
        : undefined,
      colors: {
        primary: data.primaryColor,
        secondary: data.secondaryColor,
        background: data.backgroundColor,
        text: data.textColor,
      },
      signatory: {
        name: data.signatoryName,
        position: data.signatoryPosition,
        signatureUrl: data.signatureFile ? URL.createObjectURL(data.signatureFile) : undefined,
        visible: data.signatoryVisible,
      },
      header: {
        institutionName: data.institutionName,
        departmentName: data.departmentName,
        address: data.address,
        motto: data.motto,
        alignment: data.headerAlignment,
        fontFamily: data.headerFontFamily,
        fontSize: data.headerFontSize,
      },
    };

    setPresets([...presets, newPreset]);
  };

  const handleEditPreset = async (data: BrandPresetFormData) => {
    if (!editingPreset) return;

    const updatedPreset: BrandPreset = {
      ...editingPreset,
      name: data.name,
      description: data.description,
      updatedAt: new Date(),
      logo: data.logoFile
        ? {
            url: URL.createObjectURL(data.logoFile),
            alignment: data.logoAlignment,
            scale: data.logoScale,
          }
        : editingPreset.logo,
      colors: {
        primary: data.primaryColor,
        secondary: data.secondaryColor,
        background: data.backgroundColor,
        text: data.textColor,
      },
      signatory: {
        name: data.signatoryName,
        position: data.signatoryPosition,
        signatureUrl: data.signatureFile
          ? URL.createObjectURL(data.signatureFile)
          : editingPreset.signatory.signatureUrl,
        visible: data.signatoryVisible,
      },
      header: {
        institutionName: data.institutionName,
        departmentName: data.departmentName,
        address: data.address,
        motto: data.motto,
        alignment: data.headerAlignment,
        fontFamily: data.headerFontFamily,
        fontSize: data.headerFontSize,
      },
    };

    setPresets(presets.map((p) => (p.id === editingPreset.id ? updatedPreset : p)));
    setEditingPreset(null);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPresets(
      presets.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
  };

  const handleApplyPreset = (preset: BrandPreset) => {
    console.log('Applying preset:', preset);
  };

  const openCreateEditor = () => {
    setEditingPreset(null);
    setIsEditorOpen(true);
  };

  const openEditEditor = (preset: BrandPreset) => {
    setEditingPreset(preset);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingPreset(null);
  };

  const filteredPresets = presets.filter(
    (preset) =>
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitialFormData = (preset: BrandPreset | null): Partial<BrandPresetFormData> => {
    if (!preset) return {};

    return {
      name: preset.name,
      description: preset.description,
      logoAlignment: preset.logo?.alignment || 'center',
      logoScale: preset.logo?.scale || 1,
      primaryColor: preset.colors.primary,
      secondaryColor: preset.colors.secondary,
      backgroundColor: preset.colors.background || '#1E293B',
      textColor: preset.colors.text,
      signatoryName: preset.signatory.name,
      signatoryPosition: preset.signatory.position,
      signatoryVisible: preset.signatory.visible,
      institutionName: preset.header.institutionName,
      departmentName: preset.header.departmentName,
      address: preset.header.address,
      motto: preset.header.motto,
      headerAlignment: preset.header.alignment,
      headerFontFamily: preset.header.fontFamily,
      headerFontSize: preset.header.fontSize,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2938] to-[#1a2332]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">Brand Kit</h1>
          <p className="text-slate-400">
            Create and manage branding presets for your certificate projects
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button
            onClick={openCreateEditor}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 justify-center shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} />
            Create Brand Preset
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredPresets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={64} className="text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              {searchQuery ? 'No presets found' : 'No brand presets yet'}
            </h3>
            <p className="text-slate-500 mb-6 max-w-md">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first brand preset to get started with consistent certificate branding'}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateEditor}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                Create Brand Preset
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresets.map((preset) => (
              <BrandPresetCard
                key={preset.id}
                preset={preset}
                onEdit={() => openEditEditor(preset)}
                onDelete={() => handleDeletePreset(preset.id)}
                onSetDefault={() => handleSetDefault(preset.id)}
                onApply={() => handleApplyPreset(preset)}
              />
            ))}
          </div>
        )}
      </div>

      <BrandPresetEditor
        isOpen={isEditorOpen}
        onClose={closeEditor}
        onSave={editingPreset ? handleEditPreset : handleCreatePreset}
        initialData={getInitialFormData(editingPreset)}
        mode={editingPreset ? 'edit' : 'create'}
      />
    </div>
  );
};

export default BrandKit;
