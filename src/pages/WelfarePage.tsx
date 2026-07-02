import { useState, useEffect } from "react";
import { Heart, Search, AlertTriangle, Users, Baby, HelpCircle, AlertCircle, Share2, TrendingUp, TrendingDown, MapPin, Clock, ArrowRight, Shield, Zap, FileWarning } from "lucide-react";
import { cn } from "../lib/utils";
import { welfareStats, crisisEvents, districtRisks, type WelfareStats, type CrisisEvent } from "../data/mockData";
import { calculateWelfareRisk, analyzeRiskTrend, generateSuggestions, type WelfareRiskResult, type RiskTrend, type RiskSuggestion } from "../core/ai";
import HeatMapView from "../components/HeatMapView";

interface WelfarePageProps {
  onBack?: () => void;
}

export default function WelfarePage({ onBack }: WelfarePageProps) {
  const [viewLevel, setViewLevel] = useState<"province" | "city" | "district">("city");
  const [riskResult, setRiskResult] = useState<WelfareRiskResult | null>(null);
  const [riskTrend, setRiskTrend] = useState<RiskTrend | null>(null);
  const [suggestions, setSuggestions] = useState<RiskSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const stats = welfareStats[viewLevel];
      const [risk, trend, sgs] = await Promise.all([
        calculateWelfareRisk(stats),
        analyzeRiskTrend(),
        generateSuggestions(),
      ]);
      setRiskResult(risk);
      setRiskTrend(trend);
      setSuggestions(sgs);
      setLoading(false);
    };
    loadData();
  }, [viewLevel]);

  const levelLabels = { province: "全省", city: "本市", district: "本区" };

  const statItems: { key: keyof WelfareStats; label: string; icon: any; color: string }[] = [
    { key: "missingBabyren", label: "失踪儿童", icon: AlertTriangle, color: "text-red-500 bg-red-50" },
    { key: "distressPeople", label: "危难人群", icon: Users, color: "text-orange-500 bg-orange-50" },
    { key: "leftBehindBabyren", label: "留守儿童", icon: Baby, color: "text-blue-500 bg-blue-50" },
    { key: "helpEvents", label: "求助事件", icon: HelpCircle, color: "text-green-500 bg-green-50" },
    { key: "aiReviewed", label: "AI甄别", icon: Shield, color: "text-purple-500 bg-purple-50" },
  ];

  const eventTypeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    missing: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", label: "失踪" },
    distress: { icon: Users, color: "text-orange-500", bg: "bg-orange-50", label: "危难" },
    child: { icon: Baby, color: "text-blue-500", bg: "bg-blue-50", label: "儿童" },
  };

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    urgent: { color: "text-red-600", bg: "bg-red-100", label: "紧急" },
    warning: { color: "text-amber-600", bg: "bg-amber-100", label: "预警" },
    normal: { color: "text-gray-600", bg: "bg-gray-100", label: "普通" },
  };

  const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
    high: { color: "text-red-600", bg: "bg-red-50", label: "高" },
    medium: { color: "text-amber-600", bg: "bg-amber-50", label: "中" },
    low: { color: "text-gray-600", bg: "bg-gray-50", label: "低" },
  };

  return (
    <div className="animate-fade-in pb-24 min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 px-4 pt-12 pb-8 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            {onBack && (
              <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 btn-pressable">
                <ArrowRight className="w-5 h-5 text-white rotate-180" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-white" />
              <h1 className="text-xl font-bold text-white">爱心公益中心</h1>
            </div>
          </div>
          <p className="text-pink-100 text-sm">汇聚爱心，温暖社区每一个人</p>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* 公益风险总览 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-pink-500" /> 公益风险总览
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["province", "city", "district"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setViewLevel(level)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                    viewLevel === level ? "bg-white shadow-sm text-pink-600" : "text-gray-500"
                  )}
                >
                  {levelLabels[level]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">公益安全指数</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{loading ? "--" : riskResult?.score}</span>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", riskResult?.levelColor || "text-gray-600", "bg-gray-100")}>
                  {loading ? "计算中" : riskResult?.levelLabel}
                </span>
              </div>
            </div>
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500 transition-all duration-1000"
                style={{ width: `${loading ? 0 : riskResult?.score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {statItems.map((item) => {
              const Icon = item.icon;
              const stats = welfareStats[viewLevel];
              return (
                <div key={item.key} className="flex flex-col items-center">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-gray-800 mt-1">{stats[item.key]}</div>
                  <div className="text-[10px] text-gray-400">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 危机事件 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> 危机事件
            </h2>
            <button className="text-xs text-pink-500 font-medium flex items-center gap-1">
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {crisisEvents.map((event) => {
              const typeConfig = eventTypeConfig[event.type];
              const status = statusConfig[event.status];
              const TypeIcon = typeConfig.icon;
              return (
                <div
                  key={event.id}
                  className={cn("flex-shrink-0 w-64 rounded-xl p-3 border transition-all", event.status === "urgent" ? "border-red-200 bg-red-50/50" : "border-gray-100 bg-gray-50")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("flex items-center gap-1.5", typeConfig.color)}>
                      <TypeIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">{typeConfig.label}</span>
                    </div>
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", status.bg, status.color)}>
                      {status.label}
                    </span>
                  </div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{event.title}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 公益分析 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-500" /> 公益分析
          </h2>

          {riskTrend && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {riskTrend.trends.map((trend) => (
                  <div key={trend.category} className="flex-1 bg-gray-50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 mb-1">{trend.category}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 text-sm">{trend.current}</span>
                      <div className={cn("flex items-center gap-0.5 text-xs", trend.trend === "down" ? "text-green-500" : "text-red-500")}>
                        {trend.trend === "down" ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        <span>{Math.abs(trend.change)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                {riskTrend.summary}
              </p>
            </div>
          )}

          <div className="mt-4">
            <div className="text-xs font-medium text-gray-500 mb-2">AI建议</div>
            <div className="space-y-2">
              {suggestions.map((sg) => (
                <div key={sg.id} className="flex gap-2">
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0", priorityConfig[sg.priority].bg, priorityConfig[sg.priority].color)}>
                    {priorityConfig[sg.priority].label}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{sg.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{sg.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 社会事件热力图 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-purple-500" /> 区域风险热力图
          </h2>
          <HeatMapView risks={districtRisks} />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {districtRisks.slice(0, 4).map((risk) => (
              <div key={risk.name} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <span className="text-xs text-gray-600">{risk.name}</span>
                <span className={cn("text-xs font-bold", risk.riskLevel === "high" ? "text-red-500" : risk.riskLevel === "medium" ? "text-amber-500" : "text-green-500")}>
                  {risk.riskScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 帮助中心 */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-4 mt-4">
          <h2 className="font-bold text-white flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5" /> 帮助中心
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <button className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center gap-2 btn-pressable">
              <HelpCircle className="w-8 h-8 text-white" />
              <span className="text-white text-sm font-medium">我要帮助</span>
            </button>
            <button className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center gap-2 btn-pressable">
              <FileWarning className="w-8 h-8 text-white" />
              <span className="text-white text-sm font-medium">上报事件</span>
            </button>
            <button className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center gap-2 btn-pressable">
              <Share2 className="w-8 h-8 text-white" />
              <span className="text-white text-sm font-medium">扩散求助</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
