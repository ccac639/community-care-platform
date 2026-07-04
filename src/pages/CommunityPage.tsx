import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Video, MessageCircle, Upload, X, Mic, MicOff, PhoneOff, Send, Sparkles, Heart, Volume2, Image as ImageIcon, BookOpen, Calendar, Clock, AlertTriangle } from "lucide-react";
import { cn, formatTime } from "../lib/utils";
import { quickPhrases } from "../data/mockData";
import { chat, generateVideoSubtitle, createEmotionRecord, generateEmotionDiary, emotionColors, type EmotionRecord, type EmotionDiaryEntry, type ChatResult } from "../core/ai";

interface CommunityPageProps {
  onBack: () => void;
}

const initialMessages = [
  { id: "1", role: "ai" as const, content: "你好呀～我是你的AI情绪陪伴伙伴小树 🌳，有什么开心或不开心的事，都可以跟我说哦！", time: "刚刚" },
];

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  time: string;
  result?: ChatResult;
}

const emotionIconMap = {
  happy: "😊",
  sad: "😢",
  anxious: "😰",
  angry: "😠",
  lonely: "🥺",
  hopeful: "🌟",
  confused: "😕",
  neutral: "😐",
};

function VideoCallPage({ avatarUrl, onEnd }: { avatarUrl: string; onEnd: () => void }) {
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [subtitle, setSubtitle] = useState("你好呀，今天过得怎么样？");
  const [isTalking, setIsTalking] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    const talkTimer = setInterval(() => setIsTalking((p) => !p), 800);
    let active = true;
    const updateSubtitle = async () => {
      const result = await generateVideoSubtitle();
      if (active) setSubtitle(result.subtitle);
    };
    const subTimer = setInterval(updateSubtitle, 5000);
    return () => {
      active = false;
      clearInterval(timer);
      clearInterval(talkTimer);
      clearInterval(subTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40"
          style={{ backgroundImage: `url(${avatarUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between px-6 pt-12 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm">{formatTime(duration)}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white/90 text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" /> AI情绪陪伴中
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full bg-green-400/20 animate-pulse-ring" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-green-400/10 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
            </div>
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <img src={avatarUrl} alt="AI Avatar" className="w-full h-full object-cover" />
              {isTalking && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full"
                      style={{
                        height: `${8 + Math.random() * 16}px`,
                        animation: `talk 0.5s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6">
            <p className="text-white text-center text-sm leading-relaxed">{subtitle}</p>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={() => setMuted(!muted)}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center btn-pressable transition-all",
                muted ? "bg-red-500/80" : "bg-white/20 backdrop-blur-sm"
              )}
            >
              {muted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>
            <button
              onClick={onEnd}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center btn-pressable shadow-lg shadow-red-500/30"
            >
              <PhoneOff className="w-7 h-7 text-white rotate-[135deg]" />
            </button>
            <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center btn-pressable">
              <Volume2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmotionChat() {
  const [mode, setMode] = useState<"video" | "chat">("chat");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastEmotion, setLastEmotion] = useState<{ type: string; intensity: number } | null>(null);
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessageTimestamps((prev) => prev.filter((ts) => now - ts < TIME_WINDOW_MS));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const MAX_MESSAGES = 20;
  const TIME_WINDOW_MS = 60 * 1000;

  const getRecentMessageCount = () => {
    const now = Date.now();
    return messageTimestamps.filter((ts) => now - ts < TIME_WINDOW_MS).length;
  };

  const handleSend = async (text?: string) => {
    const content = text || inputText.trim();
    if (!content) return;

    const recentCount = getRecentMessageCount();
    if (recentCount >= MAX_MESSAGES) {
      return;
    }

    setMessageTimestamps((prev) => [...prev, Date.now()]);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content, time: "刚刚" };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    const result = await chat(content);
    
    if (result.recognition.isDangerous) {
      userMsg.result = result;
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: result.content,
      time: "刚刚",
      result,
    };
    setMessages((prev) => [...prev, aiMsg]);

    if (result.emotion) {
      setLastEmotion({ type: result.emotion, intensity: result.recognition.emotion.intensity });
    }

    await createEmotionRecord(content, result);

    setIsTyping(false);
  };

  const recentCount = getRecentMessageCount();
  const canSend = recentCount < MAX_MESSAGES;

  if (inCall && avatarUrl) {
    return <VideoCallPage avatarUrl={avatarUrl} onEnd={() => setInCall(false)} />;
  }

  return (
    <div className="px-4 pt-4 animate-fade-in pb-2">
      <div className="flex gap-2 mb-3 p-1 bg-gray-100 rounded-2xl">
        <button
          onClick={() => setMode("video")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium btn-pressable transition-all",
            mode === "video" ? "bg-white shadow-sm text-primary-600" : "text-gray-500"
          )}
        >
          <Video className="w-4 h-4" /> AI视频陪伴
        </button>
        <button
          onClick={() => setMode("chat")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium btn-pressable transition-all",
            mode === "chat" ? "bg-white shadow-sm text-primary-600" : "text-gray-500"
          )}
        >
          <MessageCircle className="w-4 h-4" /> 情绪陪伴
        </button>
      </div>

      {lastEmotion && mode === "chat" && (
        <div className={cn("rounded-xl p-3 mb-3 flex items-center gap-2", emotionColors[lastEmotion.type as keyof typeof emotionColors].bg)}>
          <span className="text-lg">{emotionIconMap[lastEmotion.type as keyof typeof emotionIconMap]}</span>
          <div className="flex-1">
            <div className={cn("text-sm font-semibold", emotionColors[lastEmotion.type as keyof typeof emotionColors].text)}>
              检测到情绪：{lastEmotion.type === "happy" ? "开心" : lastEmotion.type === "sad" ? "难过" : lastEmotion.type === "anxious" ? "焦虑" : lastEmotion.type === "angry" ? "生气" : lastEmotion.type === "lonely" ? "孤独" : lastEmotion.type === "hopeful" ? "充满希望" : lastEmotion.type === "confused" ? "迷茫" : "平静"}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", emotionColors[lastEmotion.type as keyof typeof emotionColors].gradient)} style={{ width: `${lastEmotion.intensity}%` }} />
              </div>
              <span className="text-xs text-gray-500">{lastEmotion.intensity}%</span>
            </div>
          </div>
        </div>
      )}

      {mode === "video" && !avatarUrl && (
        <div
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-2xl p-8 flex flex-col items-center border-2 border-dashed transition-all",
            isDragging ? "border-primary-500 bg-primary-50" : "border-pink-200"
          )}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-pink-200/50 animate-float">
            <ImageIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">上传照片生成AI伙伴</h3>
          <p className="text-sm text-gray-500 text-center mb-6">上传一张人像照片，AI将生成专属数字人<br />陪伴你聊天、倾听你的心事</p>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium btn-pressable shadow-lg shadow-pink-200/50"
            >
              <Upload className="w-5 h-5" /> 选择照片
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

          <p className="text-xs text-gray-400 mt-4">支持拖拽上传 · 照片仅用于本地生成，不会上传服务器</p>
        </div>
      )}

      {mode === "video" && avatarUrl && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-800 to-gray-900">
            <img src={avatarUrl} alt="AI Avatar" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-xs">AI伙伴准备就绪</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setInCall(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium btn-pressable shadow-lg"
                >
                  <Video className="w-5 h-5" /> 开始视频陪伴
                </button>
                <button
                  onClick={() => setAvatarUrl(null)}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center btn-pressable"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "chat" && (
        <div className="flex flex-col" style={{ height: "calc(100vh - 300px)" }}>
          <div className="flex-1 overflow-y-auto space-y-3 pb-2 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "ai" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                  msg.role === "user"
                    ? "bg-primary-500 text-white rounded-br-md"
                    : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                )}>
                  {msg.content}
                </div>
                {msg.result?.recognition.isDangerous && (
                  <div className="ml-2 flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mr-2">
                  <Heart className="w-4 h-4 text-white" />
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
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 mb-2 text-center">
              <span className="text-xs text-amber-700">对话过于频繁，请稍等片刻再发送</span>
            </div>
          )}

          <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide pb-1">
            {quickPhrases.map((phrase) => (
              <button
                key={phrase}
                onClick={() => handleSend(phrase)}
                disabled={!canSend}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs btn-pressable transition-all",
                  canSend ? "bg-white border border-gray-200 text-gray-600" : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {phrase}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-sm">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSend && handleSend()}
              placeholder={canSend ? "说说你的心事..." : "对话过于频繁，请稍等片刻"}
              disabled={!canSend}
              className={cn(
                "flex-1 px-3 py-2 text-sm outline-none bg-transparent transition-all",
                !canSend && "text-gray-400 cursor-not-allowed"
              )}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || !canSend}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center btn-pressable transition-all",
                inputText.trim() && canSend ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-400"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmotionDiary({ emotionRecords }: { emotionRecords: EmotionRecord[] }) {
  const [diary, setDiary] = useState<EmotionDiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiary = async () => {
      setLoading(true);
      const result = await generateEmotionDiary(emotionRecords);
      setDiary(result);
      setLoading(false);
    };
    loadDiary();
  }, [emotionRecords]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Calendar className="w-10 h-10 text-gray-300 mb-2" />
        <span className="text-sm text-gray-400">AI正在生成今日情绪日记...</span>
      </div>
    );
  }

  if (!diary) return null;

  const cfg = emotionColors[diary.emotion];

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className={cn("rounded-2xl p-4", cfg.bg, cfg.border, "border")}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emotionIconMap[diary.emotion]}</span>
            <div>
              <div className="text-sm text-gray-500">{formatDate(diary.date)}</div>
              <div className={cn("text-lg font-bold", cfg.text)}>今日心情</div>
            </div>
          </div>
          <div className={cn("px-3 py-1 rounded-full text-xs font-medium", cfg.bg, cfg.text)}>
            {diary.emotion === "happy" ? "开心" : diary.emotion === "sad" ? "难过" : diary.emotion === "anxious" ? "焦虑" : diary.emotion === "angry" ? "生气" : diary.emotion === "lonely" ? "孤独" : diary.emotion === "hopeful" ? "充满希望" : diary.emotion === "confused" ? "迷茫" : "平静"}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>情绪强度</span>
            <span>{diary.intensity}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-1000", cfg.gradient)} style={{ width: `${diary.intensity}%` }} />
          </div>
        </div>

        <p className={cn("text-sm font-medium", cfg.text)}>{diary.summary}</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-500" /> 情绪记录
        </h3>
        {diary.content === "今天还没有记录情绪" ? (
          <p className="text-sm text-gray-400 text-center py-4">今天还没有情绪记录，去聊天页面记录一下吧~</p>
        ) : (
          <div className="space-y-2">
            {diary.content.split("\n").map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Clock className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{line}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" /> 暖心建议
        </h3>
        <div className="space-y-2">
          {diary.suggestions.map((suggestion, i) => (
            <div key={i} className={cn("flex items-start gap-2 p-3 rounded-xl", cfg.bg)}>
              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", cfg.text, "bg-white")}>{i + 1}</span>
              <span className={cn("text-sm", cfg.text)}>{suggestion}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage({ onBack }: CommunityPageProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "diary">("chat");
  const [emotionRecords] = useState<EmotionRecord[]>([]);

  return (
    <div className="animate-fade-in pb-24 min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 btn-pressable">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">星星树洞</h1>
            <p className="text-pink-100 text-sm mt-0.5">AI情绪陪伴，温暖守护每一颗心</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold text-white">2,847</div>
            <div className="text-xs text-pink-100">今日倾诉</div>
          </div>
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold text-white">98.2%</div>
            <div className="text-xs text-pink-100">满意度</div>
          </div>
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-white">24h</span>
            </div>
            <div className="text-xs text-pink-100">在线陪伴</div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab("chat")}
            className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1", activeTab === "chat" ? "bg-white shadow-sm text-primary-600" : "text-gray-500")}
          >
            <MessageCircle className="w-3.5 h-3.5" /> 情绪陪伴
          </button>
          <button
            onClick={() => setActiveTab("diary")}
            className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1", activeTab === "diary" ? "bg-white shadow-sm text-primary-600" : "text-gray-500")}
          >
            <BookOpen className="w-3.5 h-3.5" /> 情绪日记
            {emotionRecords.length > 0 && <span className="text-[10px] bg-primary-100 text-primary-600 px-1 rounded">{emotionRecords.length}</span>}
          </button>
        </div>
      </div>

      {activeTab === "chat" && (
        <EmotionChat />
      )}

      {activeTab === "diary" && (
        <EmotionDiary emotionRecords={emotionRecords} />
      )}
    </div>
  );
}
