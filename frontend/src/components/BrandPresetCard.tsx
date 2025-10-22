import React, { useState } from 'react';
import { Edit, Trash2, Check, Star, Palette } from 'lucide-react';
import { BrandPreset } from '../types/brandkit';

interface BrandPresetCardProps {
  preset: BrandPreset;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onApply: () => void;
}

export const BrandPresetCard: React.FC<BrandPresetCardProps> = ({
  preset,
  onEdit,
  onDelete,
  onSetDefault,
  onApply,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-all group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-slate-100">{preset.name}</h3>
              {preset.isDefault && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  <Star size={12} fill="currentColor" />
                  Default
                </span>
              )}
            </div>
            {preset.description && (
              <p className="text-sm text-slate-400">{preset.description}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {preset.logo && (
            <div className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-center border border-slate-700/50">
              <img
                src={preset.logo.url}
                alt={`${preset.name} logo`}
                className="max-h-16 max-w-full object-contain"
                style={{ transform: `scale(${preset.logo.scale})` }}
              />
            </div>
          )}

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Palette size={14} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-400">Color Theme</span>
            </div>
            <div className="flex gap-2">
              <div
                className="flex-1 h-8 rounded-md border border-slate-600"
                style={{ backgroundColor: preset.colors.primary }}
                title={`Primary: ${preset.colors.primary}`}
              />
              <div
                className="flex-1 h-8 rounded-md border border-slate-600"
                style={{ backgroundColor: preset.colors.secondary }}
                title={`Secondary: ${preset.colors.secondary}`}
              />
              <div
                className="flex-1 h-8 rounded-md border border-slate-600"
                style={{ backgroundColor: preset.colors.text }}
                title={`Text: ${preset.colors.text}`}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">Institution</p>
            <p className="text-sm text-slate-200">{preset.header.institutionName}</p>
            {preset.header.departmentName && (
              <p className="text-xs text-slate-400 mt-1">{preset.header.departmentName}</p>
            )}
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">Signatory</p>
            <p className="text-sm text-slate-200">{preset.signatory.name}</p>
            <p className="text-xs text-slate-400">{preset.signatory.position}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 bg-slate-900/50 border-t border-slate-700/50">
        <button
          onClick={onApply}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
        >
          <Check size={16} />
          Apply
        </button>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-slate-700/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
          title="Edit"
        >
          <Edit size={16} />
        </button>
        {!preset.isDefault && (
          <button
            onClick={onSetDefault}
            className="px-4 py-2 bg-slate-700/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
            title="Set as Default"
          >
            <Star size={16} />
          </button>
        )}
        <button
          onClick={handleDelete}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            showDeleteConfirm
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
          title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
