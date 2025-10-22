import React, { useState, useEffect } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { BrandPresetCard } from '../../components/BrandPresetCard';
import { BrandPresetEditor } from '../../components/BrandPresetEditor';
import { BrandPreset, BrandPresetFormData } from '../../types/brandkit';
import * as brandKitService from '../../services/brandKitService';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

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
      const fetchedPresets = await brandKitService.getBrandPresets(MOCK_USER_ID);
      setPresets(fetchedPresets);
    } catch (error) {
      console.error('Error loading presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePreset = async (data: BrandPresetFormData) => {
    try {
      const newPreset = await brandKitService.createBrandPreset(MOCK_USER_ID, data);
      setPresets([newPreset, ...presets]);
    } catch (error) {
      console.error('Error creating preset:', error);
      alert('Failed to create preset. Please try again.');
    }
  };

  const handleEditPreset = async (data: BrandPresetFormData) => {
    if (!editingPreset) return;

    try {
      const updatedPreset = await brandKitService.updateBrandPreset(
        editingPreset.id,
        MOCK_USER_ID,
        data,
        editingPreset
      );
      setPresets(presets.map((p) => (p.id === editingPreset.id ? updatedPreset : p)));
      setEditingPreset(null);
    } catch (error) {
      console.error('Error updating preset:', error);
      alert('Failed to update preset. Please try again.');
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await brandKitService.deleteBrandPreset(id, MOCK_USER_ID);
      setPresets(presets.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting preset:', error);
      alert('Failed to delete preset. Please try again.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await brandKitService.setDefaultPreset(MOCK_USER_ID, id);
      setPresets(
        presets.map((p) => ({
          ...p,
          isDefault: p.id === id,
        }))
      );
    } catch (error) {
      console.error('Error setting default preset:', error);
      alert('Failed to set default preset. Please try again.');
    }
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
