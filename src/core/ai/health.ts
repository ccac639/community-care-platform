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
 * AI聊天式健康分析（渐进式问诊）
 * - 第1轮：问候引导，不做诊断
 * - 第2轮：识别症状后追问细节，不给出结论
 * - 第3轮+ 且症状≥3个：才给出初步评估、风险等级、身体结构图
 */
export async function healthChat(
  userMessage: string,
  history: { role: string; content: string }[]
): Promise<HealthChatResult> {
  await delay(1000);

  // 当前轮次（用户消息数 = 轮次）
  const userTurns = history.filter((m) => m.role === "user").length + 1;

  // 1. 从历史+当前消息中累计提取所有症状
  const allMessages = [...history.map((m) => m.content), userMessage].join(" ");
  const identifiedSymptoms: string[] = [];
  for (const [keyword, symptom] of Object.entries(symptomKeywords)) {
    if (allMessages.includes(keyword) && !identifiedSymptoms.includes(symptom)) {
      identifiedSymptoms.push(symptom);
    }
  }

  // 2. 本轮新识别的症状
  const newSymptoms: string[] = [];
  for (const [keyword, symptom] of Object.entries(symptomKeywords)) {
    if (userMessage.includes(keyword) && !identifiedSymptoms.includes(symptom)) {
      // 注意：这里重新计算本轮新症状
    }
  }
  // 重新计算：从历史消息中提取的旧症状
  const historyText = history.map((m) => m.content).join(" ");
  const oldSymptoms: string[] = [];
  for (const [keyword, symptom] of Object.entries(symptomKeywords)) {
    if (historyText.includes(keyword) && !oldSymptoms.includes(symptom)) {
      oldSymptoms.push(symptom);
    }
  }
  const currentNewSymptoms = identifiedSymptoms.filter((s) => !oldSymptoms.includes(s));

  // 3. 匹配疾病数据库（仅内部计算，不暴露给用户太早）
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
  const isPhysical = topDisease?.isPhysical ?? true;
  const affectedAreas = topDisease?.areas ?? [];

  // 4. 根据轮次 + 症状数量，决定输出级别
  const canDiagnose = userTurns >= 3 && identifiedSymptoms.length >= 3;
  const showSkeleton = canDiagnose && isPhysical;

  // 5. 风险评估（canDiagnose 时才给正式评估，否则只是初步观察）
  let riskScore = 15;
  let riskLevel: "low" | "medium" | "high" = "low";
  let riskSummary = "正在收集信息中...";

  if (canDiagnose) {
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
      riskSummary = `检测到${identifiedSymptoms.length}个症状，目前风险较低，建议持续观察。`;
    }
  } else if (identifiedSymptoms.length > 0) {
    riskScore = 20 + identifiedSymptoms.length * 8;
    riskLevel = "low";
    riskSummary = `已记录${identifiedSymptoms.length}个症状，正在进一步了解中...`;
  }

  // 6. 生成AI回复（按轮次渐进）
  let reply = "";

  if (userTurns === 1) {
    // 第一轮：问候引导，不识别、不诊断
    if (identifiedSymptoms.length === 0) {
      reply = "您好，我是AI健康助手。请描述您目前的不适症状，比如哪里不舒服、持续多久了？您可以详细告诉我，也可以点击下方的快捷症状标签。";
    } else {
      reply = `您好，我注意到您提到了${identifiedSymptoms.join("、")}。为了更准确地帮您分析，我想先了解一下：这些症状出现多久了？是偶尔出现还是持续存在呢？`;
    }
  } else if (userTurns === 2) {
    // 第二轮：追问细节，不给出诊断结论
    if (currentNewSymptoms.length > 0) {
      reply = `好的，我了解了。除了${identifiedSymptoms.join("、")}之外，还有没有其他不适？比如症状的严重程度怎么样？在什么情况下会加重或缓解呢？`;
    } else if (identifiedSymptoms.length > 0) {
      reply = `嗯嗯，我明白了。关于${identifiedSymptoms[0]}，您能再描述得具体一点吗？比如每天大约发作几次？对日常生活影响大吗？`;
    } else {
      reply = "您可以试着描述一下哪里不舒服，比如是头痛、肚子痛，还是觉得心里不舒服？越详细我越能帮到您。";
    }
  } else if (!canDiagnose) {
    // 还没到诊断条件，继续收集
    const needMore = 3 - identifiedSymptoms.length;
    if (currentNewSymptoms.length > 0) {
      reply = `好的，我记下了新的症状。目前我已经了解到${identifiedSymptoms.length}个症状，还需要再了解${needMore > 0 ? `至少${needMore}个细节` : "更多信息"}才能给出更准确的判断。您还有其他想补充的吗？`;
    } else {
      reply = `感谢您的详细描述。目前信息还不够充分，您可以再说说症状出现的时间规律，或者有没有诱发因素？这对判断很有帮助。`;
    }
  } else if (canDiagnose && isPhysical && topDisease) {
    // 可以诊断了 + 身体疾病
    reply = `根据我们这几轮的沟通，我综合分析了您提到的${identifiedSymptoms.join("、")}等${identifiedSymptoms.length}个症状，初步判断可能与${topDisease.name}相关（匹配度${topDisease.probability}%）。我为您生成了身体结构示意图，标注了可能受影响的区域。这只是AI的初步参考，建议您前往附近医院做进一步检查确认。`;
  } else if (canDiagnose && !isPhysical && topDisease) {
    // 可以诊断了 + 心理问题
    reply = `根据我们的交流，我注意到您提到的${identifiedSymptoms.join("、")}等情况，可能与${topDisease.name}相关。这类心理状态的波动是很常见的，不需要进行身体结构检查。建议您多和亲友交流，必要时可以寻求专业心理咨询帮助。您也可以到「社区陪伴」模块，和AI伙伴随时聊聊。`;
  } else {
    reply = `根据目前了解到的情况，我建议您继续观察症状变化。如果有加重的情况，请及时就医。您还有其他想了解的吗？`;
  }

  return {
    reply,
    identifiedSymptoms,
    riskLevel: canDiagnose ? riskLevel : "low",
    riskScore: canDiagnose ? riskScore : 0,
    riskSummary: canDiagnose ? riskSummary : "AI正在收集您的健康信息，请继续描述您的症状...",
    isPhysical: showSkeleton ? isPhysical : false,
    affectedAreas: showSkeleton ? affectedAreas : [],
    possibleDiseases: canDiagnose ? matchedDiseases.slice(0, 3).map((d) => ({ name: d!.name, probability: d!.probability })) : [],
    canDiagnose,
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
