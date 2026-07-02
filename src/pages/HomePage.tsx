import { Shield, UtensilsCrossed, Stethoscope, Heart, AlertTriangle, Bell, ChevronRight, Users, Clock, MapPin } from "lucide-react";
import { cn } from "../lib/utils";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const services = [
  { id: "food", icon: UtensilsCrossed, title: "食品安全", desc: "配料表智能识别", color: "from-orange-400 to-red-500", bg: "bg-orange-50" },
  { id: "medical", icon: Stethoscope, title: "罕见病导航", desc: "症状初筛+就医指引", color: "from-blue-400 to-indigo-500", bg: "bg-blue-50" },
  { id: "community", icon: Heart, title: "星星树洞", desc: "AI陪伴倾诉", color: "from-pink-400 to-rose-500", bg: "bg-pink-50" },
  { id: "elder", icon: Shield, title: "智慧助老", desc: "无感监护防走失", color: "from-green-400 to-emerald-500", bg: "bg-green-50" },
];

const alerts = [
  { id: 1, type: "warning", title: "高温预警", desc: "今日气温38°C，注意老人防暑", time: "10分钟前" },
  { id: 2, type: "info", title: "社区活动", desc: "周六上午9点老年健康讲座", time: "1小时前" },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="animate-fade-in pb-24">
      <div className="bg-gradient-to-br from-primary-500 via-blue-600 to-indigo-700 px-4 pt-12 pb-8 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-7 h-7 text-white" />
                <h1 className="text-xl font-bold text-white">守望</h1>
              </div>
              <p className="text-blue-100 text-sm mt-1">AI全龄社区关怀服务平台</p>
            </div>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center btn-pressable backdrop-blur-sm relative">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>

          <div className="glass rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">当前位置</p>
              <p className="text-sm font-semibold text-gray-800">北京市东城区东华门街道</p>
            </div>
            <div className="text-xs text-primary-600 font-medium flex items-center gap-0.5 btn-pressable">
              切换 <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-4">
          <div className="grid grid-cols-4 gap-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => onNavigate(service.id)}
                  className={cn("flex flex-col items-center gap-2 p-2 rounded-xl btn-pressable transition-all", service.bg, "hover:scale-105")}
                >
                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", service.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{service.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">关怀预警</h2>
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
                  <span className="text-xs text-gray-400 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {alert.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{alert.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-5">
        <h2 className="text-base font-bold text-gray-800 mb-3">公益数据</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "12,580", label: "已服务老人", unit: "人" },
            { value: "3,240", label: "助餐服务", unit: "次" },
            { value: "98.6%", label: "寻回成功率", unit: "" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center shadow-sm shadow-gray-100">
              <div className="text-lg font-bold text-primary-600">{stat.value}<span className="text-xs font-normal text-gray-400 ml-0.5">{stat.unit}</span></div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-5">
        <div className="bg-gradient-to-r from-care-500 to-green-600 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-green-200/50">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">加入志愿者</h3>
            <p className="text-xs text-green-100 mt-0.5">已有2,845位志愿者守护社区</p>
          </div>
          <button className="bg-white text-green-600 px-4 py-2 rounded-xl text-xs font-semibold btn-pressable">
            立即加入
          </button>
        </div>
      </div>
    </div>
  );
}
