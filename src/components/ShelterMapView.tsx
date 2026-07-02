import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, X, Crosshair, Loader2, Car, Clock, Home, Users } from "lucide-react";
import { shelters as staticShelters, type Shelter } from "../data/mockData";
import { AMAP_KEY } from "../lib/utils";

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: any;
  }
}

interface ShelterWithDistance extends Shelter {
  realDistance?: number;
  distanceStr?: string;
}

interface RouteInfo {
  distance: number;
  duration: number;
}

const shelterTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
  park: { icon: "🌳", color: "#22c55e", label: "公园" },
  school: { icon: "🏫", color: "#3b82f6", label: "学校" },
  stadium: { icon: "🏟️", color: "#f59e0b", label: "体育馆" },
  community: { icon: "🏢", color: "#8b5cf6", label: "社区中心" },
};

function calculateDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}分钟`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}

interface ShelterMapViewProps {
  onClose?: () => void;
}

export default function ShelterMapView({ onClose }: ShelterMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const userPosRef = useRef<[number, number] | null>(null);
  const shelterMarkersRef = useRef<Map<string, any>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [userLocated, setUserLocated] = useState(false);
  const [sheltersWithDist, setSheltersWithDist] = useState<ShelterWithDistance[]>(staticShelters);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const clearRoute = useCallback(() => {
    if (routePolylineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.remove(routePolylineRef.current);
      routePolylineRef.current = null;
    }
    setRouteInfo(null);
  }, []);

  const drawRoute = useCallback((AMap: any, map: any, from: [number, number], to: [number, number]) => {
    setRouteLoading(true);
    clearRoute();

    AMap.plugin("AMap.Driving", () => {
      const driving = new AMap.Driving({
        map: map,
        hideMarkers: true,
        autoFitView: false,
        policy: 1,
      });

      driving.search(
        new AMap.LngLat(from[0], from[1]),
        new AMap.LngLat(to[0], to[1]),
        (status: string, result: any) => {
          setRouteLoading(false);
          if (status === "complete" && result.routes && result.routes.length > 0) {
            const route = result.routes[0];
            const distanceKm = route.distance / 1000;
            const durationMin = route.time / 60;
            setRouteInfo({ distance: distanceKm, duration: durationMin });

            const path: [number, number][] = [];
            route.steps.forEach((step: any) => {
              step.path.forEach((p: any) => {
                path.push([p.lng, p.lat]);
              });
            });

            const polyline = new AMap.Polyline({
              path,
              strokeColor: "#22c55e",
              strokeWeight: 6,
              strokeOpacity: 0.9,
              lineJoin: "round",
              lineCap: "round",
              showDir: true,
              strokeStyle: "solid",
              zIndex: 80,
            });
            polyline.setMap(map);
            routePolylineRef.current = polyline;

            map.setFitView([userMarkerRef.current].concat(
              map.getAllOverlays("marker").filter((m: any) => m !== userMarkerRef.current)
            ), false, [60, 60, 300, 60]);
            setTimeout(() => {
              const z = map.getZoom();
              if (z > 15) map.setZoom(15);
              if (z < 12) map.setZoom(13);
            }, 200);
          } else {
            const dist = calculateDistance(from[0], from[1], to[0], to[1]);
            setRouteInfo({ distance: dist, duration: dist * 3.5 });
          }
        }
      );
    });
  }, [clearRoute]);

  const addUserMarker = useCallback((AMap: any, map: any, lng: number, lat: number) => {
    userPosRef.current = [lng, lat];
    if (userMarkerRef.current) {
      map.remove(userMarkerRef.current);
    }

    const size = 44;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="18" fill="#3b82f6" fill-opacity="0.2">
        <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="22" cy="22" r="10" fill="#3b82f6" fill-opacity="0.3"/>
      <circle cx="22" cy="22" r="6" fill="#3b82f6" stroke="white" stroke-width="2.5"/>
    </svg>`;

    const marker = new AMap.Marker({
      position: [lng, lat],
      content: `<img src="data:image/svg+xml;base64,${btoa(svg)}" style="width:${size}px;height:${size}px;display:block;"/>`,
      anchor: "center",
      offset: new AMap.Pixel(0, 0),
      zIndex: 100,
    });

    marker.setMap(map);
    userMarkerRef.current = marker;
  }, []);

  const updateShelterDistances = useCallback(
    (userLng: number, userLat: number, AMap: any, map: any) => {
      const updated = staticShelters.map((s) => {
        const dist = calculateDistance(userLng, userLat, s.lng, s.lat);
        return { ...s, realDistance: dist, distanceStr: formatDistance(dist) };
      });
      updated.sort((a, b) => (a.realDistance || 0) - (b.realDistance || 0));

      map.getAllOverlays("marker").forEach((m: any) => {
        if (m !== userMarkerRef.current) map.remove(m);
      });
      shelterMarkersRef.current.clear();
      clearRoute();

      updated.forEach((shelter, index) => {
        const isNearest = index === 0;
        const cfg = shelterTypeConfig[shelter.type];
        const size = isNearest ? 42 : 36;
        const color = isNearest ? "#22c55e" : cfg.color;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 36 46">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" fill="${color}"/>
          <text x="18" y="24" font-size="16" text-anchor="middle" fill="white">${cfg.icon}</text>
          ${isNearest ? `<circle cx="18" cy="44" r="4" fill="#22c55e" stroke="white" stroke-width="1.5"/>` : ""}
        </svg>`;

        const marker = new AMap.Marker({
          position: [shelter.lng, shelter.lat],
          content: `<img src="data:image/svg+xml;base64,${btoa(svg)}" style="width:${size}px;height:${size + 10}px;display:block;"/>`,
          anchor: "bottom-center",
          offset: new AMap.Pixel(0, 0),
          zIndex: isNearest ? 50 : 10,
        });

        marker.on("click", () => {
          setSelectedShelter(shelter.id);
          if (userPosRef.current) {
            drawRoute(AMap, map, userPosRef.current, [shelter.lng, shelter.lat]);
          }
        });
        marker.setMap(map);
        shelterMarkersRef.current.set(shelter.id, marker);
      });

      setSheltersWithDist(updated);

      // 自动选中最近的避难所
      if (updated.length > 0) {
        const nearest = updated[0];
        setSelectedShelter(nearest.id);
        drawRoute(AMap, map, [userLng, userLat], [nearest.lng, nearest.lat]);
      }

      return updated;
    },
    [clearRoute, drawRoute]
  );

  const doLocate = useCallback(() => {
    if (!mapInstanceRef.current || !window.AMap) return;
    const AMap = window.AMap;
    const map = mapInstanceRef.current;
    setLocating(true);
    setLocationError(null);
    clearRoute();

    AMap.plugin("AMap.Geolocation", () => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        buttonPosition: "RB",
        zoomToAccuracy: false,
      });

      geolocation.getCurrentPosition(
        (status: string, result: any) => {
          setLocating(false);
          if (status === "complete") {
            const { lng, lat } = result.position;
            addUserMarker(AMap, map, lng, lat);
            updateShelterDistances(lng, lat, AMap, map);
            setUserLocated(true);

            const allPositions = [[lng, lat], ...staticShelters.map((s) => [s.lng, s.lat])];
            map.setFitView(allPositions, false, [60, 60, 60, 60]);
            setTimeout(() => {
              const z = map.getZoom();
              if (z > 15) map.setZoom(15);
              if (z < 12) map.setZoom(13);
            }, 200);
          } else {
            doBrowserLocate(AMap, map);
          }
        }
      );
    });
  }, [addUserMarker, updateShelterDistances, clearRoute]);

  const doBrowserLocate = useCallback(
    (AMap: any, map: any) => {
      if (!navigator.geolocation) {
        setLocating(false);
        setLocationError("浏览器不支持定位");
        setUserLocated(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          addUserMarker(AMap, map, longitude, latitude);
          updateShelterDistances(longitude, latitude, AMap, map);
          setUserLocated(true);
          setLocating(false);

          const allPositions = [[longitude, latitude], ...staticShelters.map((s) => [s.lng, s.lat])];
          map.setFitView(allPositions, false, [60, 60, 60, 60]);
          setTimeout(() => {
            const z = map.getZoom();
            if (z > 15) map.setZoom(15);
            if (z < 12) map.setZoom(13);
          }, 200);
        },
        (err) => {
          setLocating(false);
          setUserLocated(false);
          const msgs: Record<number, string> = {
            1: "定位权限被拒绝，请在浏览器设置中允许位置访问",
            2: "无法获取位置信息，请检查设备定位是否开启",
            3: "定位超时，请稍后重试",
          };
          setLocationError(msgs[err.code] || "定位失败");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    },
    [addUserMarker, updateShelterDistances]
  );

  useEffect(() => {
    window._AMapSecurityConfig = { securityJsCode: "f334a8c7077f638e084d79838d68cab5" };

    if (window.AMap) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geolocation,AMap.Driving`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy?.();
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return;

    const AMap = window.AMap;
    const center = [116.407, 39.92];
    const map = new AMap.Map(mapRef.current, {
      zoom: 13,
      center,
      mapStyle: "amap://styles/whitesmoke",
      zooms: [11, 18],
    });

    shelterMarkersRef.current.clear();

    staticShelters.forEach((shelter) => {
      const cfg = shelterTypeConfig[shelter.type];
      const size = 36;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 36 46">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" fill="${cfg.color}"/>
        <text x="18" y="24" font-size="16" text-anchor="middle" fill="white">${cfg.icon}</text>
      </svg>`;

      const marker = new AMap.Marker({
        position: [shelter.lng, shelter.lat],
        content: `<img src="data:image/svg+xml;base64,${btoa(svg)}" style="width:${size}px;height:${size + 10}px;display:block;"/>`,
        anchor: "bottom-center",
        offset: new AMap.Pixel(0, 0),
      });

      marker.on("click", () => setSelectedShelter(shelter.id));
      marker.setMap(map);
      shelterMarkersRef.current.set(shelter.id, marker);
    });

    setTimeout(() => {
      map.setFitView();
      const currentZoom = map.getZoom();
      if (currentZoom > 15) map.setZoom(15);
      if (currentZoom < 12) map.setZoom(13);
    }, 300);

    mapInstanceRef.current = map;

    setTimeout(() => doLocate(), 500);
  }, [loaded, doLocate]);

  const handleNavigate = (shelter: ShelterWithDistance) => {
    const { lng, lat, name } = shelter;
    let url = `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=walk&policy=1&src=守望平台&coordinate=gaode&callnative=1`;
    if (userPosRef.current) {
      url += `&from=${userPosRef.current[0]},${userPosRef.current[1]},我的位置`;
    }
    window.open(url, "_blank");
  };

  const selected = sheltersWithDist.find((s) => s.id === selectedShelter);
  const nearest = sheltersWithDist[0];

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-2xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">地图加载中...</span>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        <button
          onClick={doLocate}
          disabled={locating}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center btn-pressable"
          title="定位到我的位置"
        >
          {locating ? (
            <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
          ) : userLocated ? (
            <Crosshair className="w-5 h-5 text-green-500" />
          ) : (
            <Crosshair className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center btn-pressable z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {userLocated && nearest && (
        <div className="absolute top-14 left-3 right-3 z-10">
          <div className="bg-green-500 text-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-sm">
            <Home className="w-4 h-4" />
            <span className="font-medium">最近避难所：{nearest.name}</span>
            <span className="text-green-100 ml-auto">{nearest.distanceStr}</span>
          </div>
        </div>
      )}

      {locationError && (
        <div className="absolute top-14 left-3 right-3 z-10">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{locationError}，显示默认位置附近避难所</span>
          </div>
        </div>
      )}

      {selected && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-20 max-h-[55%] overflow-y-auto scrollbar-hide">
          <div className="p-4 pb-8">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-lg">{selected.name}</h3>
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full font-medium">
                    {shelterTypeConfig[selected.type].label}
                  </span>
                  {selected.id === nearest?.id && userLocated && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                      最近
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selected.address}
                  {userLocated && routeInfo && ` · ${formatDistance(routeInfo.distance)}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedShelter(null);
                  clearRoute();
                }}
                className="p-1 -mr-1 text-gray-400 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2 flex-1">
                <Users className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-xs text-gray-400">容纳人数</div>
                  <div className="text-sm font-semibold text-purple-700">{selected.capacity.toLocaleString()} 人</div>
                </div>
              </div>
            </div>

            {userLocated && routeInfo && (
              <div className="bg-green-50 rounded-xl p-3 mb-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm font-semibold text-green-700">
                      {routeLoading ? "路线规划中..." : `步行约${formatDuration(routeInfo.duration)}`}
                    </div>
                    <div className="text-xs text-green-500">{formatDistance(routeInfo.distance)}</div>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-green-600">
                  <Clock className="w-3.5 h-3.5" /> 推荐路线
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleNavigate(selected)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white rounded-xl font-medium btn-pressable shadow-lg shadow-green-200/50"
              >
                <Navigation className="w-4 h-4" /> {userLocated ? "开始导航" : "立即导航"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
