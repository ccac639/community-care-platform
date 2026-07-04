import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Text, ScrollView, Map } from "@tarojs/components";
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
    desc: "今天下午4点左右在XX公园走失，身穿蓝色上衣，家长已报警，请附近居民留意。",
    time: "2小时前",
    status: "紧急",
  },
  {
    id: 2,
    type: "危难",
    typeColor: "#ea580c",
    title: "独居老人突发疾病求助",
    desc: "XX小区王奶奶在家中突发头晕，子女不在身边，社区志愿者已前往协助。",
    time: "5小时前",
    status: "处理中",
  },
  {
    id: 3,
    type: "儿童",
    typeColor: "#ca8a04",
    title: "留守儿童心理健康关注",
    desc: "XX村3名留守儿童长期缺乏父母陪伴，出现情绪低落，需要心理关怀。",
    time: "1天前",
    status: "跟进中",
  },
  {
    id: 4,
    type: "求助",
    typeColor: "#2563eb",
    title: "困难家庭物资求助",
    desc: "XX社区张女士家遭遇变故，急需生活物资和医疗费用帮助。",
    time: "2天前",
    status: "已响应",
  },
];

// 热力图数据（模拟风险点）
const heatMarkers = [
  { id: 1, longitude: 116.412, latitude: 39.92, title: "高风险区" },
  { id: 2, longitude: 116.42, latitude: 39.915, title: "中风险区" },
  { id: 3, longitude: 116.405, latitude: 39.925, title: "中风险区" },
  { id: 4, longitude: 116.418, latitude: 39.93, title: "低风险区" },
  { id: 5, longitude: 116.4, latitude: 39.91, title: "低风险区" },
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

  const handleBack = () => {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: "/pages/home/index" });
    });
  };

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

  const handleSpread = () => {
    Taro.showToast({
      title: "分享功能开发中",
      icon: "none",
    });
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return { label: "高优先级", className: "suggestion-priority-high" };
      case "medium":
        return { label: "中优先级", className: "suggestion-priority-medium" };
      case "low":
        return { label: "低优先级", className: "suggestion-priority-low" };
      default:
        return { label: "一般", className: "suggestion-priority-low" };
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

  const scoreBg = riskData
    ? riskData.score >= 90
      ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
      : riskData.score >= 70
      ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
      : riskData.score >= 50
      ? "linear-gradient(135deg, #fef3c7, #fde68a)"
      : "linear-gradient(135deg, #fee2e2, #fecaca)"
    : "linear-gradient(135deg, #dcfce7, #bbf7d0)";

  return (
    <View className="welfare-page">
      {/* 顶部红色渐变背景 */}
      <View className="header">
        <View className="header-deco header-deco-1" />
        <View className="header-deco header-deco-2" />
        <View className="header-content">
          <View className="header-title-row">
            <View className="back-btn" onClick={handleBack}>
              <Text className="back-icon">←</Text>
            </View>
            <View className="title-row">
              <Text className="title-icon">❤️</Text>
              <Text className="title">爱心公益中心</Text>
            </View>
          </View>
          <Text className="header-subtitle">
            公益安全监测 · 危机事件响应 · 爱心互助服务
          </Text>
        </View>
      </View>

      <View className="content">
        {/* 公益安全指数 */}
        <View className="card">
          <View className="card-header">
            <Text className="card-header-icon">📊</Text>
            <Text className="card-header-title">公益安全指数</Text>
          </View>

          {/* 区域切换 */}
          <View className="region-tabs">
            {(Object.keys(regionLabels) as RegionLevel[]).map((level) => (
              <View
                key={level}
                className={`region-tab ${
                  regionLevel === level ? "region-tab-active" : ""
                }`}
                onClick={() => handleRegionChange(level)}
              >
                <Text className="region-tab-text">
                  {regionLabels[level]}
                </Text>
              </View>
            ))}
          </View>

          {loading || !riskData ? (
            <View style={{ textAlign: "center", padding: 30 }}>
              <Text style={{ color: "#9ca3af" }}>加载中...</Text>
            </View>
          ) : (
            <>
              <View className="score-overview">
                <View
                  className="score-circle"
                  style={{ background: scoreBg }}
                >
                  <Text className="score-value" style={{ color: scoreColor }}>
                    {riskData.score}
                  </Text>
                  <Text className="score-label" style={{ color: scoreColor }}>
                    {riskData.levelLabel}
                  </Text>
                </View>
              </View>

              {/* 数据明细 */}
              <View className="breakdown-grid">
                <View className="breakdown-item">
                  <Text className="breakdown-icon">👶</Text>
                  <Text className="breakdown-value">
                    {riskData.breakdown.missingChildren}
                  </Text>
                  <Text className="breakdown-label">失踪儿童</Text>
                </View>
                <View className="breakdown-item">
                  <Text className="breakdown-icon">🆘</Text>
                  <Text className="breakdown-value">
                    {riskData.breakdown.distressPeople}
                  </Text>
                  <Text className="breakdown-label">危难人群</Text>
                </View>
                <View className="breakdown-item">
                  <Text className="breakdown-icon">🧒</Text>
                  <Text className="breakdown-value">
                    {riskData.breakdown.leftBehindChildren}
                  </Text>
                  <Text className="breakdown-label">留守儿童</Text>
                </View>
                <View className="breakdown-item">
                  <Text className="breakdown-icon">📞</Text>
                  <Text className="breakdown-value">
                    {riskData.breakdown.helpEvents}
                  </Text>
                  <Text className="breakdown-label">求助事件</Text>
                  <View className="breakdown-badge">
                    <Text className="breakdown-badge-text">
                      AI甄别 {riskData.breakdown.handledRate}%
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* 危机事件 */}
        <View className="card">
          <View className="card-header">
            <Text className="card-header-icon">🚨</Text>
            <Text className="card-header-title">危机事件</Text>
            <Text className="section-subtitle">← 左右滑动查看 →</Text>
          </View>
          <ScrollView className="crisis-scroll" scrollX>
            {crisisEvents.map((event) => (
              <View key={event.id} className="crisis-card">
                <View
                  className="crisis-type"
                  style={{ background: event.typeColor }}
                >
                  <Text className="crisis-type-text">{event.type}</Text>
                </View>
                <Text className="crisis-title">{event.title}</Text>
                <Text className="crisis-desc">{event.desc}</Text>
                <View className="crisis-meta">
                  <Text className="crisis-time">{event.time}</Text>
                  <View className="crisis-status">
                    <Text className="crisis-status-text">{event.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 公益分析 */}
        <View className="card">
          <View className="card-header">
            <Text className="card-header-icon">🤖</Text>
            <Text className="card-header-title">AI公益分析</Text>
          </View>

          {riskTrend && (
            <View className="analysis-section">
              <View className="analysis-summary">
                <Text className="analysis-summary-text">
                  💡 {riskTrend.summary}
                </Text>
              </View>

              <Text style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 12 }}>
                风险趋势（{riskTrend.period}）
              </Text>
              {riskTrend.trends.map((t, i) => (
                <View key={i} className="trend-item">
                  <Text className="trend-name">{t.category}</Text>
                  <View className="trend-bar-wrap">
                    <View
                      className="trend-bar"
                      style={{ width: `${Math.min(t.current / 5, 100)}%` }}
                    />
                  </View>
                  <Text
                    className="trend-change"
                    style={{
                      color: t.trend === "up" ? "#dc2626" : "#16a34a",
                    }}
                  >
                    {t.trend === "up" ? "↑" : "↓"}
                    {Math.abs(t.change)}%
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginTop: 16, marginBottom: 12 }}>
            AI建议
          </Text>
          {suggestions.map((s) => {
            const priority = getPriorityLabel(s.priority);
            return (
              <View key={s.id} className="suggestion-item">
                <View className="suggestion-header">
                  <View className={`suggestion-priority ${priority.className}`}>
                    {priority.label}
                  </View>
                  <Text className="suggestion-title">{s.title}</Text>
                </View>
                <Text className="suggestion-desc">{s.description}</Text>
              </View>
            );
          })}
        </View>

        {/* 社会事件热力图 */}
        <View className="heatmap-card">
          <View className="card-header">
            <Text className="card-header-icon">🗺️</Text>
            <Text className="card-header-title">区域风险热力图</Text>
          </View>
          <Text style={{ fontSize: 13, color: "#6b7280" }}>
            实时监测区域公益风险分布
          </Text>
          <View className="heatmap-wrap">
            <Map
              style={{ width: "100%", height: "100%" }}
              longitude={116.412}
              latitude={39.92}
              scale={14}
              markers={heatMarkers}
              enable3D={false}
              showCompass={false}
              enableZoom={false}
              enableScroll={false}
              enableRotate={false}
              enableSatellite={false}
              enableTraffic={false}
            />
          </View>
          <View className="heatmap-legend">
            <View className="heatmap-legend-item">
              <View
                className="heatmap-legend-dot"
                style={{ background: "#ef4444" }}
              />
              <Text className="heatmap-legend-text">高风险</Text>
            </View>
            <View className="heatmap-legend-item">
              <View
                className="heatmap-legend-dot"
                style={{ background: "#f59e0b" }}
              />
              <Text className="heatmap-legend-text">中风险</Text>
            </View>
            <View className="heatmap-legend-item">
              <View
                className="heatmap-legend-dot"
                style={{ background: "#22c55e" }}
              />
              <Text className="heatmap-legend-text">低风险</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 底部帮助中心 */}
      <View className="help-center">
        <View className="help-btn help-btn-secondary" onClick={handleHelp}>
          <Text className="help-btn-icon">💝</Text>
          <Text className="help-btn-text">寻求帮助</Text>
        </View>
        <View className="help-btn help-btn-primary" onClick={handleReport}>
          <Text className="help-btn-icon">📢</Text>
          <Text className="help-btn-text">我要上报</Text>
        </View>
        <View className="help-btn help-btn-outline" onClick={handleSpread}>
          <Text className="help-btn-icon">🔄</Text>
          <Text className="help-btn-text">扩散爱心</Text>
        </View>
      </View>
    </View>
  );
}
