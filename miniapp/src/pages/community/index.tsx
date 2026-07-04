import { useState, useEffect, useRef, useCallback } from "react";
import Taro from "@tarojs/taro";
import { View, Text, ScrollView, Input } from "@tarojs/components";
import TabBar from "@/components/TabBar";
import {
  chat as psychChat,
  createEmotionRecord,
  generateEmotionDiary,
  type ChatResult,
  type EmotionRecord,
  type EmotionDiaryEntry,
  type EmotionType,
} from "@/core/ai";
import "./index.scss";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  result?: ChatResult;
}

const emotionLabels: Record<EmotionType, string> = {
  happy: "开心",
  sad: "难过",
  anxious: "焦虑",
  angry: "生气",
  lonely: "孤独",
  hopeful: "充满希望",
  confused: "迷茫",
  neutral: "平静",
};

const emotionEmojis: Record<EmotionType, string> = {
  happy: "😊",
  sad: "😢",
  anxious: "😰",
  angry: "😠",
  lonely: "🥺",
  hopeful: "✨",
  confused: "😕",
  neutral: "😌",
};

const quickPhrases = [
  "今天心情不太好",
  "感觉压力很大",
  "有点孤独",
  "遇到了开心的事",
  "最近很焦虑",
  "对未来很迷茫",
];

const MAX_MESSAGES = 20;
const TIME_WINDOW_MS = 60 * 1000;

export default function Community() {
  const [activeTab, setActiveTab] = useState<"chat" | "diary">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "ai",
      content:
        "你好呀，我是你的AI情绪陪伴伙伴。有什么想聊的都可以跟我说，我会一直在这里陪着你~",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);
  const [diary, setDiary] = useState<EmotionDiaryEntry | null>(null);
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [scrollTop, setScrollTop] = useState(0);

  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 清理过期时间戳
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessageTimestamps((prev) =>
        prev.filter((ts) => now - ts < TIME_WINDOW_MS)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 生成情绪日记
  useEffect(() => {
    if (activeTab === "diary") {
      generateEmotionDiary(emotionRecords).then(setDiary);
    }
  }, [activeTab, emotionRecords]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      setScrollTop((prev) => prev + 100000);
    }, 80);
  }, []);

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, isTyping, activeTab, scrollToBottom]);

  const recentCount = messageTimestamps.length;
  const canSend = recentCount < MAX_MESSAGES;

  const handleSend = async (text?: string) => {
    const content = (text || inputText).trim();
    if (!content || isTyping || !canSend) return;

    setMessageTimestamps((prev) => [...prev, Date.now()]);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    const result = await psychChat(content);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: result.content,
      result,
    };
    setMessages((prev) => [...prev, aiMsg]);

    const record = await createEmotionRecord(content, result);
    setEmotionRecords((prev) => [...prev, record]);

    setIsTyping(false);
  };

  const handleInput = (e: any) => {
    setInputText(e.detail.value);
  };

  const handleConfirmSend = () => {
    if (inputText.trim() && !isTyping && canSend) {
      handleSend();
    }
  };

  const handleQuickPhrase = (phrase: string) => {
    if (!isTyping && canSend) {
      handleSend(phrase);
    }
  };

  const handleCallHotline = () => {
    Taro.makePhoneCall({ phoneNumber: "400-161-9995" }).catch(() => {});
  };

  const handleBack = () => {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: "/pages/home/index" });
    });
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const todayStr = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View className="community-page">
      {/* 顶部粉色渐变背景 */}
      <View className="header">
        <View className="header-deco header-deco-1" />
        <View className="header-deco header-deco-2" />
        <View className="header-content">
          <View className="header-title-row">
            <View className="back-btn" onClick={handleBack}>
              <Text className="back-icon">←</Text>
            </View>
            <View className="title-row">
              <Text className="title-icon">💬</Text>
              <Text className="title">星星树洞</Text>
            </View>
          </View>
          <Text className="header-subtitle">
            AI情绪陪伴，倾听你的每一个故事
          </Text>
        </View>
      </View>

      {/* Tab 切换 */}
      <View className="tab-bar">
        <View
          className={`tab-item ${activeTab === "chat" ? "tab-item-active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <Text className="tab-text">情绪陪伴</Text>
        </View>
        <View
          className={`tab-item ${activeTab === "diary" ? "tab-item-active" : ""}`}
          onClick={() => setActiveTab("diary")}
        >
          <Text className="tab-text">情绪日记</Text>
        </View>
      </View>

      {/* 情绪陪伴聊天 */}
      {activeTab === "chat" && (
        <View className="chat-wrap">
          <ScrollView
            className="chat-list"
            scrollY
            scrollWithAnimation
            scrollTop={scrollTop}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`msg-row ${
                  msg.role === "user" ? "msg-row-user" : "msg-row-ai"
                }`}
              >
                {msg.role === "ai" && (
                  <View className="msg-avatar">
                    <Text className="msg-avatar-icon">🌸</Text>
                  </View>
                )}
                <View className="msg-content">
                  <View
                    className={`msg-bubble ${
                      msg.role === "user"
                        ? "msg-bubble-user"
                        : "msg-bubble-ai"
                    }`}
                  >
                    <Text className="msg-text">{msg.content}</Text>
                  </View>

                  {/* 情绪识别标签 */}
                  {msg.result && msg.result.emotion && (
                    <View className="emotion-tag">
                      <Text className="emotion-tag-text">
                        {emotionEmojis[msg.result.emotion]} 识别到您感到
                        {emotionLabels[msg.result.emotion]}
                      </Text>
                    </View>
                  )}

                  {/* 危险预警 */}
                  {msg.result?.recognition.isDangerous && (
                    <View className="danger-warning">
                      <Text className="danger-warning-text">
                        ⚠️ {msg.result.recognition.warning}
                      </Text>
                      <View className="hotline-btn" onClick={handleCallHotline}>
                        <Text className="hotline-btn-text">
                          📞 拨打心理援助热线
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {isTyping && (
              <View className="msg-row msg-row-ai">
                <View className="msg-avatar">
                  <Text className="msg-avatar-icon">🌸</Text>
                </View>
                <View className="msg-bubble msg-bubble-ai msg-typing">
                  <View className="msg-typing-dot" />
                  <View className="msg-typing-dot msg-typing-dot-2" />
                  <View className="msg-typing-dot msg-typing-dot-3" />
                </View>
              </View>
            )}
            <View className="chat-end" />
          </ScrollView>

          {!canSend && (
            <View className="rate-limit-tip">
              <Text className="rate-limit-text">
                对话过于频繁，请稍等片刻再发送
              </Text>
            </View>
          )}

          {/* 快捷短语 */}
          <ScrollView className="quick-phrases" scrollX>
            {quickPhrases.map((p, i) => {
              const disabled = isTyping || !canSend;
              return (
                <View
                  key={i}
                  className={`quick-phrase ${
                    disabled ? "quick-phrase-disabled" : ""
                  }`}
                  onClick={() => !disabled && handleQuickPhrase(p)}
                >
                  <Text className="quick-phrase-text">{p}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* 输入框 */}
          <View className="input-bar">
            <Input
              className="input-field"
              type="text"
              value={inputText}
              onInput={handleInput}
              onConfirm={handleConfirmSend}
              confirmType="send"
              disabled={isTyping || !canSend}
              placeholder={
                canSend ? "说说你的心情吧..." : "对话过于频繁，请稍等片刻"
              }
              placeholderClass="input-placeholder"
            />
            <View
              className={`send-btn ${
                inputText.trim() && !isTyping && canSend
                  ? "send-btn-active"
                  : "send-btn-disabled"
              }`}
              onClick={() => handleSend()}
            >
              <Text className="send-btn-icon">➤</Text>
            </View>
          </View>
        </View>
      )}

      {/* 情绪日记 */}
      {activeTab === "diary" && (
        <View className="diary-wrap">
          <View className="diary-card">
            <View className="diary-header">
              <Text className="diary-header-icon">📔</Text>
              <Text className="diary-header-title">{todayStr} 情绪日记</Text>
            </View>

            {diary ? (
              <>
                <View className="diary-emotion-showcase">
                  <Text className="diary-emotion-icon">
                    {emotionEmojis[diary.emotion]}
                  </Text>
                  <View className="diary-emotion-info">
                    <Text className="diary-emotion-label">
                      {emotionLabels[diary.emotion]}
                    </Text>
                    <Text className="diary-emotion-intensity">
                      情绪强度：{diary.intensity}%
                    </Text>
                  </View>
                </View>

                <Text className="diary-summary">{diary.summary}</Text>

                <Text className="diary-suggestions-title">
                  💡 今日小建议
                </Text>
                {diary.suggestions.map((s, i) => (
                  <View key={i} className="diary-suggestion-item">
                    <Text className="diary-suggestion-icon">✨</Text>
                    <Text className="diary-suggestion-text">{s}</Text>
                  </View>
                ))}
              </>
            ) : (
              <View className="empty-state">
                <Text className="empty-icon">📝</Text>
                <Text className="empty-text">
                  今天还没有情绪记录，去聊聊天吧~
                </Text>
              </View>
            )}
          </View>

          {/* 历史记录 */}
          {emotionRecords.length > 0 && (
            <View className="diary-card">
              <Text className="diary-records-title">📊 今日情绪记录</Text>
              {emotionRecords.map((r) => (
                <View key={r.id} className="diary-record-item">
                  <Text className="diary-record-time">
                    {formatTime(r.timestamp)} · {emotionEmojis[r.emotion]}{" "}
                    {emotionLabels[r.emotion]}
                  </Text>
                  <Text className="diary-record-msg">{r.message}</Text>
                  {r.reply && (
                    <Text className="diary-record-reply">{r.reply}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
      <TabBar current="community" />
    </View>
  );
}
