import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "./index.scss";

const tabs = [
  { key: "home", path: "/pages/home/index", text: "首页", icon: "🏠" },
  { key: "medical", path: "/pages/medical/index", text: "医疗", icon: "🏥" },
  { key: "food", path: "/pages/food/index", text: "食安", icon: "🍽️" },
  { key: "disaster", path: "/pages/disaster/index", text: "社区", icon: "🚨" },
  { key: "community", path: "/pages/community/index", text: "助老", icon: "💬" },
  { key: "welfare", path: "/pages/welfare/index", text: "公益", icon: "❤️" },
];

interface TabBarProps {
  current?: string;
}

export default function TabBar({ current }: TabBarProps) {
  const handleClick = (path: string) => {
    if (current && path.includes(current)) return;
    Taro.redirectTo({ url: path });
  };

  return (
    <View className="custom-tabbar">
      {tabs.map((tab) => {
        const isActive = current === tab.key;
        return (
          <View
            key={tab.key}
            className={`tabbar-item ${isActive ? "active" : ""}`}
            onClick={() => handleClick(tab.path)}
          >
            <Text className="tabbar-icon">{tab.icon}</Text>
            <Text className="tabbar-text">{tab.text}</Text>
          </View>
        );
      })}
    </View>
  );
}
