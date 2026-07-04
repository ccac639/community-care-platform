import { useState, useRef } from "react";
import { Camera, Upload, CheckCircle, AlertTriangle, XCircle, Info, ArrowLeft, ScanLine } from "lucide-react";
import { cn } from "../lib/utils";
import { foodAdditives } from "../data/mockData";
import { analyzeFoodLabel, type FoodAnalysisResult } from "../core/ai";

interface FoodPageProps {
  onBack: () => void;
}

const riskConfig = {
  safe: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", border: "border-green-200", label: "安全", labelBg: "bg-green-500" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", label: "注意", labelBg: "bg-amber-500" },
  danger: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "危险", labelBg: "bg-red-500" },
};

export default function FoodPage({ onBack }: FoodPageProps) {
  const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload");
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setImage(imageData);
      setStep("analyzing");
      const analysisResult = await analyzeFoodLabel(imageData);
      setResult(analysisResult);
      setStep("result");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const scoreColor = result ? (result.score >= 80 ? "text-green-500" : result.score >= 60 ? "text-amber-500" : "text-red-500") : "";
  const scoreRingColor = result ? (result.score >= 80 ? "#22c55e" : result.score >= 60 ? "#f59e0b" : "#ef4444") : "#ef4444";

  return (
    <div className="animate-fade-in pb-24 min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-30 border-b border-gray-100">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 btn-pressable">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">食品安全识别</h1>
      </div>

      {step === "upload" && (
        <div className="px-4 pt-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200/50 animate-float">
              <ScanLine className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">扫描食品配料表</h2>
            <p className="text-sm text-gray-500 text-center mb-6">拍照或上传配料表照片<br />AI自动识别添加剂并给出建议</p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-medium btn-pressable shadow-lg shadow-orange-200/50"
              >
                <Camera className="w-5 h-5" /> 拍照识别
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium btn-pressable"
              >
                <Upload className="w-5 h-5" /> 上传图片
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" /> 常见食品添加剂
            </h3>
            <div className="space-y-2">
              {foodAdditives.map((item) => {
                const cfg = riskConfig[item.risk];
                const Icon = cfg.icon;
                return (
                  <div key={item.name} className={cn("bg-white rounded-xl p-3 flex items-center gap-3 border", cfg.border)}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cfg.bg)}>
                      <Icon className={cn("w-4 h-4", cfg.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                        <span className={cn("text-xs text-white px-1.5 py-0.5 rounded", cfg.labelBg)}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === "analyzing" && (
        <div className="px-4 pt-12 flex flex-col items-center">
          {image && <img src={image} alt="" className="w-48 h-48 object-cover rounded-2xl shadow-lg mb-6 opacity-60" />}
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-orange-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-700 font-medium">正在识别配料表...</p>
          <p className="text-sm text-gray-400 mt-1">AI分析中，请稍候</p>
        </div>
      )}

      {step === "result" && result && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke={scoreRingColor}
                    strokeWidth="5"
                    strokeDasharray={`${(result.score / 100) * 176} 176`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className={cn("absolute text-lg font-bold", scoreColor)}>{result.score}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800">{result.productName}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{result.summary}</p>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-2">配料成分分析</h3>
          <div className="bg-white rounded-2xl overflow-hidden mb-4">
            {result.ingredients.map((ing, i) => {
              const cfg = riskConfig[ing.risk];
              const Icon = cfg.icon;
              return (
                <div key={i} className={cn("flex items-center gap-3 p-3.5", i > 0 && "border-t border-gray-50")}>
                  <Icon className={cn("w-5 h-5 flex-shrink-0", cfg.color)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{ing.name}</span>
                      <span className={cn("text-xs text-white px-1.5 py-0.5 rounded", cfg.labelBg)}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{ing.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-2">健康建议</h3>
          <div className="bg-blue-50 rounded-2xl p-4 mb-4">
            {result.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">{s}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setStep("upload"); setImage(null); setResult(null); }}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-medium btn-pressable shadow-lg shadow-orange-200/50"
          >
            重新识别
          </button>
        </div>
      )}
    </div>
  );
}
