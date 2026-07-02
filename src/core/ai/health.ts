// 健康风险 — AI能力模块
import type { SymptomAnalysisResult } from "./types";
import { delay } from "./_utils";

/**
 * AI症状初筛分析
 * 根据用户选择的症状，匹配罕见病数据库并返回概率排名
 */
export async function analyzeSymptoms(symptoms: string[]): Promise<SymptomAnalysisResult> {
  await delay(2500);

  const diseaseDB = [
    { id: "1", name: "成骨不全症", alias: "脆骨病", probability: 87, affectedAreas: ["bone", "spine", "leg"], matchKeywords: ["易骨折", "蓝巩膜", "听力下降", "关节松弛", "身材矮小", "骨骼畸形", "皮肤白皙"] },
    { id: "2", name: "白化病", alias: "白斑病", probability: 23, affectedAreas: ["skin", "eye"], matchKeywords: ["皮肤白皙", "视力异常"] },
    { id: "3", name: "渐冻症", alias: "ALS", probability: 12, affectedAreas: ["spine", "arm", "leg"], matchKeywords: ["肌肉无力", "关节松弛"] },
  ];

  const results = diseaseDB
    .map((d) => {
      const matchCount = symptoms.filter((s) => d.matchKeywords.includes(s)).length;
      const adjustedProbability = Math.min(95, Math.max(5, d.probability * (0.5 + matchCount / d.matchKeywords.length)));
      return { ...d, probability: Math.round(adjustedProbability) };
    })
    .sort((a, b) => b.probability - a.probability);

  return { diseases: results };
}
