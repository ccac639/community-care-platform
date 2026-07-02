// 心理风险 — AI能力模块
import type { ChatResult, VideoSubtitleResult } from "./types";
import { delay } from "./_utils";

/**
 * AI文字对话
 * 根据用户消息，生成共情回复
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
 * AI视频通话字幕生成
 * 在视频陪伴模式下，持续生成对话字幕
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
