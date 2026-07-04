import { useState, useEffect, useRef, useCallback } from "react";
import Taro from "@tarojs/taro";
import { View, Text, ScrollView, Input, Image } from "@tarojs/components";
import TabBar from "@/components/TabBar";
import {
  healthChat,
  createTimelineEntry,
  symptomList,
  type HealthChatResult,
  type HealthTimelineEntry,
} from "@/core/ai";
import "./index.scss";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  result?: HealthChatResult;
}

interface RiskConfig {
  color: string;
  bg: string;
  bar: string;
  label: string;
}

const riskConfig: Record<"low" | "medium" | "high", RiskConfig> = {
  low: {
    color: "#16a34a",
    bg: "#f0fdf4",
    bar: "linear-gradient(to right, #4ade80, #10b981)",
    label: "低风险",
  },
  medium: {
    color: "#d97706",
    bg: "#fffbeb",
    bar: "linear-gradient(to right, #fbbf24, #f97316)",
    label: "中风险",
  },
  high: {
    color: "#dc2626",
    bg: "#fef2f2",
    bar: "linear-gradient(to right, #f87171, #e11d48)",
    label: "高风险",
  },
};

const timelineIconMap: Record<
  "symptom" | "assessment" | "alert",
  { icon: string; color: string; bg: string }
> = {
  symptom: { icon: "❤️", color: "#ef4444", bg: "#fef2f2" },
  assessment: { icon: "📊", color: "#3b82f6", bg: "#eff6ff" },
  alert: { icon: "⚠️", color: "#f97316", bg: "#fff7ed" },
};

const MAX_MESSAGES = 20;
const TIME_WINDOW_MS = 60 * 1000;

/**
 * 构造人体骨骼 SVG 字符串（受影响区域高亮）
 * 通过 data URL 喂给 Image 组件，跨 H5/小程序平台可用
 */
function buildSkeletonSvgDataUrl(affectedAreas: string[]): string {
  const getColor = (id: string) =>
    affectedAreas.includes(id)
      ? { fill: "#fecaca", stroke: "#ef4444" }
      : { fill: "#e5e7eb", stroke: "#9ca3af" };

  const skull = getColor("skull");
  const spine = getColor("spine");
  const arm = getColor("arm");
  const leg = getColor("leg");
  const rib = getColor("rib");
  const pelvis = getColor("pelvis");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 380">
  <ellipse cx="100" cy="35" rx="28" ry="32" fill="${skull.fill}" stroke="${skull.stroke}" stroke-width="2"/>
  <circle cx="90" cy="32" r="3" fill="#666"/>
  <circle cx="110" cy="32" r="3" fill="#666"/>
  <path d="M93 48 Q100 53 107 48" stroke="#666" stroke-width="1.5" fill="none"/>
  <rect x="85" y="67" width="30" height="15" rx="4" fill="${spine.fill}" stroke="${spine.stroke}" stroke-width="2"/>
  <path d="M55 90 Q40 100 45 130" stroke="${arm.stroke}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M45 130 Q40 155 50 175" stroke="${arm.stroke}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <circle cx="52" cy="180" r="6" fill="${arm.fill}" stroke="${arm.stroke}" stroke-width="1.5"/>
  <path d="M145 90 Q160 100 155 130" stroke="${arm.stroke}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M155 130 Q160 155 150 175" stroke="${arm.stroke}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <circle cx="148" cy="180" r="6" fill="${arm.fill}" stroke="${arm.stroke}" stroke-width="1.5"/>
  <path d="M70 85 L82 85 L82 155 L70 155 Z" fill="${rib.fill}" stroke="${rib.stroke}" stroke-width="1.5" rx="3"/>
  <path d="M130 85 L118 85 L118 155 L130 155 Z" fill="${rib.fill}" stroke="${rib.stroke}" stroke-width="1.5" rx="3"/>
  <line x1="70" y1="95" x2="130" y2="95" stroke="${rib.stroke}" stroke-width="1.5"/>
  <line x1="70" y1="108" x2="130" y2="108" stroke="${rib.stroke}" stroke-width="1.5"/>
  <line x1="70" y1="121" x2="130" y2="121" stroke="${rib.stroke}" stroke-width="1.5"/>
  <line x1="70" y1="134" x2="130" y2="134" stroke="${rib.stroke}" stroke-width="1.5"/>
  <rect x="90" y="155" width="20" height="45" rx="4" fill="${spine.fill}" stroke="${spine.stroke}" stroke-width="2"/>
  <path d="M90 200 Q50 210 55 260" stroke="${leg.stroke}" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M55 260 Q52 295 58 325" stroke="${leg.stroke}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <ellipse cx="58" cy="335" rx="14" ry="8" fill="${leg.fill}" stroke="${leg.stroke}" stroke-width="1.5"/>
  <path d="M110 200 Q150 210 145 260" stroke="${leg.stroke}" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M145 260 Q148 295 142 325" stroke="${leg.stroke}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <ellipse cx="142" cy="335" rx="14" ry="8" fill="${leg.fill}" stroke="${leg.stroke}" stroke-width="1.5"/>
  <ellipse cx="100" cy="168" rx="22" ry="10" fill="${pelvis.fill}" stroke="${pelvis.stroke}" stroke-width="2"/>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function Medical() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "ai",
      content:
        "您好，我是AI健康助手。请描述您目前的不适症状，我会通过对话帮您分析健康状况。您也可以点击下方的快捷症状标签。",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<HealthTimelineEntry[]>([]);
  const [latestResult, setLatestResult] = useState<HealthChatResult | null>(
    null
  );
  const [displayRiskScore, setDisplayRiskScore] = useState(0);
  const [activeTab, setActiveTab] = useState<"chat" | "timeline" | "symptoms">(
    "chat"
  );
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [scrollTop, setScrollTop] = useState(0);

  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 清理过期的时间戳
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessageTimestamps((prev) =>
        prev.filter((ts) => now - ts < TIME_WINDOW_MS)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 风险分数动画
  useEffect(() => {
    if (latestResult?.canDiagnose) {
      const targetScore = latestResult.riskScore;
      const startScore = displayRiskScore;
      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(
          startScore + (targetScore - startScore) * eased
        );
        setDisplayRiskScore(currentScore);

        if (progress < 1) {
          rafRef.current = setTimeout(animate, 16) as unknown as number;
        }
      };

      rafRef.current = setTimeout(animate, 16) as unknown as number;

      return () => {
        if (rafRef.current) {
          clearTimeout(rafRef.current);
        }
      };
    } else {
      setDisplayRiskScore(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestResult?.canDiagnose, latestResult?.riskScore]);

  // 滚动聊天列表到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      // 通过递增 scrollTop 强制触发 ScrollView 滚动到底部
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

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const result = await healthChat(content, history);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: result.reply,
      result,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setLatestResult(result);

    const newSymptoms = [...new Set([...allSymptoms, ...result.identifiedSymptoms])];
    setAllSymptoms(newSymptoms);

    const entry = createTimelineEntry(result, allSymptoms);
    setTimeline((prev) => [...prev, entry]);

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

  const handleQuickSymptom = (label: string) => {
    if (!isTyping && canSend) {
      handleSend(label);
    }
  };

  const handleSwitchToChat = (label: string) => {
    setActiveTab("chat");
    setTimeout(() => {
      handleSend(label);
    }, 200);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleBack = () => {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: "/pages/home/index" });
    });
  };

  const riskCfg = latestResult ? riskConfig[latestResult.riskLevel] : riskConfig.low;

  return (
    <View className="medical-page">
      {/* 顶部渐变背景 */}
      <View className="header">
        <View className="header-deco" />
        <View className="header-content">
          <View className="header-title-row">
            <View className="back-btn" onClick={handleBack}>
              <Text className="back-icon">←</Text>
            </View>
            <View className="title-row">
              <Text className="title-icon">🩺</Text>
              <Text className="title">AI智能诊疗</Text>
            </View>
          </View>

          {/* 健康风险评估卡片 */}
          {latestResult && (
            <View className="risk-assess-card">
              <View className="risk-assess-header">
                <View className="risk-assess-title-row">
                  <Text className="risk-assess-icon">📊</Text>
                  <Text className="risk-assess-title">健康风险评估</Text>
                </View>
                {latestResult.canDiagnose ? (
                  <View
                    className="risk-assess-badge"
                    style={{ background: riskCfg.bg, color: riskCfg.color }}
                  >
                    <Text>{riskCfg.label}</Text>
                  </View>
                ) : (
                  <View className="risk-assess-badge risk-assess-badge-pending">
                    <Text>评估中</Text>
                  </View>
                )}
              </View>
              {latestResult.canDiagnose ? (
                <View className="risk-assess-score-row">
                  <Text className="risk-assess-score">{displayRiskScore}</Text>
                  <View className="risk-assess-bar">
                    <View
                      className="risk-assess-bar-inner"
                      style={{
                        width: `${displayRiskScore}%`,
                        background: riskCfg.bar,
                        transition: "width 0.1s ease-out",
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View className="risk-assess-pending-row">
                  <View className="risk-assess-bar">
                    <View className="risk-assess-bar-pending animate-pulse" />
                  </View>
                  <Text className="risk-assess-pending-text">收集中...</Text>
                </View>
              )}
              <Text className="risk-assess-summary">
                {latestResult.riskSummary}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Tab 切换 */}
      <View className="tab-bar">
        <View
          className={`tab-item ${activeTab === "chat" ? "tab-item-active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <Text className="tab-text">AI对话</Text>
        </View>
        <View
          className={`tab-item ${activeTab === "timeline" ? "tab-item-active" : ""}`}
          onClick={() => setActiveTab("timeline")}
        >
          <Text className="tab-text">时间轴</Text>
          {timeline.length > 0 && (
            <View className="tab-badge">
              <Text className="tab-badge-text">{timeline.length}</Text>
            </View>
          )}
        </View>
        <View
          className={`tab-item ${activeTab === "symptoms" ? "tab-item-active" : ""}`}
          onClick={() => setActiveTab("symptoms")}
        >
          <Text className="tab-text">症状</Text>
          {allSymptoms.length > 0 && (
            <View className="tab-badge">
              <Text className="tab-badge-text">{allSymptoms.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* AI 对话 */}
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
                    <Text className="msg-avatar-icon">🩺</Text>
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

                  {/* AI 消息附带身体结构图（仅诊断后显示） */}
                  {msg.result?.canDiagnose &&
                    msg.result.isPhysical &&
                    msg.result.affectedAreas &&
                    msg.result.affectedAreas.length > 0 && (
                      <View className="skeleton-card">
                        <View className="skeleton-title-row">
                          <Text className="skeleton-title-icon">📊</Text>
                          <Text className="skeleton-title">
                            身体结构示意图
                          </Text>
                        </View>
                        <View className="skeleton-image-wrap">
                          <Image
                            className="skeleton-image"
                            src={buildSkeletonSvgDataUrl(
                              msg.result.affectedAreas
                            )}
                            mode="aspectFit"
                          />
                        </View>
                        <View className="skeleton-legend">
                          <View className="skeleton-legend-item">
                            <View className="skeleton-legend-dot skeleton-legend-normal" />
                            <Text className="skeleton-legend-text">正常部位</Text>
                          </View>
                          <View className="skeleton-legend-item">
                            <View className="skeleton-legend-dot skeleton-legend-affected animate-pulse" />
                            <Text className="skeleton-legend-text">疑似异常</Text>
                          </View>
                        </View>
                        {msg.result.possibleDiseases &&
                          msg.result.possibleDiseases.length > 0 && (
                            <View className="disease-list">
                              {msg.result.possibleDiseases.map((d, i) => (
                                <View key={i} className="disease-item">
                                  <Text className="disease-name">{d.name}</Text>
                                  <View className="disease-prob-row">
                                    <View className="disease-prob-bar">
                                      <View
                                        className="disease-prob-bar-inner"
                                        style={{
                                          width: `${d.probability}%`,
                                          background:
                                            d.probability >= 70
                                              ? "#f87171"
                                              : d.probability >= 40
                                              ? "#fbbf24"
                                              : "#4ade80",
                                        }}
                                      />
                                    </View>
                                    <Text
                                      className="disease-prob-text"
                                      style={{
                                        color:
                                          d.probability >= 70
                                            ? "#dc2626"
                                            : d.probability >= 40
                                            ? "#d97706"
                                            : "#16a34a",
                                      }}
                                    >
                                      {d.probability}%
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                      </View>
                    )}

                  {/* 心理问题提示 */}
                  {msg.result?.canDiagnose &&
                    !msg.result.isPhysical &&
                    msg.result.identifiedSymptoms.length > 0 && (
                      <View className="psych-tip">
                        <Text className="psych-tip-icon">🧠</Text>
                        <Text className="psych-tip-text">
                          此为心理健康问题，无需身体结构检查
                        </Text>
                      </View>
                    )}
                </View>
              </View>
            ))}

            {isTyping && (
              <View className="msg-row msg-row-ai">
                <View className="msg-avatar">
                  <Text className="msg-avatar-icon">🩺</Text>
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

          {/* 快捷症状 */}
          <ScrollView className="quick-symptoms" scrollX>
            {symptomList.slice(0, 8).map((s) => {
              const disabled = isTyping || !canSend;
              return (
                <View
                  key={s.id}
                  className={`quick-symptom ${
                    disabled
                      ? "quick-symptom-disabled"
                      : s.category === "身体"
                      ? "quick-symptom-body"
                      : "quick-symptom-mind"
                  }`}
                  onClick={() => !disabled && handleQuickSymptom(s.label)}
                >
                  <Text className="quick-symptom-text">{s.label}</Text>
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
              placeholder={canSend ? "描述您的症状..." : "对话过于频繁，请稍等片刻"}
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

      {/* 时间轴 */}
      {activeTab === "timeline" && (
        <View className="timeline-wrap">
          {timeline.length === 0 ? (
            <View className="empty-state">
              <Text className="empty-icon">⏰</Text>
              <Text className="empty-text">
                暂无记录，开始对话后这里会显示健康过程
              </Text>
            </View>
          ) : (
            <View className="timeline-list">
              <View className="timeline-line" />
              {timeline.map((entry) => {
                const cfg = timelineIconMap[entry.type];
                const rCfg = riskConfig[entry.riskLevel];
                return (
                  <View key={entry.id} className="timeline-item">
                    <View
                      className="timeline-dot"
                      style={{ background: cfg.bg }}
                    >
                      <Text className="timeline-dot-icon">{cfg.icon}</Text>
                    </View>
                    <View className="timeline-card">
                      <View className="timeline-card-header">
                        <Text className="timeline-card-title">
                          {entry.title}
                        </Text>
                        <Text className="timeline-card-time">
                          {formatTime(entry.timestamp)}
                        </Text>
                      </View>
                      <Text className="timeline-card-desc">{entry.desc}</Text>
                      <View
                        className="timeline-card-badge"
                        style={{ background: rCfg.bg, color: rCfg.color }}
                      >
                        <Text>{rCfg.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* 症状列表 */}
      {activeTab === "symptoms" && (
        <View className="symptoms-wrap">
          <View className="symptoms-card">
            <View className="symptoms-card-title-row">
              <Text className="symptoms-card-icon">❤️</Text>
              <Text className="symptoms-card-title">已识别症状</Text>
            </View>
            {allSymptoms.length === 0 ? (
              <Text className="symptoms-empty">
                暂未识别到症状，请在对话中描述您的不适
              </Text>
            ) : (
              <View className="symptoms-tags">
                {allSymptoms.map((s, i) => (
                  <View key={i} className="symptom-tag">
                    <Text className="symptom-tag-text">{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="symptoms-card">
            <View className="symptoms-card-title-row">
              <Text className="symptoms-card-icon">👁️</Text>
              <Text className="symptoms-card-title">快捷症状参考</Text>
            </View>
            <View className="quick-grid">
              {symptomList.map((s) => (
                <View
                  key={s.id}
                  className={`quick-grid-item ${
                    s.category === "身体"
                      ? "quick-grid-body"
                      : "quick-grid-mind"
                  }`}
                  onClick={() => handleSwitchToChat(s.label)}
                >
                  <View
                    className={`quick-grid-icon ${
                      s.category === "身体"
                        ? "quick-grid-icon-body"
                        : "quick-grid-icon-mind"
                    }`}
                  >
                    <Text>{s.category === "身体" ? "❤️" : "🧠"}</Text>
                  </View>
                  <View className="quick-grid-text">
                    <Text className="quick-grid-label">{s.label}</Text>
                    <Text className="quick-grid-cat">{s.category}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
      <TabBar current="medical" />
    </View>
  );
}
