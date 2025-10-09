import { Settings as SettingsIcon } from 'lucide-react';

function Settings() {
  return (
    <div className="h-full bg-slate-600 flex items-center justify-center">
      <div className="text-center">
        <SettingsIcon className="w-24 h-24 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl text-white mb-2">Settings</h2>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>
    </div>
  );
}

export default Settings;
