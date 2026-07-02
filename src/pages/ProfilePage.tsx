import { ArrowLeft, User, Settings, Heart, FileText, Shield, HelpCircle, ChevronRight, Bell, Moon, Globe, LogOut } from "lucide-react";
import { cn } from "../lib/utils";

interface ProfilePageProps {
  onBack: () => void;
}

const menuItems = [
  { icon: Heart, label: "我的收藏", desc: "保存的文章与服务" },
  { icon: FileText, label: "咨询记录", desc: "查看历史咨询与对话" },
  { icon: Bell, label: "消息通知", desc: "预警、活动推送设置" },
  { icon: Shield, label: "隐私设置", desc: "数据安全与授权管理" },
  { icon: Moon, label: "长辈模式", desc: "大字体、高对比度" },
  { icon: Globe, label: "语言设置", desc: "简体中文" },
  { icon: HelpCircle, label: "帮助与反馈", desc: "使用指南、问题反馈" },
  { icon: Settings, label: "设置", desc: "账号与通用设置" },
];

export default function ProfilePage({ onBack }: ProfilePageProps) {
  return (
    <div className="animate-fade-in pb-24 min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-20 translate-x-20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 btn-pressable">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">我的</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">守望用户</h2>
              <p className="text-sm text-purple-100 mt-0.5">守望邻里，温暖社区</p>
            </div>
            <button className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-medium btn-pressable">
              编辑资料
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-4 mb-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {[
              { value: "5", label: "收藏" },
              { value: "12", label: "咨询" },
              { value: "3", label: "志愿" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-gray-100 mb-4">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-500">公益服务</h3>
          </div>
          <button className="w-full flex items-center gap-4 p-4 btn-pressable hover:bg-gray-50">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-800">成为志愿者</div>
              <div className="text-xs text-gray-400 mt-0.5">用爱心温暖社区每一位需要帮助的人</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-gray-100">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                className={cn(
                  "w-full flex items-center gap-4 p-4 btn-pressable hover:bg-gray-50",
                  i > 0 && "border-t border-gray-50"
                )}
              >
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-800">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            );
          })}
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white rounded-2xl text-red-500 font-medium btn-pressable shadow-sm shadow-gray-100">
          <LogOut className="w-4 h-4" /> 退出登录
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">守望 v1.0.0 · AI全龄社区关怀服务平台</p>
      </div>
    </div>
  );
}
