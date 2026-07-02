import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Stethoscope, MapPin, ChevronRight, Activity, AlertCircle, Navigation, Phone, Crosshair, Map as MapIcon, Clock, Heart, Brain, Eye, Shield } from "lucide-react";
import { cn } from "../lib/utils";
import { hospitals as staticHospitals, type Hospital } from "../data/mockData";
import { healthChat, createTimelineEntry, symptomList, type HealthChatResult, type HealthTimelineEntry } from "../core/ai";
import AMapView from "../components/AMapView";
import SkeletonView from "../components/SkeletonView";

interface MedicalPageProps {
  onBack: () => void;
}

interface HospitalWithDistance extends Hospital {
  realDistance?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  result?: HealthChatResult;
}

const riskConfig = {
  low: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", bar: "from-green-400 to-emerald-500", label: "低风险", icon: Shield },
  medium: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bar: "from-amber-400 to-orange-500", label: "中风险", icon: AlertCircle },
  high: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "from-red-400 to-rose-500", label: "高风险", icon: AlertCircle },
};

const timelineIcon = {
  symptom: { icon: Heart, color: "text-red-500", bg: "bg-red-50" },
  assessment: { icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
  alert: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" },
};

export default function MedicalPage({ onBack }: MedicalPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "init", role: "ai", content: "您好，我是AI健康助手。请描述您目前的不适症状，我会通过对话帮您分析健康状况。您也可以点击下方的快捷症状标签。" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<HealthTimelineEntry[]>([]);
  const [latestResult, setLatestResult] = useState<HealthChatResult | null>(null);
  const [displayRiskScore, setDisplayRiskScore] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [mapInitialHospitalId, setMapInitialHospitalId] = useState<string | null>(null);
  const [nearbyHospitals] = useState<HospitalWithDistance[]>(staticHospitals);
  const [activeTab, setActiveTab] = useState<"chat" | "timeline" | "symptoms">("chat");
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const MAX_MESSAGES = 20;
  const TIME_WINDOW_MS = 60 * 1000;

  const getRecentMessageCount = () => {
    const now = Date.now();
    return messageTimestamps.filter((ts) => now - ts < TIME_WINDOW_MS).length;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessageTimestamps((prev) => prev.filter((ts) => now - ts < TIME_WINDOW_MS));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const recentCount = getRecentMessageCount();
  const canSend = recentCount < MAX_MESSAGES;

  useEffect(() => {
    if (latestResult?.canDiagnose) {
      const targetScore = latestResult.riskScore;
      const startScore = displayRiskScore;
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(startScore + (targetScore - startScore) * eased);
        setDisplayRiskScore(currentScore);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    } else {
      setDisplayRiskScore(0);
    }
  }, [latestResult?.canDiagnose, latestResult?.riskScore]);

  const handleSend = async (text?: string) => {
    const content = text || inputText.trim();
    if (!content || isTyping || !canSend) return;

    setMessageTimestamps((prev) => [...prev, Date.now()]);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content };
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

    // 更新累计症状
    const newSymptoms = [...new Set([...allSymptoms, ...result.identifiedSymptoms])];
    setAllSymptoms(newSymptoms);

    // 添加时间轴记录
    const entry = createTimelineEntry(result, allSymptoms);
    setTimeline((prev) => [...prev, entry]);

    setIsTyping(false);
  };

  const handleOpenMap = (hospitalId?: string) => {
    setMapInitialHospitalId(hospitalId || null);
    setShowMap(true);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const riskCfg = latestResult ? riskConfig[latestResult.riskLevel] : riskConfig.low;
  const nearestHospital = nearbyHospitals[0];

  return (
    <div className="animate-fade-in pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-4 rounded-b-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 btn-pressable">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-white" />
              <h1 className="text-xl font-bold text-white">健康风险 · AI诊疗</h1>
            </div>
          </div>

          {/* 健康风险评估卡片 */}
          {latestResult && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">健康风险评估</span>
                </div>
                {latestResult.canDiagnose ? (
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", riskCfg.bg, riskCfg.color)}>
                    {riskCfg.label}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/20 text-white">
                    评估中
                  </span>
                )}
              </div>
              {latestResult.canDiagnose ? (
                <>
                  <div className="flex items-end gap-3">
                    <div className="text-4xl font-bold text-white tabular-nums">{displayRiskScore}</div>
                    <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full bg-gradient-to-r rounded-full shadow-lg", riskCfg.bar)}
                        style={{ width: `${displayRiskScore}%`, transition: "width 0.1s ease-out" }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-white/40 rounded-full animate-pulse" />
                  </div>
                  <span className="text-xs text-blue-100">收集中...</span>
                </div>
              )}
              <p className="text-xs text-blue-100 mt-2">{latestResult.riskSummary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tab切换 */}
      <div className="px-4 pt-3">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab("chat")}
            className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", activeTab === "chat" ? "bg-white shadow-sm text-primary-600" : "text-gray-500")}
          >
            AI对话
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1", activeTab === "timeline" ? "bg-white shadow-sm text-primary-600" : "text-gray-500")}
          >
            <Clock className="w-3.5 h-3.5" /> 时间轴
            {timeline.length > 0 && <span className="text-[10px] bg-primary-100 text-primary-600 px-1 rounded">{timeline.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab("symptoms")}
            className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1", activeTab === "symptoms" ? "bg-white shadow-sm text-primary-600" : "text-gray-500")}
          >
            <Heart className="w-3.5 h-3.5" /> 症状
            {allSymptoms.length > 0 && <span className="text-[10px] bg-primary-100 text-primary-600 px-1 rounded">{allSymptoms.length}</span>}
          </button>
        </div>
      </div>

      {/* AI对话 */}
      {activeTab === "chat" && (
        <div className="flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
          <div className="flex-1 overflow-y-auto px-4 pt-3 space-y-3 pb-2 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "ai" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <Stethoscope className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="max-w-[78%]">
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm",
                    msg.role === "user"
                      ? "bg-primary-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                  )}>
                    {msg.content}
                  </div>
                  {/* AI消息附带身体结构图（仅诊断后显示） */}
                  {msg.result?.canDiagnose && msg.result.isPhysical && msg.result.affectedAreas && msg.result.affectedAreas.length > 0 && (
                    <div className="mt-2 bg-white rounded-xl p-3 shadow-sm border border-blue-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-semibold text-gray-600">身体结构示意图</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <SkeletonView affectedAreas={msg.result.affectedAreas} />
                      </div>
                      {msg.result.possibleDiseases && msg.result.possibleDiseases.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.result.possibleDiseases.map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{d.name}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={cn("h-full rounded-full", d.probability >= 70 ? "bg-red-400" : d.probability >= 40 ? "bg-amber-400" : "bg-green-400")}
                                    style={{ width: `${d.probability}%` }}
                                  />
                                </div>
                                <span className={cn("font-medium", d.probability >= 70 ? "text-red-600" : d.probability >= 40 ? "text-amber-600" : "text-green-600")}>
                                  {d.probability}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {/* 心理问题提示（仅诊断后显示） */}
                  {msg.result?.canDiagnose && !msg.result.isPhysical && msg.result.identifiedSymptoms.length > 0 && (
                    <div className="mt-2 bg-pink-50 rounded-xl p-3 border border-pink-100">
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-pink-500" />
                        <span className="text-xs text-pink-700">此为心理健康问题，无需身体结构检查</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-2">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {!canSend && (
            <div className="px-4 mb-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
                <span className="text-xs text-amber-700">对话过于频繁，请稍等片刻再发送</span>
              </div>
            </div>
          )}

          {/* 快捷症状 */}
          <div className="px-4 mb-2">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {symptomList.slice(0, 8).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSend(s.label)}
                  disabled={isTyping || !canSend}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border btn-pressable transition-all",
                    (isTyping || !canSend)
                      ? "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                      : s.category === "身体"
                      ? "border-blue-200 text-blue-600 bg-blue-50"
                      : "border-pink-200 text-pink-600 bg-pink-50"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 输入框 */}
          <div className="px-4 flex items-center gap-2 bg-white rounded-2xl p-2 shadow-sm mx-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSend && handleSend()}
              disabled={isTyping || !canSend}
              placeholder={canSend ? "描述您的症状..." : "对话过于频繁，请稍等片刻"}
              className={cn(
                "flex-1 px-3 py-2 text-sm outline-none bg-transparent transition-all",
                (isTyping || !canSend) && "text-gray-400 cursor-not-allowed"
              )}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isTyping || !canSend}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center btn-pressable transition-all",
                inputText.trim() && !isTyping && canSend ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-400"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 时间轴 */}
      {activeTab === "timeline" && (
        <div className="px-4 pt-3">
          {timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Clock className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">暂无记录，开始对话后这里会显示健康过程</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
              {timeline.map((entry) => {
                const cfg = timelineIcon[entry.type];
                const rCfg = riskConfig[entry.riskLevel];
                const Icon = cfg.icon;
                return (
                  <div key={entry.id} className="relative mb-4">
                    <div className={cn("absolute -left-5 w-4 h-4 rounded-full flex items-center justify-center", cfg.bg)}>
                      <Icon className={cn("w-2.5 h-2.5", cfg.color)} />
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm ml-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800">{entry.title}</span>
                        <span className="text-[10px] text-gray-400">{formatTime(entry.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-500">{entry.desc}</p>
                      <span className={cn("inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded font-medium", rCfg.bg, rCfg.color)}>
                        {rCfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 症状列表 */}
      {activeTab === "symptoms" && (
        <div className="px-4 pt-3">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500" /> 已识别症状
            </h3>
            {allSymptoms.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">暂未识别到症状，请在对话中描述您的不适</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allSymptoms.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium border border-blue-100">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-500" /> 快捷症状参考
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {symptomList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveTab("chat"); handleSend(s.label); }}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border btn-pressable text-left",
                    s.category === "身体" ? "border-blue-100 bg-blue-50/50" : "border-pink-100 bg-pink-50/50"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", s.category === "身体" ? "bg-blue-100" : "bg-pink-100")}>
                    {s.category === "身体" ? <Heart className="w-4 h-4 text-blue-500" /> : <Brain className="w-4 h-4 text-pink-500" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-700">{s.label}</div>
                    <div className="text-[10px] text-gray-400">{s.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 附近医院 */}
          {latestResult?.canDiagnose && latestResult.riskLevel !== "low" && (
            <div className="bg-white rounded-2xl p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-500" /> 附近推荐医院
              </h3>
              <div className="space-y-2">
                {nearbyHospitals.slice(0, 3).map((h) => (
                  <div key={h.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{h.name}</span>
                        <span className="text-[10px] text-white bg-primary-500 px-1.5 py-0.5 rounded">{h.level}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{h.address} · {h.distance}</div>
                    </div>
                    <button
                      onClick={() => handleOpenMap(h.id)}
                      className="flex-shrink-0 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-medium btn-pressable flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> 导航
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleOpenMap()}
                className="w-full mt-2 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium btn-pressable flex items-center justify-center gap-1.5 border border-gray-100"
              >
                <MapIcon className="w-4 h-4" /> 查看地图视图
              </button>
            </div>
          )}
        </div>
      )}

      {/* 地图弹窗 */}
      {showMap && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl flex flex-col" style={{ height: "85vh" }}>
            <div className="flex items-center justify-between p-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-800">附近医院导航</h3>
              <button
                onClick={() => { setShowMap(false); setMapInitialHospitalId(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 btn-pressable"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 rotate-90" />
              </button>
            </div>
            <div className="flex-1 relative">
              <AMapView
                hospitals={nearbyHospitals}
                initialSelectedHospitalId={mapInitialHospitalId}
                onClose={() => { setShowMap(false); setMapInitialHospitalId(null); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
