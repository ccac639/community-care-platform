/**
 * 守望 — 统一AI能力层
 * 所有页面的AI调用必须通过此模块，禁止在UI组件中直接硬编码AI逻辑
 */

// ==================== 类型定义 ====================

export interface SymptomAnalysisResult {
  diseases: {
    id: string;
    name: string;
    alias: string;
    probability: number;
    affectedAreas: string[];
  }[];
}

export interface FoodAnalysisResult {
  productName: string;
  score: number;
  level: "safe" | "warning" | "danger";
  summary: string;
  ingredients: { name: string; risk: "safe" | "warning" | "danger"; desc: string }[];
  suggestions: string[];
}

export interface ChatResult {
  content: string;
  emotion?: string;
}

export interface VideoSubtitleResult {
  subtitle: string;
}

export interface DisasterRiskResult {
  overallLevel: "safe" | "low" | "medium" | "high";
  score: number;
  types: { id: string; name: string; level: string }[];
}

export interface CommunityRiskResult {
  score: number;
  level: string;
  trend: number;
  monitoredCount: number;
  alertCount: number;
  responseRate: number;
}

// ==================== AI能力层实现 ====================

/**
 * 模拟异步延迟
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 健康风险 — AI症状初筛分析
 * 根据用户选择的症状，AI匹配罕见病数据库并返回概率排名
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

/**
 * 生活风险 — AI配料表识别分析
 * 根据上传的配料表图片，AI识别添加剂并给出风险评级和建议
 */
export async function analyzeFoodLabel(_imageData: string): Promise<FoodAnalysisResult> {
  await delay(2000);

  return {
    productName: "某品牌乳酸菌饮品",
    score: 65,
    level: "warning",
    summary: "含有多种食品添加剂，儿童建议少量饮用",
    ingredients: [
      { name: "水", risk: "safe", desc: "安全成分" },
      { name: "全脂乳粉", risk: "safe", desc: "优质奶源" },
      { name: "白砂糖", risk: "warning", desc: "含糖量较高，儿童需控制" },
      { name: "柠檬黄", risk: "warning", desc: "人工色素，可能影响儿童注意力" },
      { name: "安赛蜜", risk: "warning", desc: "人工甜味剂，建议适量食用" },
      { name: "山梨酸钾", risk: "safe", desc: "国标允许防腐剂" },
    ],
    suggestions: [
      "建议儿童每日饮用不超过1瓶",
      "不含三聚氰胺等违禁添加物",
      "乳糖不耐受人群请谨慎饮用",
    ],
  };
}

/**
 * 心理风险 — AI文字对话
 * 根据用户消息，AI生成共情回复
 */
export async function chat(userMessage: string): Promise<ChatResult> {
  await delay(1200);

  const responses = [
    { content: "我理解你的感受，能跟我多说说吗？", emotion: "empathy" },
    { content: "谢谢你愿意和我分享，这需要勇气 💙", emotion: "warmth" },
    { content: "嗯嗯，我在认真听呢。", emotion: "listening" },
    { content: "你有这样的感觉很正常，不要太责怪自己。", emotion: "comfort" },
    { content: "那你希望我怎么帮你呢？", emotion: "support" },
  ];

  if (userMessage.includes("不开心") || userMessage.includes("难过") || userMessage.includes("哭")) {
    return { content: "听到你心情不好，我很心疼。愿意跟我说说发生了什么吗？我会一直在这里陪着你 🌳", emotion: "empathy" };
  }
  if (userMessage.includes("压力") || userMessage.includes("累") || userMessage.includes("焦虑")) {
    return { content: "压力太大的时候，允许自己停下来休息一下。你已经做得很好了，不用对自己太严苛 💙", emotion: "comfort" };
  }
  if (userMessage.includes("孤独") || userMessage.includes("一个人") || userMessage.includes("没人")) {
    return { content: "你不是一个人，我一直在这里。任何时候你想聊天，都可以来找我 🌳", emotion: "warmth" };
  }
  if (userMessage.includes("吵架") || userMessage.includes("朋友") || userMessage.includes("父母")) {
    return { content: "和亲近的人发生矛盾确实很难受。等情绪平复后，也许可以试着聊聊彼此的想法。你觉得呢？", emotion: "support" };
  }

  const random = responses[Math.floor(Math.random() * responses.length)];
  return random;
}

/**
 * 心理风险 — AI视频通话字幕生成
 * 在视频陪伴模式下，AI持续生成对话字幕
 */
export async function generateVideoSubtitle(): Promise<VideoSubtitleResult> {
  await delay(100);

  const subtitles = [
    "你好呀，今天过得怎么样？",
    "我在听呢，你慢慢说~",
    "听起来你今天遇到了一些事情",
    "嗯嗯，我理解你的感受",
    "那一定很不容易吧",
    "你愿意多说一点吗？",
    "你已经很棒了，真的",
    "不管发生什么，我都在这里陪你",
  ];

  return { subtitle: subtitles[Math.floor(Math.random() * subtitles.length)] };
}

/**
 * 社会风险 — AI灾害风险评估
 * 综合分析当前灾害监测数据，给出整体风险等级
 */
export async function assessDisasterRisk(): Promise<DisasterRiskResult> {
  await delay(800);

  return {
    overallLevel: "safe",
    score: 18,
    types: [
      { id: "earthquake", name: "地震预警", level: "低风险" },
      { id: "fire", name: "火灾预警", level: "低风险" },
      { id: "flood", name: "洪涝预警", level: "低风险" },
      { id: "typhoon", name: "台风预警", level: "低风险" },
    ],
  };
}

/**
 * 首页 — AI社区整体风险指数评估
 * 综合五大风险维度数据，计算社区整体风险指数
 */
export async function getCommunityRiskIndex(): Promise<CommunityRiskResult> {
  await delay(600);

  return {
    score: 28,
    level: "低风险",
    trend: -12,
    monitoredCount: 1286,
    alertCount: 23,
    responseRate: 98.2,
  };
}
