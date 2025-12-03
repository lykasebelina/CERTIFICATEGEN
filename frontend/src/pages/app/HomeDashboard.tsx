import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  LayoutTemplate,
  FileText,
  Clock,
} from "lucide-react";

function HomeDashboard() {
  const navigate = useNavigate();

  // Mock data for activities to make them interactive
  const activities = [
    { id: 1, action: "You generated a certificate", time: "2:34 PM" },
    { id: 2, action: "Exported bulk PDF files", time: "Yesterday" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 flex flex-col">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">
          Welcome Back, Admin!
        </h1>
        <p className="text-slate-400">
          Here’s your personal dashboard — manage, analyze, and create certificates efficiently.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-300 mb-4">
          Quick Actions
        </h2>
        {/* Changed grid-cols-4 to grid-cols-3 since Brand Kit is removed */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/app/studio/ai-generate")}
            className="bg-slate-800 hover:bg-slate-700 transition rounded-xl p-4 flex flex-col items-center justify-center border border-slate-700 hover:border-blue-500 group"
          >
            <Sparkles className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-medium text-slate-200">
              AI Generate
            </span>
          </button>

          <button
            onClick={() => navigate("/app/studio/my-certificates")}
            className="bg-slate-800 hover:bg-slate-700 transition rounded-xl p-4 flex flex-col items-center justify-center border border-slate-700 hover:border-purple-500 group"
          >
            <FileText className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-medium text-slate-200">
              My Certificates
            </span>
          </button>

          <button
            onClick={() => navigate("/app/studio/custom-template")}
            className="bg-slate-800 hover:bg-slate-700 transition rounded-xl p-4 flex flex-col items-center justify-center border border-slate-700 hover:border-teal-500 group"
          >
            <LayoutTemplate className="w-6 h-6 text-teal-400 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-medium text-slate-200">
              Custom Templates
            </span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">
          Recent Activities
        </h2>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => navigate("/app/activity-log")} // ADDED FUNCTIONALITY: Navigates to log
              className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 p-2 rounded-lg transition group"
            >
              <span className="flex items-center gap-2 text-slate-300 text-sm group-hover:text-blue-300">
                <Clock className="w-4 h-4 text-blue-400" /> {activity.action}
              </span>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">
          Analytics Overview
        </h2>
        {/* Changed grid-cols-3 to grid-cols-2 since Engagement Rate is removed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Certificates Created */}
          <div 
            onClick={() => navigate("/app/analytics/certificates")} // ADDED FUNCTIONALITY: Navigate to specific stats
            className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer hover:bg-slate-750 transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-slate-400 text-sm">Certificates Created</h3>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-semibold text-slate-100 mt-2">48</p>
          </div>

          {/* Card 2: Templates Used */}
          <div 
             onClick={() => navigate("/app/analytics/templates")} // ADDED FUNCTIONALITY: Navigate to specific stats
             className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-purple-500 cursor-pointer hover:bg-slate-750 transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-slate-400 text-sm">Templates Used</h3>
              <LayoutTemplate className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-semibold text-slate-100 mt-2">17</p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-12 text-center text-xs text-slate-500">
        © 2025 CertiGen. Empowering creativity with AI.
      </div>
    </div>
  );
}

export default HomeDashboard;