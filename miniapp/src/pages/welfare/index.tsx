import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Text, ScrollView } from "@tarojs/components";
import TabBar from "@/components/TabBar";
import {
  calculateWelfareRisk,
  analyzeRiskTrend,
  generateSuggestions,
  type WelfareRiskResult,
  type RiskTrend,
  type RiskSuggestion,
} from "@/core/ai";
import "./index.scss";

type RegionLevel = "province" | "city" | "district";

interface RegionData {
  missingChildren: number;
  distressPeople: number;
  leftBehindChildren: number;
  helpEvents: number;
  aiReviewed: number;
}

const regionDataMap: Record<RegionLevel, RegionData> = {
  province: {
    missingChildren: 23,
    distressPeople: 156,
    leftBehindChildren: 1234,
    helpEvents: 567,
    aiReviewed: 489,
  },
  city: {
    missingChildren: 8,
    distressPeople: 67,
    leftBehindChildren: 456,
    helpEvents: 234,
    aiReviewed: 198,
  },
  district: {
    missingChildren: 2,
    distressPeople: 15,
    leftBehindChildren: 89,
    helpEvents: 67,
    aiReviewed: 58,
  },
};

const regionLabels: Record<RegionLevel, string> = {
  province: "全省",
  city: "全市",
  district: "全区",
};

const crisisEvents = [
  {
    id: 1,
    type: "失踪",
    typeColor: "#dc2626",
    title: "XX区一名8岁男童走失",
    desc: "今天下午4点左右在XX公园走失，身穿蓝色上衣。",
    time: "2小时前",
    status: "紧急",
    statusColor: "#dc2626",
  },
  {
    id: 2,
    type: "危难",
    typeColor: "#ea580c",
    title: "独居老人突发疾病求助",
    desc: "XX小区王奶奶在家中突发头晕，子女不在身边。",
    time: "5小时前",
    status: "处理中",
    statusColor: "#ea580c",
  },
  {
    id: 3,
    type: "儿童",
    typeColor: "#ca8a04",
    title: "留守儿童心理健康关注",
    desc: "XX村3名留守儿童长期缺乏父母陪伴，需要心理关怀。",
    time: "1天前",
    status: "跟进中",
    statusColor: "#ca8a04",
  },
];

const heatZones = [
  { id: 1, name: "朝阳区", risk: "high", count: 12 },
  { id: 2, name: "海淀区", risk: "medium", count: 8 },
  { id: 3, name: "西城区", risk: "low", count: 4 },
  { id: 4, name: "东城区", risk: "medium", count: 6 },
  { id: 5, name: "丰台区", risk: "low", count: 3 },
];

export default function Welfare() {
  const [regionLevel, setRegionLevel] = useState<RegionLevel>("district");
  const [riskData, setRiskData] = useState<WelfareRiskResult | null>(null);
  const [riskTrend, setRiskTrend] = useState<RiskTrend | null>(null);
  const [suggestions, setSuggestions] = useState<RiskSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      const data = regionDataMap[regionLevel];
      const [risk, trend, sugg] = await Promise.all([
        calculateWelfareRisk(data),
        analyzeRiskTrend(),
        generateSuggestions(),
      ]);
      if (active) {
        setRiskData(risk);
        setRiskTrend(trend);
        setSuggestions(sugg);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [regionLevel]);

  const handleRegionChange = (level: RegionLevel) => {
    setRegionLevel(level);
  };

  const handleHelp = () => {
    Taro.showModal({
      title: "公益帮助",
      content: "请拨打公益服务热线：400-123-4567，或前往社区服务中心咨询。",
      showCancel: false,
    });
  };

  const handleReport = () => {
    Taro.showActionSheet({
      itemList: ["人员走失", "危难求助", "儿童困境", "其他事件"],
      success: (res) => {
        Taro.showToast({
          title: "已收到您的上报，我们会尽快处理",
          icon: "success",
        });
      },
    });
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-low";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return "低";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#22c55e";
      default:
        return "#9ca3af";
    }
  };

  const scoreColor = riskData
    ? riskData.score >= 90
      ? "#10b981"
      : riskData.score >= 70
      ? "#22c55e"
      : riskData.score >= 50
      ? "#f59e0b"
      : "#ef4444"
    : "#22c55e";

  return (
    <View className="welfare-page">
      <View className="nav-bar">
        <Text className="nav-title">爱心公益中心</Text>
      </View>

      <ScrollView className="scroll-content" scrollY>
        <View className="header-card">
          <View className="header-bg" />
          <View className="header-content">
            <View className="header-title-row">
              <Text className="header-icon">❤️</Text>
              <View>
                <Text className="header-title">公益安全监测</Text>
                <Text className="header-subtitle">守护每一个需要帮助的人</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="region-tabs">
          {(Object.keys(regionLabels) as RegionLevel[]).map((level) => (
            <View
              key={level}
              className={`region-tab ${regionLevel === level ? "active" : ""}`}
              onClick={() => handleRegionChange(level)}
            >
              <Text>{regionLabels[level]}</Text>
            </View>
          ))}
        </View>

        {loading || !riskData ? (
          <View className="loading-state">
            <Text className="loading-icon">⏳</Text>
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : (
          <>
            <View className="score-card">
              <View className="score-circle" style={{ borderColor: scoreColor }}>
                <Text className="score-value" style={{ color: scoreColor }}>
                  {riskData.score}
                </Text>
                <Text className="score-label">{riskData.levelLabel}</Text>
              </View>
              <View className="score-stats">
                <View className="score-stat">
                  <Text className="stat-value">{riskData.breakdown.helpEvents}</Text>
                  <Text className="stat-label">求助事件</Text>
                </View>
                <View className="score-stat">
                  <Text className="stat-value">{riskData.breakdown.handledRate}%</Text>
                  <Text className="stat-label">AI甄别率</Text>
                </View>
              </View>
            </View>

            <View className="data-grid">
              <View className="data-item">
                <Text className="data-icon">👶</Text>
                <Text className="data-value">{riskData.breakdown.missingChildren}</Text>
                <Text className="data-label">失踪儿童</Text>
              </View>
              <View className="data-item">
                <Text className="data-icon">🆘</Text>
                <Text className="data-value">{riskData.breakdown.distressPeople}</Text>
                <Text className="data-label">危难人群</Text>
              </View>
              <View className="data-item">
                <Text className="data-icon">🧒</Text>
                <Text className="data-value">{riskData.breakdown.leftBehindChildren}</Text>
                <Text className="data-label">留守儿童</Text>
              </View>
            </View>

            <View className="section">
              <View className="section-header">
                <Text className="section-icon">🚨</Text>
                <Text className="section-title">危机事件</Text>
              </View>
              <View className="event-list">
                {crisisEvents.map((event) => (
                  <View key={event.id} className="event-item">
                    <View className="event-left">
                      <View className="event-type" style={{ background: event.typeColor }}>
                        <Text>{event.type}</Text>
                      </View>
                      <View className="event-info">
                        <Text className="event-title">{event.title}</Text>
                        <Text className="event-desc">{event.desc}</Text>
                        <Text className="event-time">{event.time}</Text>
                      </View>
                    </View>
                    <View className="event-status" style={{ background: `${event.statusColor}20`, color: event.statusColor }}>
                      <Text>{event.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className="section">
              <View className="section-header">
                <Text className="section-icon">🗺️</Text>
                <Text className="section-title">区域风险分布</Text>
              </View>
              <View className="heat-map">
                {heatZones.map((zone) => (
                  <View key={zone.id} className="heat-zone">
                    <View className="heat-bar-wrap">
                      <View className="heat-bar" style={{ width: `${zone.count * 8}%`, background: getRiskColor(zone.risk) }} />
                    </View>
                    <View className="heat-info">
                      <Text className="heat-name">{zone.name}</Text>
                      <Text className="heat-count" style={{ color: getRiskColor(zone.risk) }}>{zone.count}例</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View className="heat-legend">
                <View className="legend-item">
                  <View className="legend-dot" style={{ background: "#ef4444" }} />
                  <Text>高风险</Text>
                </View>
                <View className="legend-item">
                  <View className="legend-dot" style={{ background: "#f59e0b" }} />
                  <Text>中风险</Text>
                </View>
                <View className="legend-item">
                  <View className="legend-dot" style={{ background: "#22c55e" }} />
                  <Text>低风险</Text>
                </View>
              </View>
            </View>

            {riskTrend && (
              <View className="section">
                <View className="section-header">
                  <Text className="section-icon">📈</Text>
                  <Text className="section-title">风险趋势</Text>
                </View>
                <View className="trend-list">
                  {riskTrend.trends.map((trend, idx) => (
                    <View key={idx} className="trend-item">
                      <Text className="trend-name">{trend.category}</Text>
                      <View className="trend-bar-wrap">
                        <View className="trend-bar" style={{ width: `${Math.min(trend.current / 5, 100)}%` }} />
                      </View>
                      <Text className={`trend-change ${trend.trend === "up" ? "up" : "down"}`}>
                        {trend.trend === "up" ? "↑" : "↓"}
                        {Math.abs(trend.change)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className="section">
              <View className="section-header">
                <Text className="section-icon">💡</Text>
                <Text className="section-title">AI建议</Text>
              </View>
              <View className="suggestion-list">
                {suggestions.map((s) => (
                  <View key={s.id} className="suggestion-item">
                    <View className={`suggestion-priority ${getPriorityClass(s.priority)}`}>
                      <Text>{getPriorityLabel(s.priority)}</Text>
                    </View>
                    <View className="suggestion-content">
                      <Text className="suggestion-title">{s.title}</Text>
                      <Text className="suggestion-desc">{s.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className="bottom-space" />
          </>
        )}
      </ScrollView>

      <View className="action-bar">
        <View className="action-btn secondary" onClick={handleHelp}>
          <Text className="action-icon">💝</Text>
          <Text className="action-text">寻求帮助</Text>
        </View>
        <View className="action-btn primary" onClick={handleReport}>
          <Text className="action-icon">📢</Text>
          <Text className="action-text">我要上报</Text>
        </View>
      </View>

      <TabBar current="welfare" />
    </View>
  );
}
