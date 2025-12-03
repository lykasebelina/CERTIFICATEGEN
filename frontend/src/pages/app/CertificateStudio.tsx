import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const CertificateStudio: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Collapse sidebar when in editor
    if (location.pathname.includes("certificate-editor")) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex w-full h-screen bg-[#0b1221]">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 overflow-y-auto">
        <Outlet /> {/* <-- nested routes render here */}
      </main>
    </div>
  );
};

export default CertificateStudio;
