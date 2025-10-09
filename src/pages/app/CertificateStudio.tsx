
// act as a page container
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import AIGenerate from "./AIGenerate";
import Home from "./Home";
import TemplateLibrary from "./TemplateLibrary";
import CustomTemplateHub from "./CustomTemplateHub";
import BrandKit from "./BrandKit";
import MyCertificates from "./MyCertificates";
import Favorites from "./Favorites";
import Settings from "./Settings";
import CertificateEditor from "./CertificateEditor";

type Page =
  | "home"
  | "ai-generate"
  | "template-library"
  | "custom-template"
  | "brand-kit"
  | "my-certificates"
  | "favorites"
  | "settings"
  | "certificate-editor";

const CertificateStudio: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("ai-generate");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (currentPage === "certificate-editor") {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [currentPage]);

  const renderContent = () => {
    switch (currentPage) {
      case "certificate-editor":
        return <CertificateEditor />;

      case "ai-generate":
        // ✅ pass setCurrentPage prop here
        return <AIGenerate setCurrentPage={setCurrentPage} />;

      case "template-library":
        return <TemplateLibrary />;

      case "custom-template":
        return <CustomTemplateHub />;

      case "brand-kit":
        return <BrandKit />;

      case "my-certificates":
        return <MyCertificates />;

      case "favorites":
        return <Favorites />;

      case "settings":
        return <Settings />;

      default:
        return <Home />;
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#0b1221]">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={isSidebarCollapsed}
         onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default CertificateStudio;

