import { Heart, HandHeart, Gift, Users, Calendar, ArrowRight } from "lucide-react";

interface WelfarePageProps {
  onBack?: () => void;
}

export default function WelfarePage({ onBack }: WelfarePageProps) {
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

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <HandHeart className="w-16 h-16 mb-4 text-pink-200" />
            <p className="text-sm">爱心公益中心</p>
            <p className="text-xs mt-1">功能模块建设中...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
