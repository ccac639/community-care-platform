import { useState } from "react";
import { ArrowLeft, Stethoscope, Search, MapPin, ChevronDown, ChevronUp, Activity, AlertCircle, Navigation, Phone, Crosshair, Map as MapIcon, Building2 } from "lucide-react";
import { cn } from "../lib/utils";
import { rareDiseases, hospitals as staticHospitals, type Hospital } from "../data/mockData";
import AMapView from "../components/AMapView";
import SkeletonView from "../components/SkeletonView";

interface MedicalPageProps {
  onBack: () => void;
}

interface HospitalWithDistance extends Hospital {
  realDistance?: number;
}

const symptoms = [
  "易骨折", "蓝巩膜", "听力下降", "关节松弛", "身材矮小",
  "骨骼畸形", "皮肤白皙", "视力异常", "肌肉无力",
];

export default function MedicalPage({ onBack }: MedicalPageProps) {
  const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [mapInitialHospitalId, setMapInitialHospitalId] = useState<string | null>(null);
  const [expandedDisease, setExpandedDisease] = useState<string | null>(rareDiseases[0].id);
  const [nearbyHospitals, setNearbyHospitals] = useState<HospitalWithDistance[]>(staticHospitals);
  const [userLocated, setUserLocated] = useState(false);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) return;
    setStep("analyzing");
    setTimeout(() => {
      setStep("result");
      setExpandedDisease(rareDiseases[0].id);
    }, 2500);
  };

  const handleOpenMap = (hospitalId?: string) => {
    setMapInitialHospitalId(hospitalId || null);
    setShowMap(true);
  };

  const topDisease = rareDiseases[0];
  const nearestHospital = nearbyHospitals[0];

  return (
    <div className="animate-fade-in pb-24 min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-30 border-b border-gray-100">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 btn-pressable">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">罕见病诊疗导航</h1>
      </div>

      {step === "input" && (
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 mb-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-5 h-5" />
              <h2 className="font-bold">AI症状初筛</h2>
            </div>
            <p className="text-sm text-blue-100">选择您或家人的症状，AI将辅助分析可能的罕见病方向，结果仅供参考，请以医生诊断为准。</p>
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-3">请选择症状（可多选）</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {symptoms.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={cn(
                  "px-3.5 py-2 rounded-full text-sm font-medium btn-pressable transition-all",
                  selectedSymptoms.includes(s)
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-200/50"
                    : "bg-white text-gray-600 border border-gray-200"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={selectedSymptoms.length === 0}
            className={cn(
              "w-full py-3 rounded-xl font-medium btn-pressable transition-all flex items-center justify-center gap-2",
              selectedSymptoms.length > 0
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Search className="w-5 h-5" /> 开始AI初筛（已选{selectedSymptoms.length}项）
          </button>

          <div className="mt-6 bg-amber-50 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              温馨提示：本工具为AI辅助初筛，不能替代专业医生诊断。如有疑似症状，请及时前往正规医院就诊。
            </p>
          </div>
        </div>
      )}

      {step === "analyzing" && (
        <div className="px-4 pt-12 flex flex-col items-center">
          <div className="w-20 h-20 relative mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Activity className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-gray-800 font-semibold text-lg">AI正在深度分析...</p>
          <p className="text-sm text-gray-500 mt-2">正在匹配症状数据库（含8,000+罕见病）</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      )}

      {step === "result" && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">初筛结果</h2>
              <span className="text-xs text-gray-400">仅供参考</span>
            </div>

            <div className="flex items-center justify-center mb-3">
              <SkeletonView affectedAreas={topDisease.affectedAreas} />
            </div>

            <div className="space-y-3">
              {rareDiseases.map((d) => {
                const isExpanded = expandedDisease === d.id;
                const isTop = d.probability >= 50;
                return (
                  <div
                    key={d.id}
                    className={cn(
                      "rounded-xl border p-3 transition-all",
                      isTop ? "border-red-200 bg-red-50/50" : "border-gray-100 bg-gray-50"
                    )}
                  >
                    <button
                      onClick={() => setExpandedDisease(isExpanded ? null : d.id)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                          isTop ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                        )}>
                          {d.probability}%
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm">{d.name}</span>
                            {isTop && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">高匹配</span>}
                          </div>
                          <p className="text-xs text-gray-500">{d.alias}</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2 animate-fade-in">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {d.name}（{d.alias}）是一种由于基因缺陷导致的罕见遗传性疾病，主要表现为上述相关症状。建议尽快到具备罕见病诊疗能力的三甲医院就诊。
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-500" />
                附近推荐医院
              </h3>
              <button
                onClick={() => handleOpenMap()}
                className="flex items-center gap-1 text-xs text-primary-600 font-medium btn-pressable"
              >
                <MapIcon className="w-3.5 h-3.5" /> 地图视图
              </button>
            </div>

            {userLocated ? (
              <div className="flex items-center gap-1.5 mb-3 text-xs text-green-600 bg-green-50 rounded-lg px-2.5 py-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                已定位 · 按距离排序，最近医院：{nearestHospital?.name}（{nearestHospital?.distance}）
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <MapPin className="w-3.5 h-3.5" />
                打开地图可定位您的位置，查找最近医院
              </div>
            )}

            <div className="space-y-2">
              {nearbyHospitals.map((hospital, index) => {
                const isNearest = index === 0 && userLocated;
                return (
                  <div
                    key={hospital.id}
                    className={cn(
                      "rounded-xl p-3 border transition-all",
                      isNearest ? "border-green-200 bg-green-50/50" : "border-gray-100 bg-gray-50/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800 text-sm">{hospital.name}</span>
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] rounded font-medium">{hospital.level}</span>
                          {isNearest && (
                            <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded font-medium">最近</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{hospital.address}</span>
                          {userLocated && <span className="text-primary-600 font-medium flex-shrink-0">· {hospital.distance}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2.5">
                      <a
                        href={`tel:${hospital.phone}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium btn-pressable"
                      >
                        <Phone className="w-3.5 h-3.5" /> 电话
                      </a>
                      <button
                        onClick={() => handleOpenMap(hospital.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium btn-pressable text-white",
                          isNearest ? "bg-green-500" : "bg-primary-500"
                        )}
                      >
                        <Navigation className="w-3.5 h-3.5" /> 导航
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              建议：以上结果基于症状匹配，不能替代医学诊断。请尽快导航至专业医疗机构进一步检查。
            </p>
          </div>

          <button
            onClick={() => { setStep("input"); setSelectedSymptoms([]); setUserLocated(false); setNearbyHospitals(staticHospitals); }}
            className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium btn-pressable"
          >
            重新初筛
          </button>
        </div>
      )}

      {showMap && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-2xl overflow-hidden animate-slide-up flex flex-col" style={{ height: "85vh" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" /> 附近推荐医院
              </h3>
              <button onClick={() => { setShowMap(false); setMapInitialHospitalId(null); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 btn-pressable text-gray-500">
                关闭
              </button>
            </div>
            <div className="flex-1 relative">
              <AMapView
                onHospitalsUpdate={setNearbyHospitals}
                onUserLocation={setUserLocated}
                initialSelectedHospitalId={mapInitialHospitalId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
