import { FileText, Upload, Sparkles } from "lucide-react";

function CustomTemplateHub() {
  return (
    <div className="h-full bg-slate-900 text-white p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Custom Template Hub</h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Upload and manage your school’s or organization’s official certificate templates. 
            Use AI to adapt your design or automatically fill in required data.
          </p>
        </div>
        <FileText className="w-10 h-10 text-blue-400" />
      </div>

      {/* Content Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-6 hover:border-blue-500 transition">
        <div className="bg-slate-700 p-6 rounded-full">
          <Upload className="w-12 h-12 text-blue-400" />
        </div>

        <h3 className="text-xl font-semibold">Upload Your Template</h3>
        <p className="text-slate-400 max-w-md">
          Get started by uploading your custom certificate design. 
          Once uploaded, you can modify the layout, text, and integrate data using AI-powered tools.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md font-medium text-sm transition">
            <Upload className="inline w-4 h-4 mr-2" />
            Upload Template
          </button>
          <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-md font-medium text-sm flex items-center justify-center transition">
            <Sparkles className="inline w-4 h-4 mr-2 text-blue-400" />
            Use AI Adaptation
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomTemplateHub;
