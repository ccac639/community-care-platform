import { useState } from "react";
import { ArrowLeft, Shield, MapPin, Bell, Phone, Watch, Wifi, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";
import { cn } from "../lib/utils";

interface ElderPageProps {
  onBack: () => void;
}

const elders = [
  { id: "1", name: "张爷爷", age: 78, status: "safe", lastSeen: "10分钟前", location: "小区花园", heartRate: 72, steps: 3200, battery: 85 },
  { id: "2", name: "李奶奶", age: 72, status: "safe", lastSeen: "25分钟前", location: "社区活动中心", heartRate: 76, steps: 2800, battery: 62 },
];

const features = [
  { icon: MapPin, title: "实时定位", desc: "查看老人实时位置", color: "bg-blue-50 text-blue-600" },
  { icon: Bell, title: "走失预警", desc: "电子围栏异常提醒", color: "bg-amber-50 text-amber-600" },
  { icon: Watch, title: "健康监测", desc: "心率步数异常报警", color: "bg-red-50 text-red-600" },
  { icon: Phone, title: "一键呼叫", desc: "紧急情况快速求助", color: "bg-green-50 text-green-600" },
];

export default function ElderPage({ onBack }: ElderPageProps) {
  const [selectedElder, setSelectedElder] = useState<string | null>(null);

  return (
    <div className="animate-fade-in pb-24 min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 btn-pressable">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">智慧助老</h1>
            <p className="text-green-100 text-sm mt-0.5">无感监护 · 防走失 · 安全守护</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <button key={f.title} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 btn-pressable">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", f.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{f.title}</div>
                  <div className="text-xs text-green-100">{f.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">监护列表</h2>
          <button className="text-xs text-primary-600 font-medium btn-pressable">+ 添加老人</button>
        </div>

        <div className="space-y-3">
          {elders.map((elder) => (
            <div key={elder.id} className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {elder.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{elder.name}</span>
                      <span className="text-xs text-gray-400">{elder.age}岁</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {elder.status === "safe" ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span className={cn("text-xs", elder.status === "safe" ? "text-green-600" : "text-amber-600")}>
                        {elder.status === "safe" ? "安全" : "需关注"}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center btn-pressable">
                  <Phone className="w-4 h-4 text-green-600" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {elder.lastSeen}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {elder.location}</span>
              </div>

              <button
                onClick={() => setSelectedElder(selectedElder === elder.id ? null : elder.id)}
                className="w-full bg-gray-50 rounded-xl p-3 flex items-center gap-4"
              >
                <div className="flex items-center gap-2 flex-1">
                  <HeartBeat hr={elder.heartRate} />
                  <div>
                    <div className="text-lg font-bold text-gray-800">{elder.heartRate}<span className="text-xs font-normal text-gray-400 ml-1">bpm</span></div>
                    <div className="text-xs text-gray-400">心率正常</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <WalkIcon />
                  <div>
                    <div className="text-lg font-bold text-gray-800">{elder.steps.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-1">步</span></div>
                    <div className="text-xs text-gray-400">今日活动</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-gray-400" />
                  <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", elder.battery > 50 ? "bg-green-500" : elder.battery > 20 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${elder.battery}%` }} />
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">绑定智能手环</h3>
            <p className="text-xs text-blue-100 mt-0.5">实时监测健康数据，异常自动报警</p>
          </div>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-semibold btn-pressable">
            去绑定
          </button>
        </div>
      </div>
    </div>
  );
}

function HeartBeat({ hr }: { hr: number }) {
  return (
    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center relative">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500">
        <path
          fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    </div>
  );
}

function WalkIcon() {
  return (
    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="13" cy="4" r="2" fill="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 22l3-8 4-3 2 5h3M9 12l3-5 3 2M15 22l-2-7" />
      </svg>
    </div>
  );
}
