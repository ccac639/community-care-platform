import { useState, useEffect } from "react";
import { AlertTriangle, Radio, Home, MapPin, Phone, Shield, Activity, CloudLightning, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { assessDisasterRisk, type DisasterRiskResult } from "../services/aiService";

interface DisasterPageProps {
  onBack?: () => void;
}

const disasterIcons: Record<string, string> = {
  earthquake: "🌋",
  fire: "🔥",
  flood: "🌊",
  typhoon: "🌀",
};

const emergencyContacts = [
  { name: "火警", phone: "119", icon: "🚒" },
  { name: "急救", phone: "120", icon: "🚑" },
  { name: "报警", phone: "110", icon: "🚓" },
  { name: "社区服务", phone: "12345", icon: "🏢" },
];

const levelConfig = {
  safe: { color: "text-green-700", bg: "from-green-50 to-emerald-50", border: "border-green-100", iconBg: "bg-green-500", label: "整体安全", desc: "社区暂无重大灾害风险" },
  low: { color: "text-yellow-700", bg: "from-yellow-50 to-amber-50", border: "border-yellow-100", iconBg: "bg-yellow-500", label: "低风险", desc: "部分区域需关注" },
  medium: { color: "text-orange-700", bg: "from-orange-50 to-red-50", border: "border-orange-100", iconBg: "bg-orange-500", label: "中风险", desc: "请注意防护" },
  high: { color: "text-red-700", bg: "from-red-50 to-rose-50", border: "border-red-100", iconBg: "bg-red-500", label: "高风险", desc: "请立即采取应急措施" },
};

export default function DisasterPage({ onBack }: DisasterPageProps) {
  const [riskData, setRiskData] = useState<DisasterRiskResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await assessDisasterRisk();
      if (active) {
        setRiskData(result);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const levelCfg = riskData ? levelConfig[riskData.overallLevel] : levelConfig.safe;

  return (
    <div className="animate-fade-in pb-24 min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 px-4 pt-12 pb-8 rounded-b-[2rem] relative overflow-hidden">
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
              <AlertTriangle className="w-7 h-7 text-white" />
              <h1 className="text-xl font-bold text-white">社会风险 · 灾害预警</h1>
            </div>
          </div>
          <p className="text-orange-100 text-sm">实时监测，提前预警，守护社区安全</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-gray-800">当前风险等级</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              <span className="text-sm text-gray-400 ml-2">AI评估中...</span>
            </div>
          ) : (
            <div className={cn("bg-gradient-to-r rounded-xl p-4 border", levelCfg.bg, levelCfg.border)}>
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", levelCfg.iconBg)}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className={cn("text-lg font-bold", levelCfg.color)}>{levelCfg.label}</div>
                  <div className={cn("text-xs", levelCfg.color, "opacity-70")}>{levelCfg.desc}</div>
                </div>
                {riskData && (
                  <div className="ml-auto text-right">
                    <div className={cn("text-2xl font-bold", levelCfg.color)}>{riskData.score}</div>
                    <div className="text-[10px] text-gray-400">风险指数</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CloudLightning className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-800">灾害类型监测</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(riskData?.types || []).map((d) => (
              <div key={d.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="text-2xl mb-2">{disasterIcons[d.id] || "⚠️"}</div>
                <div className="text-sm font-semibold text-gray-800">{d.name}</div>
                <div className="text-xs text-gray-500 mt-1">{d.level}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-800">紧急联系电话</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {emergencyContacts.map((c) => (
              <a
                key={c.name}
                href={`tel:${c.phone}`}
                className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 btn-pressable border border-gray-100"
              >
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{c.name}</div>
                  <div className="text-xs text-primary-500 font-medium">{c.phone}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-gray-800">社区避难场所</h3>
          </div>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
              <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800">社区公园应急避难所</div>
                <div className="text-xs text-gray-500 truncate">距您 500m · 可容纳 2000 人</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
              <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800">中心小学体育馆</div>
                <div className="text-xs text-gray-500 truncate">距您 1.2km · 可容纳 5000 人</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex items-start gap-2">
            <Radio className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-800 mb-1">应急广播</div>
              <p className="text-xs text-amber-700 leading-relaxed">
                灾害发生时，社区将通过广播、短信、APP推送等多渠道发布预警信息，请保持手机畅通，关注官方通知。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
