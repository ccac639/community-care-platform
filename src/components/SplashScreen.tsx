import { useState, useEffect } from "react";
import { Shield } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    const finishTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 500);
    }, 2000);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ maxWidth: "480px", left: "50%", transform: "translateX(-50%)" }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
      <div className="absolute top-20 left-1/2 w-32 h-32 bg-white/5 rounded-full" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 animate-pulse">
          <Shield className="w-14 h-14 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">守 望</h1>
        <p className="text-blue-100 text-sm">AI社会风险感知与社区关怀系统</p>
      </div>

      <div className="absolute bottom-20 w-48">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-200"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-center text-blue-100 text-xs mt-2">正在加载...</p>
      </div>

      <div className="absolute bottom-8 text-blue-100/60 text-xs">
        v1.0.0
      </div>
    </div>
  );
}
