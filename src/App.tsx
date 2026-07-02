import { useState } from "react";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/HomePage";
import FoodPage from "./pages/FoodPage";
import MedicalPage from "./pages/MedicalPage";
import CommunityPage from "./pages/CommunityPage";
import ElderPage from "./pages/ElderPage";
import WelfarePage from "./pages/WelfarePage";

const MAIN_TABS = ["home", "medical", "food", "community", "elder", "welfare"] as const;
type MainTab = (typeof MAIN_TABS)[number];

function App() {
  const [activeTab, setActiveTab] = useState<MainTab>("home");

  const handleNavigate = (page: string) => {
    if (MAIN_TABS.includes(page as MainTab)) {
      setActiveTab(page as MainTab);
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "food":
        return <FoodPage onBack={() => setActiveTab("home")} />;
      case "medical":
        return <MedicalPage onBack={() => setActiveTab("home")} />;
      case "community":
        return <CommunityPage onBack={() => setActiveTab("home")} />;
      case "elder":
        return <ElderPage onBack={() => setActiveTab("home")} />;
      case "welfare":
        return <WelfarePage onBack={() => setActiveTab("home")} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative">
      {renderPage()}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as MainTab)} />
    </div>
  );
}

export default App;
