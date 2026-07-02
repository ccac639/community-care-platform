import { useEffect, useRef, useState } from "react";
import { AMAP_KEY } from "../lib/utils";
import type { DistrictRisk } from "../data/mockData";

interface HeatMapViewProps {
  risks: DistrictRisk[];
}

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: any;
  }
}

export default function HeatMapView({ risks }: HeatMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    window._AMapSecurityConfig = { securityJsCode: "f334a8c7077f638e084d79838d68cab5" };

    if (window.AMap) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.HeatMap`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.AMap) return;

    const AMap = window.AMap;
    const map = new AMap.Map(mapRef.current, {
      zoom: 10,
      center: [116.39, 39.9],
      mapStyle: "amap://styles/light",
      zooms: [9, 14],
    });

    const heatData = risks.map((r) => [r.lng, r.lat, r.riskScore * 2]);

    map.plugin(["AMap.HeatMap"], () => {
      const heatmap = new AMap.HeatMap(map, {
        radius: 25,
        opacity: [0.3, 0.8],
        gradient: {
          0.4: "rgba(0, 255, 0, 0.6)",
          0.65: "rgba(255, 255, 0, 0.7)",
          0.8: "rgba(255, 128, 0, 0.8)",
          1.0: "rgba(255, 0, 0, 0.9)",
        },
      });
      heatmap.setDataSet({
        data: heatData,
        max: 100,
      });
    });

    risks.forEach((risk) => {
      const color = risk.riskLevel === "high" ? "#ef4444" : risk.riskLevel === "medium" ? "#f59e0b" : "#22c55e";
      const size = risk.riskLevel === "high" ? 36 : risk.riskLevel === "medium" ? 32 : 28;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="${color}" fill-opacity="0.2"/>
        <circle cx="16" cy="16" r="10" fill="${color}" fill-opacity="0.4"/>
        <circle cx="16" cy="16" r="6" fill="${color}"/>
        <text x="16" y="20" font-size="10" text-anchor="middle" fill="white" font-weight="bold">${risk.riskScore}</text>
      </svg>`;

      const marker = new AMap.Marker({
        position: [risk.lng, risk.lat],
        content: `<img src="data:image/svg+xml;base64,${btoa(svg)}" style="width:${size}px;height:${size}px;display:block;"/>`,
        anchor: "center",
      });

      marker.setMap(map);
    });

    return () => {
      map.destroy?.();
    };
  }, [loaded, risks]);

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-100">
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500">热力图加载中...</span>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}

      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-[10px] text-gray-600">低风险</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] text-gray-600">中风险</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[10px] text-gray-600">高风险</span>
          </div>
        </div>
      </div>
    </div>
  );
}
