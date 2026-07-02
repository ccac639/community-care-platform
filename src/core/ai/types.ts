// 统一AI能力层类型定义

// 健康风险 — 旧的初筛结果（保留兼容）
export interface SymptomAnalysisResult {
  diseases: {
    id: string;
    name: string;
    alias: string;
    probability: number;
    affectedAreas: string[];
  }[];
}

// 健康风险 — 聊天式健康分析
export interface HealthChatResult {
  reply: string;
  identifiedSymptoms: string[];
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  riskSummary: string;
  isPhysical: boolean;
  affectedAreas?: string[];
  possibleDiseases?: { name: string; probability: number }[];
  canDiagnose: boolean;
  timestamp: number;
}

// 健康风险 — 时间轴记录
export interface HealthTimelineEntry {
  id: string;
  timestamp: number;
  type: "symptom" | "assessment" | "alert";
  title: string;
  desc: string;
  riskLevel: "low" | "medium" | "high";
}

// 生活风险
export interface FoodAnalysisResult {
  productName: string;
  score: number;
  level: "safe" | "warning" | "danger";
  summary: string;
  ingredients: { name: string; risk: "safe" | "warning" | "danger"; desc: string }[];
  suggestions: string[];
}

// 心理风险
export interface ChatResult {
  content: string;
  emotion?: string;
}

export interface VideoSubtitleResult {
  subtitle: string;
}

// 社会风险
export interface DisasterRiskResult {
  overallLevel: "safe" | "low" | "medium" | "high";
  score: number;
  types: { id: string; name: string; level: string }[];
}

// 社区风险指数
export interface CommunityRiskResult {
  score: number;
  level: string;
  trend: number;
  monitoredCount: number;
  alertCount: number;
  responseRate: number;
}

// 天气
export interface WeatherData {
  city: string;
  weather: string;
  icon: string;
  outdoorTemp: number;
  indoorTemp: number;
  humidity: number;
  wind: string;
  aqi: number;
  aqiLevel: string;
  feelsLike: number;
}
