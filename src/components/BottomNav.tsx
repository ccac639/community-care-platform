import { Home, HeartPulse, UtensilsCrossed, AlertTriangle, MessageCircleHeart, HandHeart } from "lucide-react";
import { cn } from "../lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", icon: Home, label: "首页" },
  { id: "health", icon: HeartPulse, label: "健康" },
  { id: "life", icon: UtensilsCrossed, label: "生活" },
  { id: "social", icon: AlertTriangle, label: "社会" },
  { id: "psych", icon: MessageCircleHeart, label: "心理" },
  { id: "welfare", icon: HandHeart, label: "响应" },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-100">
      <div className="flex items-center justify-around py-1 pb-safe max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-2 rounded-xl btn-pressable transition-all",
                isActive ? "text-primary-600" : "text-gray-400"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span className={cn("text-[11px] mt-0.5 font-medium", isActive ? "text-primary-600" : "text-gray-400")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
