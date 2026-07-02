import { Shield, HeartPulse, UtensilsCrossed, AlertTriangle, MessageCircleHeart, HandHeart, Bell, ChevronRight, Activity, TrendingUp, Eye, Zap } from "lucide-react";
import { cn } from "../lib/utils";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const riskModules = [
  { id: "health", icon: HeartPulse, title: "健康风险", subtitle: "医疗导航", desc: "症状初筛·就医指引", color: "from-blue-500 to-indigo-600", bg: "bg-blue-50", level: "正常", levelColor: "text-green-600", levelBg: "bg-green-50" },
  { id: "life", icon: UtensilsCrossed, title: "生活风险", subtitle: "食品安全", desc: "配料识别·风险提示", color: "from-orange-500 to-red-500", bg: "bg-orange-50", level: "正常", levelColor: "text-green-600", levelBg: "bg-green-50" },
  { id: "social", icon: AlertTriangle, title: "社会风险", subtitle: "灾害预警", desc: "实时监测·应急响应", color: "from-amber-500 to-orange-600", bg: "bg-amber-50", level: "低风险", levelColor: "text-green-600", levelBg: "bg-green-50" },
  { id: "psych", icon: MessageCircleHeart, title: "心理风险", subtitle: "社区陪伴", desc: "AI倾诉·成长陪伴", color: "from-pink-500 to-rose-600", bg: "bg-pink-50", level: "正常", levelColor: "text-green-600", levelBg: "bg-green-50" },
  { id: "welfare", icon: HandHeart, title: "公共响应", subtitle: "公益中心", desc: "志愿服务·爱心互助", color: "from-rose-500 to-fuchsia-600", bg: "bg-rose-50", level: "活跃", levelColor: "text-primary-600", levelBg: "bg-primary-50" },
];

const alerts = [
  { id: 1, type: "info", title: "高温天气预警", desc: "今日气温36°C，请注意防暑降温", time: "10分钟前", module: "社会风险" },
  { id: 2, type: "warning", title: "食品添加剂提醒", desc: "近期购买的零食含3种争议添加剂", time: "2小时前", module: "生活风险" },
  { id: 3, type: "info", title: "社区公益活动", desc: "本周六老年健康义诊活动报名中", time: "昨天", module: "公共响应" },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6) return "凌晨好";
    if (h < 12) return "上午好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    return "晚上好";
  };

  return (
    <div className="animate-fade-in pb-24">
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 px-4 pt-12 pb-10 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
        <div className="absolute top-20 left-1/2 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-blue-100 text-sm">{greeting()}，守望者</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-7 h-7 text-white" />
                <h1 className="text-2xl font-bold text-white">守 望</h1>
              </div>
              <p className="text-blue-100 text-xs mt-1">AI社会风险感知与社区关怀系统</p>
            </div>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center btn-pressable backdrop-blur-sm relative">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>

          <div className="glass rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">社区整体风险指数</span>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-4xl font-bold text-white">28</div>
                <div className="text-xs text-blue-100 mt-0.5">低风险 · 一切安好</div>
              </div>
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-[28%] bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1 text-xs text-blue-100">
                <Eye className="w-3.5 h-3.5" />
                <span>5大风险维度实时监测</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-300">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>较昨日 ↓ 12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              风险感知模块
            </h2>
            <span className="text-xs text-gray-400">点击查看详情</span>
          </div>
          <div className="space-y-2.5">
            {riskModules.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => onNavigate(m.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl btn-pressable transition-all hover:bg-gray-50 border border-gray-100"
                >
                  <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md", m.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{m.title}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{m.subtitle}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", m.levelBg, m.levelColor)}>
                      {m.level}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">风险预警</h2>
          <button className="text-xs text-gray-400 flex items-center gap-0.5 btn-pressable">
            全部 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl p-3.5 flex items-start gap-3 shadow-sm shadow-gray-100">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                alert.type === "warning" ? "bg-amber-50" : "bg-blue-50"
              )}>
                <AlertTriangle className={cn("w-5 h-5", alert.type === "warning" ? "text-amber-500" : "text-blue-500")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">{alert.title}</h3>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0 ml-2">
                    {alert.module}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{alert.desc}</p>
                <p className="text-[10px] text-gray-400 mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-5">
        <h2 className="text-base font-bold text-gray-800 mb-3">今日数据</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "1,286", label: "监测人群", unit: "人" },
            { value: "23", label: "风险预警", unit: "条" },
            { value: "98.2%", label: "响应及时率", unit: "" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center shadow-sm shadow-gray-100">
              <div className="text-lg font-bold text-primary-600">{stat.value}<span className="text-xs font-normal text-gray-400 ml-0.5">{stat.unit}</span></div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
