import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  LayoutTemplate,
  Palette,
  FileText,
  Clock,
  TrendingUp,
  Bell,
  UserPlus,
  UserCheck,
  UserCircle,
} from "lucide-react";

function HomeDashboard() {
  const navigate = useNavigate();

  // Example notifications and invites (you can later fetch from backend)
  const invites = [
    {
      id: 1,
      name: "Jerome Villanueva",
      role: "Design Lead",
      type: "received",
      message: "invited you to collaborate on a new certificate template.",
      time: "2h ago",
    },
    {
      id: 2,
      name: "Lyka Sebelina",
      role: "Marketing Team",
      type: "sent",
      message: "was invited to review your branding kit.",
      time: "1d ago",
    },
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            onClick={() => navigate("/app/studio/brand-kit")}
            className="bg-slate-800 hover:bg-slate-700 transition rounded-xl p-4 flex flex-col items-center justify-center border border-slate-700 hover:border-pink-500 group"
          >
            <Palette className="w-6 h-6 text-pink-400 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-medium text-slate-200">
              Branding Kit
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
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 text-sm">
              <Clock className="w-4 h-4 text-blue-400" /> You generated a certificate
            </span>
            <span className="text-xs text-slate-500">2:34 PM</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 text-sm">
              <Clock className="w-4 h-4 text-blue-400" /> Updated branding color palette
            </span>
            <span className="text-xs text-slate-500">Yesterday</span>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">
          Analytics Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-blue-500 transition">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-400 text-sm">Certificates Created</h3>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-semibold text-slate-100 mt-2">48</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-purple-500 transition">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-400 text-sm">Templates Used</h3>
              <LayoutTemplate className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-semibold text-slate-100 mt-2">17</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-green-500 transition">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-400 text-sm">Engagement Rate</h3>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-semibold text-slate-100 mt-2">92%</p>
          </div>
        </div>
      </div>

      {/* Invitations & Notifications */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-400" />
          Invitations & Notifications
        </h2>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between p-3 bg-slate-850 rounded-lg hover:bg-slate-700/40 transition"
            >
              {/* Profile icon */}
              <div className="flex items-center gap-3">
                <UserCircle className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="text-slate-200 text-sm font-medium">
                    {invite.name}
                    <span className="text-slate-400 font-normal">
                      {" "}
                      {invite.message}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">{invite.time}</p>
                </div>
              </div>

              {/* Action button */}
              {invite.type === "received" ? (
                <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">
                  <UserCheck className="w-4 h-4" /> Accept
                </button>
              ) : (
                <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition">
                  <UserPlus className="w-4 h-4" /> Pending
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-slate-500">
        © 2025 CertiGen. Empowering creativity with AI.
      </div>
    </div>
  );
}

export default HomeDashboard;
