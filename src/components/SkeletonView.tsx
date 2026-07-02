interface SkeletonViewProps {
  affectedAreas: string[];
}

const boneColors: Record<string, { fill: string; stroke: string }> = {
  normal: { fill: "#e5e7eb", stroke: "#9ca3af" },
  affected: { fill: "#fecaca", stroke: "#ef4444" },
};

export default function SkeletonView({ affectedAreas }: SkeletonViewProps) {
  const getBoneStyle = (boneId: string) => {
    const isAffected = affectedAreas.includes(boneId);
    return isAffected ? boneColors.affected : boneColors.normal;
  };

  const getAnimateClass = (boneId: string) => {
    return affectedAreas.includes(boneId) ? "animate-pulse" : "";
  };

  return (
    <div className="flex flex-col items-center py-4">
      <svg viewBox="0 0 200 380" className="w-40 h-72">
        <ellipse cx="100" cy="35" rx="28" ry="32" fill={getBoneStyle("skull").fill} stroke={getBoneStyle("skull").stroke} strokeWidth="2" className={getAnimateClass("skull")} />
        <circle cx="90" cy="32" r="3" fill="#666" />
        <circle cx="110" cy="32" r="3" fill="#666" />
        <path d="M93 48 Q100 53 107 48" stroke="#666" strokeWidth="1.5" fill="none" />

        <rect x="85" y="67" width="30" height="15" rx="4" fill={getBoneStyle("spine").fill} stroke={getBoneStyle("spine").stroke} strokeWidth="2" className={getAnimateClass("spine")} />

        <path d="M55 90 Q40 100 45 130" stroke={getBoneStyle("arm").stroke} strokeWidth="8" fill="none" strokeLinecap="round" className={getAnimateClass("arm")} />
        <path d="M45 130 Q40 155 50 175" stroke={getBoneStyle("arm").stroke} strokeWidth="7" fill="none" strokeLinecap="round" className={getAnimateClass("arm")} />
        <circle cx="52" cy="180" r="6" fill={getBoneStyle("arm").fill} stroke={getBoneStyle("arm").stroke} strokeWidth="1.5" />

        <path d="M145 90 Q160 100 155 130" stroke={getBoneStyle("arm").stroke} strokeWidth="8" fill="none" strokeLinecap="round" className={getAnimateClass("arm")} />
        <path d="M155 130 Q160 155 150 175" stroke={getBoneStyle("arm").stroke} strokeWidth="7" fill="none" strokeLinecap="round" className={getAnimateClass("arm")} />
        <circle cx="148" cy="180" r="6" fill={getBoneStyle("arm").fill} stroke={getBoneStyle("arm").stroke} strokeWidth="1.5" />

        <path d="M70 85 L82 85 L82 155 L70 155 Z" fill={getBoneStyle("rib").fill} stroke={getBoneStyle("rib").stroke} strokeWidth="1.5" rx="3" />
        <path d="M130 85 L118 85 L118 155 L130 155 Z" fill={getBoneStyle("rib").fill} stroke={getBoneStyle("rib").stroke} strokeWidth="1.5" rx="3" />

        {[95, 108, 121, 134].map((y) => (
          <line key={y} x1="70" y1={y} x2="130" y2={y} stroke={getBoneStyle("rib").stroke} strokeWidth="1.5" />
        ))}

        <rect x="90" y="155" width="20" height="45" rx="4" fill={getBoneStyle("spine").fill} stroke={getBoneStyle("spine").stroke} strokeWidth="2" className={getAnimateClass("spine")} />

        <path d="M90 200 Q50 210 55 260" stroke={getBoneStyle("leg").stroke} strokeWidth="10" fill="none" strokeLinecap="round" className={getAnimateClass("leg")} />
        <path d="M55 260 Q52 295 58 325" stroke={getBoneStyle("leg").stroke} strokeWidth="9" fill="none" strokeLinecap="round" className={getAnimateClass("leg")} />
        <ellipse cx="58" cy="335" rx="14" ry="8" fill={getBoneStyle("leg").fill} stroke={getBoneStyle("leg").stroke} strokeWidth="1.5" />

        <path d="M110 200 Q150 210 145 260" stroke={getBoneStyle("leg").stroke} strokeWidth="10" fill="none" strokeLinecap="round" className={getAnimateClass("leg")} />
        <path d="M145 260 Q148 295 142 325" stroke={getBoneStyle("leg").stroke} strokeWidth="9" fill="none" strokeLinecap="round" className={getAnimateClass("leg")} />
        <ellipse cx="142" cy="335" rx="14" ry="8" fill={getBoneStyle("leg").fill} stroke={getBoneStyle("leg").stroke} strokeWidth="1.5" />

        <ellipse cx="100" cy="168" rx="22" ry="10" fill={getBoneStyle("pelvis").fill} stroke={getBoneStyle("pelvis").stroke} strokeWidth="2" />
      </svg>

      <div className="flex items-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200 border border-gray-400" />
          <span className="text-gray-500">正常部位</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-200 border border-red-400 animate-pulse" />
          <span className="text-gray-500">疑似异常</span>
        </div>
      </div>
    </div>
  );
}
