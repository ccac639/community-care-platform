import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import TabBar from "@/components/TabBar";
import {
  getCommunityRiskIndex,
  getCurrentWeather,
  type WeatherData,
  type CommunityRiskResult,
} from "@/core/ai";
import "./index.scss";

interface LocationInfo {
  province: string;
  city: string;
  district: string;
}

const locationOptions: LocationInfo[] = [
  { province: "北京市", city: "北京市", district: "朝阳区" },
  { province: "北京市", city: "北京市", district: "海淀区" },
  { province: "北京市", city: "北京市", district: "西城区" },
  { province: "河北省", city: "廊坊市", district: "三河市" },
];

const riskModules = [
  {
    id: "health",
    icon: "🏥",
    title: "健康风险",
    subtitle: "医疗导航",
    desc: "症状初筛·就医指引",
    level: "正常",
    gradient: "bg-gradient-blue",
    path: "/pages/medical/index",
  },
  {
    id: "life",
    icon: "🍽️",
    title: "生活风险",
    subtitle: "食品安全",
    desc: "配料识别·风险提示",
    level: "正常",
    gradient: "bg-gradient-orange",
    path: "/pages/food/index",
  },
  {
    id: "social",
    icon: "🚨",
    title: "社会风险",
    subtitle: "灾害预警",
    desc: "实时监测·应急响应",
    level: "低风险",
    gradient: "bg-gradient-amber",
    path: "/pages/disaster/index",
  },
  {
    id: "psych",
    icon: "💬",
    title: "心理风险",
    subtitle: "社区陪伴",
    desc: "AI倾诉·成长陪伴",
    level: "正常",
    gradient: "bg-gradient-pink",
    path: "/pages/community/index",
  },
  {
    id: "welfare",
    icon: "❤️",
    title: "公共响应",
    subtitle: "公益中心",
    desc: "志愿服务·爱心互助",
    level: "活跃",
    gradient: "bg-gradient-rose",
    path: "/pages/welfare/index",
  },
];

const alerts = [
  {
    id: 1,
    type: "info",
    icon: "🌡️",
    title: "高温天气预警",
    desc: "今日气温36°C，请注意防暑降温",
    time: "10分钟前",
    module: "社会风险",
  },
  {
    id: 2,
    type: "warning",
    icon: "⚠️",
    title: "食品添加剂提醒",
    desc: "近期购买的零食含3种争议添加剂",
    time: "2小时前",
    module: "生活风险",
  },
  {
    id: 3,
    type: "info",
    icon: "📣",
    title: "社区公益活动",
    desc: "本周六老年健康义诊活动报名中",
    time: "昨天",
    module: "公共响应",
  },
];

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [riskData, setRiskData] = useState<CommunityRiskResult | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingRisk, setLoadingRisk] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(
    locationOptions[0]
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locating, setLocating] = useState(true);

  // 模拟 Taro.getLocation 定位流程
  useEffect(() => {
    let active = true;
    setLocating(true);
    // 尝试调用 Taro.getLocation（小程序需要授权），失败则使用模拟定位
    Taro.getLocation({ type: "gcj02" })
      .catch(() => null)
      .then(() => {
        if (active) {
          setTimeout(() => {
            if (active) setLocating(false);
          }, 800);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // 加载天气与社区风险指数
  useEffect(() => {
    let active = true;
    (async () => {
      const [w, r] = await Promise.all([
        getCurrentWeather(),
        getCommunityRiskIndex(),
      ]);
      if (active) {
        setWeather(w);
        setRiskData(r);
        setLoadingWeather(false);
        setLoadingRisk(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [currentLocation]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6) return "凌晨好";
    if (h < 12) return "上午好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    return "晚上好";
  };

  const handleNavigate = (path: string) => {
    Taro.navigateTo({ url: path }).catch(() => {
      // tabBar 页面回退到 switchTab
      Taro.switchTab({ url: path });
    });
  };

  const toggleLocationPicker = () => {
    setShowLocationPicker((v) => !v);
  };

  const selectLocation = (loc: LocationInfo) => {
    setCurrentLocation(loc);
    setShowLocationPicker(false);
  };

  return (
    <View className="home-page">
      {/* 顶部渐变背景 */}
      <View className="header">
        <View className="header-deco header-deco-1" />
        <View className="header-deco header-deco-2" />
        <View className="header-deco header-deco-3" />

        <View className="header-content">
          {/* 定位 */}
          <View className="location-bar" onClick={toggleLocationPicker}>
            {locating ? (
              <>
                <Text className="location-icon animate-pulse">📍</Text>
                <Text className="location-text">正在定位...</Text>
              </>
            ) : (
              <>
                <Text className="location-icon">📍</Text>
                <Text className="location-text">
                  {currentLocation.province} {currentLocation.city}{" "}
                  {currentLocation.district}
                </Text>
                <Text className="location-arrow">▾</Text>
              </>
            )}
          </View>

          {/* 定位选择浮层 */}
          {showLocationPicker && (
            <View className="location-picker">
              <Text className="location-picker-title">选择位置</Text>
              {locationOptions.map((loc, idx) => (
                <View
                  key={idx}
                  className="location-picker-item"
                  onClick={() => selectLocation(loc)}
                >
                  <Text className="location-picker-icon">📍</Text>
                  <Text className="location-picker-text">
                    {loc.province} {loc.city} {loc.district}
                  </Text>
                  {currentLocation === loc && (
                    <Text className="location-picker-check">✓</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* 品牌信息 */}
          <View className="brand-row">
            <View className="brand-left">
              <Text className="brand-greeting">
                {greeting()}，守望者
              </Text>
              <View className="brand-title-row">
                <Text className="brand-icon">🛡️</Text>
                <Text className="brand-title">守 望</Text>
              </View>
              <Text className="brand-subtitle">
                AI社会风险感知与社区关怀系统
              </Text>
            </View>
            <View className="brand-bell">
              <Text className="brand-bell-icon">🔔</Text>
              <View className="brand-bell-dot" />
            </View>
          </View>

          {/* 社区风险指数卡片 */}
          <View className="risk-card">
            <View className="risk-card-title-row">
              <Text className="risk-card-icon">📊</Text>
              <Text className="risk-card-title">社区整体风险指数</Text>
            </View>
            {loadingRisk ? (
              <View className="risk-card-loading">
                <Text className="risk-card-loading-icon animate-spin">⏳</Text>
              </View>
            ) : (
              riskData && (
                <>
                  <View className="risk-card-score-row">
                    <View className="risk-card-score-block">
                      <Text className="risk-card-score">{riskData.score}</Text>
                      <Text className="risk-card-level">
                        {riskData.level} · 一切安好
                      </Text>
                    </View>
                    <View className="risk-card-bar">
                      <View
                        className="risk-card-bar-inner"
                        style={{ width: `${riskData.score}%` }}
                      />
                    </View>
                  </View>
                  <View className="risk-card-footer">
                    <View className="risk-card-footer-left">
                      <Text className="risk-card-footer-icon">👁️</Text>
                      <Text className="risk-card-footer-text">
                        5大风险维度实时监测
                      </Text>
                    </View>
                    <View className="risk-card-footer-right">
                      <Text className="risk-card-footer-trend">
                        较昨日 {riskData.trend < 0 ? "↓" : "↑"}{" "}
                        {Math.abs(riskData.trend)}%
                      </Text>
                    </View>
                  </View>
                </>
              )
            )}
          </View>
        </View>
      </View>

      {/* 天气卡片 */}
      <View className="weather-card card-overlap">
        <View className="weather-header">
          <View className="weather-title-row">
            <Text className="weather-title-icon">🌡️</Text>
            <Text className="weather-title">今日天气</Text>
          </View>
          {weather && (
            <View className="weather-loc">
              <Text className="weather-loc-icon">📍</Text>
              <Text className="weather-loc-text">
                {currentLocation.city} {currentLocation.district}
              </Text>
            </View>
          )}
        </View>

        {loadingWeather ? (
          <View className="weather-loading">
            <Text className="weather-loading-icon animate-spin">⏳</Text>
            <Text className="weather-loading-text">加载天气中...</Text>
          </View>
        ) : (
          weather && (
            <>
              <View className="weather-main">
                <Text className="weather-icon">{weather.icon}</Text>
                <View className="weather-main-info">
                  <View className="weather-temp-row">
                    <Text className="weather-temp">{weather.outdoorTemp}°</Text>
                    <Text className="weather-desc">{weather.weather}</Text>
                  </View>
                  <Text className="weather-feel">
                    体感 {weather.feelsLike}°C · {weather.wind}
                  </Text>
                </View>
                <View className="weather-side">
                  <View className="weather-side-item">
                    <View className="weather-side-icon weather-side-icon-orange">
                      <Text>🌡️</Text>
                    </View>
                    <View className="weather-side-text">
                      <Text className="weather-side-label">室外</Text>
                      <Text className="weather-side-value">
                        {weather.outdoorTemp}°C
                      </Text>
                    </View>
                  </View>
                  <View className="weather-side-item">
                    <View className="weather-side-icon weather-side-icon-blue">
                      <Text>🏠</Text>
                    </View>
                    <View className="weather-side-text">
                      <Text className="weather-side-label">室内</Text>
                      <Text className="weather-side-value">
                        {weather.indoorTemp}°C
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="weather-stats">
                <View className="weather-stat-item">
                  <Text className="weather-stat-icon">💧</Text>
                  <Text className="weather-stat-text">
                    湿度 {weather.humidity}%
                  </Text>
                </View>
                <View className="weather-stat-divider" />
                <View className="weather-stat-item">
                  <Text className="weather-stat-icon">🌬️</Text>
                  <Text className="weather-stat-text">{weather.wind}</Text>
                </View>
                <View className="weather-stat-divider" />
                <View className="weather-stat-item">
                  <View
                    className={`weather-aqi-badge ${
                      weather.aqi <= 50
                        ? "weather-aqi-green"
                        : weather.aqi <= 100
                        ? "weather-aqi-yellow"
                        : "weather-aqi-orange"
                    }`}
                  >
                    <Text>!</Text>
                  </View>
                  <Text className="weather-stat-text">
                    空气 {weather.aqiLevel}
                  </Text>
                </View>
              </View>
            </>
          )
        )}
      </View>

      {/* 风险感知模块 */}
      <View className="modules-card">
        <View className="modules-header">
          <View className="modules-title-row">
            <Text className="modules-title-icon">⚡</Text>
            <Text className="modules-title">风险感知模块</Text>
          </View>
          <Text className="modules-tip">点击查看详情</Text>
        </View>
        <View className="modules-list">
          {riskModules.map((m) => (
            <View
              key={m.id}
              className="module-item"
              onClick={() => handleNavigate(m.path)}
            >
              <View className={`module-icon ${m.gradient}`}>
                <Text className="module-icon-emoji">{m.icon}</Text>
              </View>
              <View className="module-info">
                <View className="module-title-row">
                  <Text className="module-title">{m.title}</Text>
                  <Text className="module-subtitle">{m.subtitle}</Text>
                </View>
                <Text className="module-desc">{m.desc}</Text>
              </View>
              <View className="module-right">
                <Text className="module-level">{m.level}</Text>
                <Text className="module-arrow">›</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 风险预警 */}
      <View className="alerts-section">
        <View className="alerts-header">
          <Text className="alerts-title">风险预警</Text>
          <View className="alerts-more">
            <Text className="alerts-more-text">全部</Text>
            <Text className="alerts-more-arrow">›</Text>
          </View>
        </View>
        <View className="alerts-list">
          {alerts.map((alert) => (
            <View key={alert.id} className="alert-item">
              <View
                className={`alert-icon ${
                  alert.type === "warning"
                    ? "alert-icon-warning"
                    : "alert-icon-info"
                }`}
              >
                <Text>{alert.icon}</Text>
              </View>
              <View className="alert-content">
                <View className="alert-title-row">
                  <Text className="alert-title">{alert.title}</Text>
                  <Text className="alert-module">{alert.module}</Text>
                </View>
                <Text className="alert-desc">{alert.desc}</Text>
                <Text className="alert-time">{alert.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 今日数据 */}
      <View className="stats-section">
        <Text className="stats-title">今日数据</Text>
        <View className="stats-grid">
          <View className="stat-item">
            <Text className="stat-value">
              {riskData?.monitoredCount || "--"}
              <Text className="stat-unit">人</Text>
            </Text>
            <Text className="stat-label">监测人群</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value">
              {riskData?.alertCount?.toString() || "--"}
              <Text className="stat-unit">条</Text>
            </Text>
            <Text className="stat-label">风险预警</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value">
              {riskData ? `${riskData.responseRate}%` : "--"}
            </Text>
            <Text className="stat-label">响应及时率</Text>
          </View>
        </View>
      </View>
      <TabBar current="home" />
    </View>
  );
}
