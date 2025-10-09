import { Palette } from 'lucide-react';

function BrandKit() {
  return (
    <div className="h-full bg-slate-600 flex items-center justify-center">
      <div className="text-center">
        <Palette className="w-24 h-24 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl text-white mb-2">Brand Kit</h2>
        <p className="text-slate-400">Manage your brand colors, fonts, and logos</p>
      </div>
    </div>
  );
}

export default BrandKit;