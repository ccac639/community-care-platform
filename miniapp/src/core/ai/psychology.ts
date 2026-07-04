import type { ChatResult, VideoSubtitleResult, EmotionType, EmotionRecognitionResult, EmotionRecord, EmotionDiaryEntry } from "./types";
import { delay } from "./_utils";

const emotionKeywords: Record<EmotionType, string[]> = {
  happy: ["开心", "高兴", "快乐", "幸福", "兴奋", "喜悦", "满足", "愉快", "太好了", "真棒", "优秀", "成功", "顺利"],
  sad: ["难过", "伤心", "悲伤", "失望", "失落", "沮丧", "痛苦", "难受", "哭", "流泪", "心碎", "绝望"],
  anxious: ["焦虑", "紧张", "担心", "害怕", "恐惧", "不安", "压力", "担忧", "烦躁", "不知所措"],
  angry: ["生气", "愤怒", "恼火", "烦躁", "不满", "讨厌", "恨", "指责", "抱怨", "发火", "脾气"],
  lonely: ["孤独", "孤单", "一个人", "没人", "寂寞", "冷落", "被抛弃", "孤立"],
  hopeful: ["希望", "期待", "憧憬", "信心", "相信", "乐观", "加油", "努力", "奋斗"],
  confused: ["迷茫", "困惑", "不知所措", "不知道", "不清楚", "犹豫", "纠结"],
  neutral: [],
};

const dangerousKeywords = {
  selfHarm: ["自杀", "自残", "想死", "结束生命", "不想活了", "割腕", "跳楼", "吃药"],
  violence: ["杀人", "打人", "报复", "伤害", "流血", "凶器", "捅"],
  seriousRisk: ["重度抑郁", "精神崩溃", "无法呼吸", "幻觉", "自杀倾向"],
};

function recognizeEmotion(message: string): EmotionRecognitionResult {
  const lowerMsg = message.toLowerCase();
  let bestEmotion: EmotionType = "neutral";
  let bestIntensity = 0;
  const matchedKeywords: string[] = [];

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let score = 0;
    const foundKeywords: string[] = [];
    for (const kw of keywords) {
      const regex = new RegExp(kw, "gi");
      const matches = lowerMsg.match(regex);
      if (matches) {
        score += matches.length * 2;
        foundKeywords.push(...matches);
      }
    }

    const intensity = Math.min(100, Math.round(score * 15));
    if (intensity > bestIntensity) {
      bestIntensity = intensity;
      bestEmotion = emotion as EmotionType;
      matchedKeywords.push(...foundKeywords);
    }
  }

  if (bestIntensity < 15) {
    return {
      emotion: { type: "neutral", intensity: 0, keywords: [] },
      isDangerous: false,
      dangerLevel: "none",
    };
  }

  let isDangerous = false;
  let dangerLevel: "none" | "low" | "medium" | "high" = "none";
  let warning: string | undefined;

  for (const kw of dangerousKeywords.selfHarm) {
    if (lowerMsg.includes(kw)) {
      isDangerous = true;
      dangerLevel = "high";
      warning = "检测到您有自我伤害倾向，请立即联系身边的人或拨打心理援助热线";
      break;
    }
  }

  if (!isDangerous) {
    for (const kw of dangerousKeywords.violence) {
      if (lowerMsg.includes(kw)) {
        isDangerous = true;
        dangerLevel = "high";
        warning = "检测到您有暴力倾向，请冷静下来，寻求帮助";
        break;
      }
    }
  }

  if (!isDangerous) {
    for (const kw of dangerousKeywords.seriousRisk) {
      if (lowerMsg.includes(kw)) {
        isDangerous = true;
        dangerLevel = "medium";
        warning = "您描述的情况比较严重，建议尽快寻求专业心理帮助";
        break;
      }
    }
  }

  if (!isDangerous && bestIntensity >= 70) {
    isDangerous = true;
    dangerLevel = "low";
    warning = "您的情绪强度较高，请注意调节";
  }

  return {
    emotion: { type: bestEmotion, intensity: bestIntensity, keywords: matchedKeywords },
    isDangerous,
    dangerLevel,
    warning,
  };
}

const emotionResponses: Record<EmotionType, { comfort: string[]; explore: string[] }> = {
  happy: {
    comfort: ["太棒了！看到你开心，我也很开心", "真好呀，希望这份快乐能一直陪伴你！", "你的笑容是最好的礼物，继续保持！"],
    explore: ["能跟我分享一下是什么让你这么开心吗？", "是什么事情让你这么高兴呀？"],
  },
  sad: {
    comfort: ["听到你难过，我很心疼。愿意跟我说说发生了什么吗？我会一直在这里陪着你", "难过的时候哭出来也没关系，我陪着你。", "你不是一个人，我在这里。"],
    explore: ["是什么让你感到难过呢？", "可以跟我详细说说吗？"],
  },
  anxious: {
    comfort: ["压力太大的时候，允许自己停下来休息一下。你已经做得很好了，不用对自己太严苛", "深呼吸，慢慢来，一切都会好起来的。", "焦虑是正常的反应，你已经在面对了，这很棒。"],
    explore: ["是什么事情让你感到焦虑呢？", "能具体说说你的担忧吗？"],
  },
  angry: {
    comfort: ["生气是很正常的情绪，先深呼吸冷静一下。", "我理解你的愤怒，有时候发泄出来会好一些。", "让自己先冷静下来，我们可以一起想想办法。"],
    explore: ["是什么让你这么生气呢？", "可以跟我说说发生了什么吗？"],
  },
  lonely: {
    comfort: ["你不是一个人，我一直在这里。任何时候你想聊天，都可以来找我", "孤独的时候，记得我在。", "我会一直陪着你的，不要害怕。"],
    explore: ["为什么会感觉孤独呢？", "想找人聊聊吗？"],
  },
  hopeful: {
    comfort: ["你的信心让我很感动，相信你一定可以做到！", "有希望就有动力，加油！", "你的乐观态度太棒了！"],
    explore: ["是什么给了你这么大的信心呢？", "能跟我分享你的期待吗？"],
  },
  confused: {
    comfort: ["迷茫的时候，停下来思考一下也没关系。", "慢慢来，答案会慢慢清晰的。", "困惑是成长的一部分，不用着急。"],
    explore: ["是什么让你感到迷茫呢？", "可以跟我说说你的困惑吗？"],
  },
  neutral: {
    comfort: ["我在听呢，你慢慢说~", "嗯嗯，继续说，我在。", "谢谢你愿意跟我分享。"],
    explore: ["你想聊点什么呢？", "有什么想跟我说的吗？"],
  },
};

export async function chat(userMessage: string): Promise<ChatResult> {
  await delay(1500);
  const recognition = recognizeEmotion(userMessage);
  const emotion = recognition.emotion.type;
  const intensity = recognition.emotion.intensity;

  let content = "";
  if (recognition.isDangerous && recognition.warning) {
    content = recognition.warning + "\n\n请记住，无论发生什么，你都是被爱的，值得被好好对待。如果你愿意，可以跟我多说说。";
  } else {
    const responses = emotionResponses[emotion];
    const shouldComfort = intensity >= 50 || Math.random() > 0.4;
    const pool = shouldComfort ? responses.comfort : responses.explore;
    content = pool[Math.floor(Math.random() * pool.length)];
  }

  return { content, emotion, recognition };
}

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
    "深呼吸，一切都会好起来的",
    "你的感受很重要",
  ];
  return { subtitle: subtitles[Math.floor(Math.random() * subtitles.length)] };
}

export async function recognizeEmotionFromText(text: string): Promise<EmotionRecognitionResult> {
  await delay(500);
  return recognizeEmotion(text);
}

export async function createEmotionRecord(message: string, result: ChatResult): Promise<EmotionRecord> {
  await delay(200);
  return {
    id: Date.now().toString(),
    timestamp: Date.now(),
    emotion: result.emotion || "neutral",
    intensity: result.recognition.emotion.intensity,
    message,
    reply: result.content,
  };
}

export async function generateEmotionDiary(records: EmotionRecord[]): Promise<EmotionDiaryEntry> {
  await delay(1000);

  if (records.length === 0) {
    const today = new Date().toISOString().split("T")[0];
    return {
      id: today,
      date: today,
      content: "今天还没有记录情绪",
      emotion: "neutral",
      intensity: 0,
      summary: "今天还没有情绪记录",
      suggestions: ["可以开始记录你的心情了"],
    };
  }

  const emotionCounts: Record<EmotionType, number> = {
    happy: 0, sad: 0, anxious: 0, angry: 0, lonely: 0, hopeful: 0, confused: 0, neutral: 0,
  };
  let totalIntensity = 0;

  records.forEach((r) => {
    emotionCounts[r.emotion]++;
    totalIntensity += r.intensity;
  });

  let dominantEmotion: EmotionType = "neutral";
  let maxCount = 0;
  for (const [emotion, count] of Object.entries(emotionCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantEmotion = emotion as EmotionType;
    }
  }

  const avgIntensity = Math.round(totalIntensity / records.length);
  const today = new Date().toISOString().split("T")[0];
  const content = records.map((r) => {
    const time = new Date(r.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    return time + ": " + r.message;
  }).join("\n");

  const summaries: Record<EmotionType, string[]> = {
    happy: ["今天是充满快乐的一天！", "你今天的心情很棒！", "快乐的一天，继续保持！"],
    sad: ["今天你经历了一些难过的事情，但你已经很棒了。", "难过只是暂时的，明天会更好。", "允许自己难过，这是正常的。"],
    anxious: ["今天你感到有些焦虑，记得给自己一些休息的时间。", "压力是暂时的，你能应对的。", "深呼吸，一切都会好起来的。"],
    angry: ["今天你有些生气，情绪发泄出来就好了。", "愤怒是正常的，记得冷静下来。", "别让愤怒影响你太久。"],
    lonely: ["今天你感到孤独，但你不是一个人。", "记得我一直在你身边。", "孤独的时候，找人聊聊吧。"],
    hopeful: ["今天你充满希望，这很棒！", "你的信心会帮你走得更远。", "保持这份乐观！"],
    confused: ["今天你有些迷茫，没关系，慢慢来。", "答案会慢慢清晰的。", "困惑是成长的一部分。"],
    neutral: ["今天的情绪比较平稳。", "平静的一天，也是一种幸福。", "平淡中也有美好。"],
  };

  const suggestions: Record<EmotionType, string[]> = {
    happy: ["继续做让你快乐的事情！", "分享你的快乐给身边的人。", "记录下这份快乐。"],
    sad: ["给自己一些时间和空间。", "和信任的人聊聊。", "做一些让自己放松的事情。"],
    anxious: ["尝试深呼吸练习。", "分解任务，不要给自己太大压力。", "适当运动，释放压力。"],
    angry: ["先冷静下来再处理问题。", "尝试用别的方式发泄情绪。", "学会原谅自己和他人。"],
    lonely: ["主动联系朋友或家人。", "参加一些社交活动。", "培养一个兴趣爱好。"],
    hopeful: ["制定计划，一步步实现目标。", "相信自己的能力。", "保持积极的心态。"],
    confused: ["列出你的困惑，逐一解决。", "寻求他人的建议。", "给自己时间思考。"],
    neutral: ["尝试做一些新的事情。", "关注自己的感受。", "保持感恩之心。"],
  };

  return {
    id: today,
    date: today,
    content,
    emotion: dominantEmotion,
    intensity: avgIntensity,
    summary: summaries[dominantEmotion][Math.floor(Math.random() * summaries[dominantEmotion].length)],
    suggestions: suggestions[dominantEmotion].slice(0, 3),
  };
}

export const emotionColors: Record<EmotionType, { bg: string; text: string; border: string; gradient: string }> = {
  happy: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200", gradient: "from-yellow-400 to-amber-500" },
  sad: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", gradient: "from-blue-400 to-indigo-500" },
  anxious: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", gradient: "from-orange-400 to-red-500" },
  angry: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", gradient: "from-red-400 to-rose-500" },
  lonely: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", gradient: "from-purple-400 to-violet-500" },
  hopeful: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", gradient: "from-green-400 to-emerald-500" },
  confused: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", gradient: "from-gray-400 to-gray-500" },
  neutral: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", gradient: "from-gray-400 to-gray-500" },
};
