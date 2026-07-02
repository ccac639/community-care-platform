import { useState } from "react";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import HomePage from "./pages/HomePage";
import FoodPage from "./pages/FoodPage";
import MedicalPage from "./pages/MedicalPage";
import CommunityPage from "./pages/CommunityPage";
import WelfarePage from "./pages/WelfarePage";
import DisasterPage from "./pages/DisasterPage";

const MAIN_TABS = ["home", "health", "life", "social", "psych", "welfare"] as const;
type MainTab = (typeof MAIN_TABS)[number];

function App() {
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [showSplash, setShowSplash] = useState(true);

  const handleNavigate = (page: string) => {
    if (MAIN_TABS.includes(page as MainTab)) {
      setActiveTab(page as MainTab);
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "health":
        return <MedicalPage onBack={() => setActiveTab("home")} />;
      case "life":
        return <FoodPage onBack={() => setActiveTab("home")} />;
      case "social":
        return <DisasterPage onBack={() => setActiveTab("home")} />;
      case "psych":
        return <CommunityPage onBack={() => setActiveTab("home")} />;
      case "welfare":
        return <WelfarePage onBack={() => setActiveTab("home")} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 relative">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {renderPage()}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as MainTab)} />
    </div>
  );
}

export default App;
