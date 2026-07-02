/**
 * 守望 — 统一AI能力层 (src/core/ai)
 * 所有AI调用必须通过此模块，禁止在UI组件中硬编码AI逻辑
 *
 * 模块划分：
 * - health.ts     健康风险（症状初筛）
 * - food.ts       生活风险（食品安全）
 * - disaster.ts   社会风险（灾害预警）
 * - psychology.ts 心理风险（AI陪伴/对话）
 * - community.ts  社区风险指数
 * - weather.ts    天气数据
 */

// 类型
export type {
  SymptomAnalysisResult,
  FoodAnalysisResult,
  ChatResult,
  VideoSubtitleResult,
  DisasterRiskResult,
  CommunityRiskResult,
  WeatherData,
} from "./types";

// 健康风险
export { analyzeSymptoms } from "./health";

// 生活风险
export { analyzeFoodLabel } from "./food";

// 社会风险
export { assessDisasterRisk } from "./disaster";

// 心理风险
export { chat, generateVideoSubtitle } from "./psychology";

// 社区风险
export { getCommunityRiskIndex } from "./community";

// 天气
export { getCurrentWeather } from "./weather";
