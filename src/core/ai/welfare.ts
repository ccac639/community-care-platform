import type { WelfareRiskResult, RiskTrend, RiskSuggestion } from "./types";
import { delay } from "./_utils";

export async function calculateWelfareRisk(stats: {
  missingChildren: number;
  distressPeople: number;
  leftBehindChildren: number;
  helpEvents: number;
  aiReviewed: number;
}): Promise<WelfareRiskResult> {
  await delay(800);

  const totalEvents = stats.missingChildren + stats.distressPeople + stats.leftBehindChildren;
  const handledRate = stats.helpEvents > 0 ? (stats.aiReviewed / stats.helpEvents) * 100 : 0;
  const eventDensity = stats.missingChildren * 10 + stats.distressPeople * 5 + stats.leftBehindChildren * 2;

  let rawScore = 100;
  rawScore -= Math.min(eventDensity, 40);
  rawScore += Math.min(handledRate * 0.3, 20);

  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  let level: "excellent" | "good" | "normal" | "poor" = "good";
  let levelLabel = "良好";
  let levelColor = "text-green-600";

  if (finalScore >= 90) {
    level = "excellent";
    levelLabel = "优秀";
    levelColor = "text-emerald-600";
  } else if (finalScore >= 70) {
    level = "good";
    levelLabel = "良好";
    levelColor = "text-green-600";
  } else if (finalScore >= 50) {
    level = "normal";
    levelLabel = "一般";
    levelColor = "text-amber-600";
  } else {
    level = "poor";
    levelLabel = "较差";
    levelColor = "text-red-600";
  }

  return {
    score: finalScore,
    level,
    levelLabel,
    levelColor,
    breakdown: {
      missingChildren: stats.missingChildren,
      distressPeople: stats.distressPeople,
      leftBehindChildren: stats.leftBehindChildren,
      helpEvents: stats.helpEvents,
      aiReviewed: stats.aiReviewed,
      handledRate: Math.round(handledRate),
    },
  };
}

export async function analyzeRiskTrend(): Promise<RiskTrend> {
  await delay(600);

  const trends = [
    {
      category: "失踪儿童",
      current: 23,
      previous: 28,
      change: -18,
      trend: "down",
    },
    {
      category: "危难人群",
      current: 67,
      previous: 62,
      change: 8,
      trend: "up",
    },
    {
      category: "留守儿童",
      current: 456,
      previous: 489,
      change: -7,
      trend: "down",
    },
    {
      category: "求助事件",
      current: 234,
      previous: 210,
      change: 11,
      trend: "up",
    },
  ];

  return {
    period: "本周",
    trends,
    summary: "整体公益风险呈稳定态势，失踪儿童数量下降明显，但危难人群求助略有上升，建议加强社区关怀力度。",
  };
}

export async function generateSuggestions(): Promise<RiskSuggestion[]> {
  await delay(500);

  return [
    {
      id: "s1",
      priority: "high",
      title: "加强失踪儿童预警机制",
      description: "建议在重点区域增加监控覆盖，建立儿童走失快速响应通道，提高社区居民的防范意识。",
    },
    {
      id: "s2",
      priority: "medium",
      title: "关注独居老人健康状况",
      description: "建议定期回访社区独居老人，建立健康档案，提供紧急呼叫设备，确保老人安全。",
    },
    {
      id: "s3",
      priority: "medium",
      title: "留守儿童关怀计划",
      description: "建议组织志愿者定期陪伴留守儿童，开展课外活动，关注他们的心理健康和学习情况。",
    },
    {
      id: "s4",
      priority: "low",
      title: "提升AI甄别准确率",
      description: "建议优化AI算法模型，提高求助事件的风险评估准确率，减少误报和漏报。",
    },
  ];
}
