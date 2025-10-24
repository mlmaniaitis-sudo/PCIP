import { useState } from "react";
import LoginPage from "@/components/LoginPage";
import DashboardLayout from "@/components/DashboardLayout";
import KPIDashboard from "@/components/KPIDashboard";
import UtilizationAnalytics from "@/components/UtilizationAnalytics";
import RiskMapView from "@/components/RiskMapView";
import ComplianceReport from "@/components/ComplianceReport";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <KPIDashboard />;
      case "utilization":
        return <UtilizationAnalytics />;
      case "riskMap":
        return <RiskMapView />;
      case "compliance":
        return <ComplianceReport />;
      default:
        return <KPIDashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPage()}
    </DashboardLayout>
  );
};

export default Index;
