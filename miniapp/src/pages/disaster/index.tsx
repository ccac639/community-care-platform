import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Map } from "@tarojs/components";
import { assessDisasterRisk, type DisasterRiskResult } from "@/core/ai";
import { shelters, type Shelter } from "@/data/mockData";
import "./index.scss";

const disasterIcons: Record<string, string> = {
  earthquake: "🌋",
  fire: "🔥",
  flood: "🌊",
  typhoon: "🌀",
};

const shelterTypeIcons: Record<Shelter["type"], string> = {
  park: "🌳",
  school: "🏫",
  stadium: "🏟️",
  community: "🏢",
};

const shelterTypeLabels: Record<Shelter["type"], string> = {
  park: "公园",
  school: "学校",
  stadium: "体育馆",
  community: "社区中心",
};

const emergencyContacts = [
  { name: "火警", phone: "119", icon: "🚒" },
  { name: "急救", phone: "120", icon: "🚑" },
  { name: "报警", phone: "110", icon: "🚓" },
  { name: "社区服务", phone: "12345", icon: "🏢" },
];

interface LevelCfg {
  color: string;
  bg: string;
  border: string;
  iconBg: string;
  label: string;
  desc: string;
}

const levelConfig: Record<DisasterRiskResult["overallLevel"], LevelCfg> = {
  safe: {
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    iconBg: "#22c55e",
    label: "整体安全",
    desc: "社区暂无重大灾害风险",
  },
  low: {
    color: "#a16207",
    bg: "#fffbeb",
    border: "#fde68a",
    iconBg: "#eab308",
    label: "低风险",
    desc: "部分区域需关注",
  },
  medium: {
    color: "#c2410c",
    bg: "#fff7ed",
    border: "#fed7aa",
    iconBg: "#f97316",
    label: "中风险",
    desc: "请注意防护",
  },
  high: {
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
    iconBg: "#ef4444",
    label: "高风险",
    desc: "请立即采取应急措施",
  },
};

// 默认用户位置（社区中心）
const userLocation = { lng: 116.412, lat: 39.92 };

// 计算两点间直线距离（Haversine公式，返回米）
function calcDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

function formatDistance(m: number): string {
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

export default function Disaster() {
  const [riskData, setRiskData] = useState<DisasterRiskResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await assessDisasterRisk();
      if (active) {
        setRiskData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleBack = () => {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: "/pages/home/index" });
    });
  };

  const handleCall = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone }).catch(() => {});
  };

  const handleShelterClick = (shelter: Shelter) => {
    setSelectedShelter(shelter);
  };

  const closeMap = () => {
    setSelectedShelter(null);
  };

  const levelCfg = riskData ? levelConfig[riskData.overallLevel] : levelConfig.safe;

  // 地图标记点：所有避难所
  const markers = shelters.map((s, idx) => ({
    id: idx + 1,
    longitude: s.lng,
    latitude: s.lat,
    title: s.name,
    width: 32,
    height: 32,
    callout: {
      content: s.name,
      color: "#1f2937",
      fontSize: 12,
      borderRadius: 8,
      bgColor: "#ffffff",
      padding: 6,
      display: "ALWAYS" as const,
    },
  }));

  // 选中的避难所距离
  const selectedDistance = selectedShelter
    ? calcDistance(
        userLocation.lat,
        userLocation.lng,
        selectedShelter.lat,
        selectedShelter.lng
      )
    : 0;

  return (
    <View className="disaster-page">
      {/* 顶部橙色渐变背景 */}
      <View className="header">
        <View className="header-deco header-deco-1" />
        <View className="header-deco header-deco-2" />
        <View className="header-content">
          <View className="header-title-row">
            <View className="back-btn" onClick={handleBack}>
              <Text className="back-icon">←</Text>
            </View>
            <View className="title-row">
              <Text className="title-icon">🚨</Text>
              <Text className="title">灾害预警</Text>
            </View>
          </View>
          <Text className="header-subtitle">
            实时监测，提前预警，守护社区安全
          </Text>
        </View>
      </View>

      <View className="content">
        {/* 当前风险等级 */}
        <View className="card risk-card">
          <View className="card-header">
            <Text className="card-header-icon">📊</Text>
            <Text className="card-header-title">当前风险等级</Text>
          </View>
          {loading ? (
            <View className="loading-wrap">
              <Text className="loading-icon animate-spin">⏳</Text>
              <Text className="loading-text">AI评估中...</Text>
            </View>
          ) : (
            <View
              className="risk-level-box"
              style={{ background: levelCfg.bg, borderColor: levelCfg.border }}
            >
              <View
                className="risk-level-icon"
                style={{ background: levelCfg.iconBg }}
              >
                <Text className="risk-level-emoji">🛡️</Text>
              </View>
              <View className="risk-level-info">
                <Text className="risk-level-label" style={{ color: levelCfg.color }}>
                  {levelCfg.label}
                </Text>
                <Text className="risk-level-desc" style={{ color: levelCfg.color }}>
                  {levelCfg.desc}
                </Text>
              </View>
              {riskData && (
                <View className="risk-level-score">
                  <Text
                    className="risk-level-score-value"
                    style={{ color: levelCfg.color }}
                  >
                    {riskData.score}
                  </Text>
                  <Text className="risk-level-score-label">风险指数</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 灾害类型监测 */}
        <View className="card">
          <View className="card-header">
            <Text className="card-header-icon">⚡</Text>
            <Text className="card-header-title">灾害类型监测</Text>
          </View>
          <View className="disaster-types-grid">
            {(riskData?.types || []).map((d) => (
              <View key={d.id} className="disaster-type-item">
                <Text className="disaster-type-icon">
                  {disasterIcons[d.id] || "⚠️"}
                </Text>
                <Text className="disaster-type-name">{d.name}</Text>
                <Text className="disaster-type-level">{d.level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 紧急联系电话 */}
        <View className="card">
          <View className="card-header">
            <Text className="card-header-icon">📞</Text>
            <Text className="card-header-title">紧急联系电话</Text>
          </View>
          <View className="contacts-grid">
            {emergencyContacts.map((c) => (
              <View
                key={c.name}
                className="contact-item"
                onClick={() => handleCall(c.phone)}
              >
                <Text className="contact-icon">{c.icon}</Text>
                <View className="contact-info">
                  <Text className="contact-name">{c.name}</Text>
                  <Text className="contact-phone">{c.phone}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 社区避难场所 */}
        <View className="card">
          <View className="card-header">
            <Text className="card-header-icon">🏃</Text>
            <Text className="card-header-title">社区避难场所</Text>
          </View>
          <View className="shelter-list">
            {shelters.map((s) => {
              const distance = calcDistance(
                userLocation.lat,
                userLocation.lng,
                s.lat,
                s.lng
              );
              return (
                <View
                  key={s.id}
                  className="shelter-item"
                  onClick={() => handleShelterClick(s)}
                >
                  <View className="shelter-item-icon">
                    <Text className="shelter-item-emoji">
                      {shelterTypeIcons[s.type]}
                    </Text>
                  </View>
                  <View className="shelter-item-info">
                    <Text className="shelter-item-name">{s.name}</Text>
                    <View className="shelter-item-meta">
                      <Text className="shelter-item-capacity">
                        可容纳 {s.capacity.toLocaleString()} 人
                      </Text>
                      <Text className="shelter-item-type">
                        {shelterTypeLabels[s.type]}
                      </Text>
                    </View>
                    <Text className="shelter-item-distance">
                      📍 距您 {formatDistance(distance)}
                    </Text>
                  </View>
                  <Text className="shelter-item-arrow">›</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 应急广播 */}
        <View className="broadcast-card">
          <View className="broadcast-row">
            <Text className="broadcast-icon">📻</Text>
            <View className="broadcast-content">
              <Text className="broadcast-title">应急广播</Text>
              <Text className="broadcast-text">
                灾害发生时，社区将通过广播、短信、APP推送等多渠道发布预警信息，请保持手机畅通，关注官方通知。
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 避难所地图弹窗 */}
      {selectedShelter && (
        <View className="map-mask">
          <View className="map-popup">
            <View className="map-popup-header">
              <View className="map-popup-title-row">
                <Text className="map-popup-icon">📍</Text>
                <Text className="map-popup-title">避难所导航</Text>
              </View>
              <View className="map-popup-close" onClick={closeMap}>
                <Text className="map-popup-close-icon">✕</Text>
              </View>
            </View>
            <View className="map-wrap">
              <Map
                className="map-component"
                longitude={selectedShelter.lng}
                latitude={selectedShelter.lat}
                scale={15}
                markers={markers}
                showLocation
              />
            </View>
            <View className="map-info">
              <View className="map-info-header">
                <Text className="map-info-icon">
                  {shelterTypeIcons[selectedShelter.type]}
                </Text>
                <View className="map-info-title-wrap">
                  <Text className="map-info-name">{selectedShelter.name}</Text>
                  <Text className="map-info-addr">
                    {selectedShelter.address}
                  </Text>
                </View>
              </View>
              <View className="map-info-stats">
                <View className="map-info-stat">
                  <Text className="map-info-stat-label">直线距离</Text>
                  <Text className="map-info-stat-value">
                    {formatDistance(selectedDistance)}
                  </Text>
                </View>
                <View className="map-info-stat-divider" />
                <View className="map-info-stat">
                  <Text className="map-info-stat-label">容纳人数</Text>
                  <Text className="map-info-stat-value">
                    {selectedShelter.capacity.toLocaleString()}人
                  </Text>
                </View>
                <View className="map-info-stat-divider" />
                <View className="map-info-stat">
                  <Text className="map-info-stat-label">场所类型</Text>
                  <Text className="map-info-stat-value">
                    {shelterTypeLabels[selectedShelter.type]}
                  </Text>
                </View>
              </View>
              <View className="map-route-tip">
                <Text className="map-route-tip-icon">🧭</Text>
                <Text className="map-route-tip-text">
                  建议步行前往，预计路程约{" "}
                  {formatDistance(Math.round(selectedDistance * 1.3))}，请沿主干道行走注意安全
                </Text>
              </View>
              <View className="map-navigate-btn" onClick={() => handleCall("110")}>
                <Text className="map-navigate-btn-icon">🚨</Text>
                <Text className="map-navigate-btn-text">紧急求助</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
