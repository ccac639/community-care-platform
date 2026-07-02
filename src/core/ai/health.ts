// 健康风险 — AI能力模块
import type { SymptomAnalysisResult, HealthChatResult, HealthTimelineEntry } from "./types";
import { delay } from "./_utils";

/**
 * AI症状初筛分析（旧版，保留兼容）
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

// ==================== 聊天式健康分析 ====================

// 症状关键词库
const symptomKeywords: Record<string, string> = {
  "骨折": "易骨折", "容易骨折": "易骨折", "骨裂": "易骨折", "摔跤": "易骨折",
  "蓝": "蓝巩膜", "眼白发蓝": "蓝巩膜", "巩膜": "蓝巩膜",
  "听不清": "听力下降", "听力": "听力下降", "耳背": "听力下降",
  "关节": "关节松弛", "脱臼": "关节松弛", "关节松": "关节松弛",
  "矮": "身材矮小", "个子小": "身材矮小", "长不高": "身材矮小",
  "畸形": "骨骼畸形", "弯曲": "骨骼畸形", "脊柱侧弯": "骨骼畸形",
  "白": "皮肤白皙", "皮肤白": "皮肤白皙", "肤色浅": "皮肤白皙",
  "看不清": "视力异常", "视力": "视力异常", "眼睛": "视力异常", "畏光": "视力异常",
  "无力": "肌肉无力", "没力气": "肌肉无力", "肌肉萎缩": "肌肉无力", "手脚没劲": "肌肉无力",
  "焦虑": "焦虑", "紧张": "焦虑", "担心": "焦虑",
  "抑郁": "情绪低落", "低落": "情绪低落", "不开心": "情绪低落", "沮丧": "情绪低落", "难过": "情绪低落",
  "失眠": "失眠", "睡不着": "失眠", "睡眠": "失眠",
  "头痛": "头痛", "头晕": "头痛", "头疼": "头痛",
  "胃痛": "胃部不适", "肚子痛": "胃部不适", "胃": "胃部不适", "恶心": "胃部不适", "呕吐": "胃部不适",
  "心慌": "心悸", "心跳": "心悸", "胸闷": "心悸", "胸痛": "心悸",
  "发烧": "发热", "发热": "发热", "体温": "发热",
};

// 疾病数据库
const diseaseDB = [
  { name: "成骨不全症", keywords: ["易骨折", "蓝巩膜", "听力下降", "关节松弛", "身材矮小", "骨骼畸形", "皮肤白皙"], areas: ["bone", "spine", "leg"], isPhysical: true },
  { name: "渐冻症", keywords: ["肌肉无力", "关节松弛"], areas: ["spine", "arm", "leg"], isPhysical: true },
  { name: "白化病", keywords: ["皮肤白皙", "视力异常"], areas: ["skin", "eye"], isPhysical: true },
  { name: "焦虑症", keywords: ["焦虑", "失眠", "心悸"], areas: [], isPhysical: false },
  { name: "抑郁症", keywords: ["情绪低落", "失眠", "头痛"], areas: [], isPhysical: false },
  { name: "偏头痛", keywords: ["头痛", "视力异常"], areas: ["head"], isPhysical: true },
  { name: "胃炎", keywords: ["胃部不适", "恶心"], areas: ["stomach"], isPhysical: true },
];

// 快捷症状列表
export const symptomList = [
  { id: "fracture", label: "容易骨折", category: "身体" },
  { id: "blue_sclera", label: "蓝巩膜", category: "身体" },
  { id: "hearing", label: "听力下降", category: "身体" },
  { id: "joint", label: "关节松弛", category: "身体" },
  { id: "short", label: "身材矮小", category: "身体" },
  { id: "deformity", label: "骨骼畸形", category: "身体" },
  { id: "pale", label: "皮肤白皙", category: "身体" },
  { id: "vision", label: "视力异常", category: "身体" },
  { id: "weak", label: "肌肉无力", category: "身体" },
  { id: "headache", label: "头痛头晕", category: "身体" },
  { id: "stomach", label: "胃部不适", category: "身体" },
  { id: "anxiety", label: "焦虑紧张", category: "心理" },
  { id: "depression", label: "情绪低落", category: "心理" },
  { id: "insomnia", label: "失眠", category: "心理" },
];

/**
 * AI聊天式健康分析
 * 通过用户描述，AI实时识别症状、评估风险、判断是否为身体疾病
 */
export async function healthChat(
  userMessage: string,
  _history: { role: string; content: string }[]
): Promise<HealthChatResult> {
  await delay(1000);

  // 1. 从用户消息中提取症状
  const identifiedSymptoms: string[] = [];
  for (const [keyword, symptom] of Object.entries(symptomKeywords)) {
    if (userMessage.includes(keyword) && !identifiedSymptoms.includes(symptom)) {
      identifiedSymptoms.push(symptom);
    }
  }

  // 2. 匹配疾病数据库
  const matchedDiseases = diseaseDB
    .map((d) => {
      const matchCount = d.keywords.filter((k) => identifiedSymptoms.includes(k)).length;
      if (matchCount === 0) return null;
      const probability = Math.min(95, Math.round(30 + matchCount * 20));
      return { name: d.name, probability, areas: d.areas, isPhysical: d.isPhysical, keywords: d.keywords };
    })
    .filter(Boolean)
    .sort((a, b) => b!.probability - a!.probability);

  const topDisease = matchedDiseases[0];
  const isPhysical = topDisease?.isPhysical ?? false;
  const affectedAreas = topDisease?.areas ?? [];

  // 3. 风险评估
  let riskScore = 15;
  let riskLevel: "low" | "medium" | "high" = "low";
  let riskSummary = "暂无明显健康风险，请继续描述您的症状。";

  if (identifiedSymptoms.length > 0) {
    riskScore = Math.min(95, 20 + identifiedSymptoms.length * 15 + (topDisease ? 15 : 0));
    if (riskScore >= 70) {
      riskLevel = "high";
      riskSummary = topDisease
        ? `检测到${identifiedSymptoms.length}个症状，高度疑似${topDisease.name}，建议尽快就医检查。`
        : `检测到${identifiedSymptoms.length}个症状，健康风险较高，建议就医咨询。`;
    } else if (riskScore >= 40) {
      riskLevel = "medium";
      riskSummary = topDisease
        ? `检测到${identifiedSymptoms.length}个症状，可能为${topDisease.name}，建议进一步检查确认。`
        : `检测到${identifiedSymptoms.length}个症状，存在一定健康风险，建议关注。`;
    } else {
      riskSummary = `检测到${identifiedSymptoms.length}个症状，目前风险较低，请继续描述更多细节。`;
    }
  }

  // 4. 生成AI回复
  let reply = "";
  if (identifiedSymptoms.length === 0) {
    reply = "您好，我是AI健康助手。请描述您目前的不适症状，比如哪里不舒服、持续多久了？您可以详细告诉我，也可以点击下方的快捷症状。";
  } else if (isPhysical && topDisease) {
    reply = `根据您的描述，我识别到以下症状：${identifiedSymptoms.join("、")}。这可能与${topDisease.name}相关（匹配度${topDisease.probability}%）。我已为您生成身体结构示意图，标注了可能受影响的区域。建议您前往附近医院做进一步检查。`;
  } else if (!isPhysical && topDisease) {
    reply = `根据您的描述，我识别到以下症状：${identifiedSymptoms.join("、")}。这可能与${topDisease.name}相关。这类问题通常不需要身体结构检查，建议您关注心理健康，必要时寻求专业心理咨询帮助。您可以到「社区陪伴」模块与AI伙伴倾诉。`;
  } else {
    reply = `我注意到您提到了：${identifiedSymptoms.join("、")}。请继续描述更多细节，比如症状持续的时间、是否有加重的情况？这有助于我更准确地评估。`;
  }

  return {
    reply,
    identifiedSymptoms,
    riskLevel,
    riskScore,
    riskSummary,
    isPhysical,
    affectedAreas,
    possibleDiseases: matchedDiseases.slice(0, 3).map((d) => ({ name: d!.name, probability: d!.probability })),
    timestamp: Date.now(),
  };
}

/**
 * 生成健康时间轴记录
 */
export function createTimelineEntry(
  result: HealthChatResult,
  prevSymptoms: string[]
): HealthTimelineEntry {
  const newSymptoms = result.identifiedSymptoms.filter((s) => !prevSymptoms.includes(s));

  if (newSymptoms.length > 0) {
    return {
      id: Date.now().toString(),
      timestamp: result.timestamp,
      type: "symptom",
      title: `识别到新症状：${newSymptoms.join("、")}`,
      desc: result.riskSummary,
      riskLevel: result.riskLevel,
    };
  }

  return {
    id: Date.now().toString(),
    timestamp: result.timestamp,
    type: "assessment",
    title: `健康评估更新`,
    desc: result.riskSummary,
    riskLevel: result.riskLevel,
  };
}
