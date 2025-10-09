import {
  Home,
  Sparkles,
  Library,
  FileText,
  Palette,
  Heart,
  Settings as SettingsIcon,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import React, { useEffect } from "react";

type Page =
  | "home"
  | "ai-generate"
  | "template-library"
  | "custom-template"
  | "brand-kit"
  | "my-certificates"
  | "favorites"
  | "settings";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: Page) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function Sidebar({
  currentPage,
  onPageChange,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const menuItems = [
    { id: "home" as Page, label: "Home", icon: Home },
    { id: "ai-generate" as Page, label: "AI Generate", icon: Sparkles },
    { id: "template-library" as Page, label: "Template Library", icon: Library },
    { id: "custom-template" as Page, label: "Custom Template Hub", icon: FileText },
    { id: "brand-kit" as Page, label: "Brand Kit", icon: Palette },
    { id: "my-certificates" as Page, label: "My Certificates", icon: Award },
    { id: "favorites" as Page, label: "Favorites", icon: Heart },
    { id: "settings" as Page, label: "Settings", icon: SettingsIcon },
  ];

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`bg-[#0b111c] text-white flex flex-col transition-all duration-300 fixed lg:static inset-y-0 left-0 z-50 ${
          collapsed ? "w-16" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className={`p-6 border-b border-slate-700 flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Award className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">CERTIGEN</span>
            </div>
          )}
          {collapsed && <Award className="w-8 h-8 text-blue-400" />}

          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded-md hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:block p-1 rounded-md hover:bg-slate-700 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-slate-300" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-300" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-0" : "gap-3 px-4"
                } py-3 rounded-lg mb-1 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="py-4 px-0 border-t border-slate-700">
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">Admin User</div>
                <div className="text-xs text-slate-400 truncate">admin@certigen.ai</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
