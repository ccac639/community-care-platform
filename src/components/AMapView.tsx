import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Phone, X, Crosshair, Loader2, User as UserIcon, Car, Clock, Stethoscope, Star } from "lucide-react";
import { hospitals as staticHospitals, type Hospital } from "../data/mockData";
import { AMAP_KEY, cn } from "../lib/utils";

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: any;
  }
}

interface HospitalWithDistance extends Hospital {
  realDistance?: number;
}

interface RouteInfo {
  distance: number;
  duration: number;
}

interface AMapViewProps {
  onClose?: () => void;
  onHospitalsUpdate?: (hospitals: HospitalWithDistance[]) => void;
  onUserLocation?: (located: boolean) => void;
  initialSelectedHospitalId?: string | null;
}

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

export default function AMapView({ onClose, onHospitalsUpdate, onUserLocation, initialSelectedHospitalId }: AMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const userPosRef = useRef<[number, number] | null>(null);
  const hospitalMarkersRef = useRef<Map<string, any>>(new Map());
  const autoSelectedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [userLocated, setUserLocated] = useState(false);
  const [hospitalsWithDist, setHospitalsWithDist] = useState<HospitalWithDistance[]>(staticHospitals);
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
              strokeColor: "#3b82f6",
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
            setRouteLoading(false);
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

  const updateHospitalDistances = useCallback(
    (userLng: number, userLat: number, AMap: any, map: any) => {
      const updated = staticHospitals.map((h) => {
        const dist = calculateDistance(userLng, userLat, h.lng, h.lat);
        return { ...h, realDistance: dist, distance: formatDistance(dist) };
      });
      updated.sort((a, b) => (a.realDistance || 0) - (b.realDistance || 0));

      map.getAllOverlays("marker").forEach((m: any) => {
        if (m !== userMarkerRef.current) map.remove(m);
      });
      hospitalMarkersRef.current.clear();
      clearRoute();

      updated.forEach((hospital, index) => {
        const isNearest = index === 0;
        const size = isNearest ? 42 : 36;
        const color = isNearest ? "#22c55e" : "#ef4444";
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 36 46">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" fill="${color}"/>
          <rect x="14" y="10" width="8" height="16" fill="white" rx="1"/>
          <rect x="10" y="14" width="16" height="8" fill="white" rx="1"/>
          ${isNearest ? `<circle cx="18" cy="44" r="4" fill="#22c55e" stroke="white" stroke-width="1.5"/>` : ""}
        </svg>`;

        const marker = new AMap.Marker({
          position: [hospital.lng, hospital.lat],
          content: `<img src="data:image/svg+xml;base64,${btoa(svg)}" style="width:${size}px;height:${size + 10}px;display:block;"/>`,
          anchor: "bottom-center",
          offset: new AMap.Pixel(0, 0),
          zIndex: isNearest ? 50 : 10,
        });

        marker.on("click", () => {
          setSelectedHospital(hospital.id);
          if (userPosRef.current) {
            drawRoute(AMap, map, userPosRef.current, [hospital.lng, hospital.lat]);
          }
        });
        marker.setMap(map);
        hospitalMarkersRef.current.set(hospital.id, marker);
      });

      setHospitalsWithDist(updated);
      onHospitalsUpdate?.(updated);
      return updated;
    },
    [onHospitalsUpdate, clearRoute, drawRoute]
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
            updateHospitalDistances(lng, lat, AMap, map);
            setUserLocated(true);
            onUserLocation?.(true);

            const allPositions = [[lng, lat], ...staticHospitals.map((h) => [h.lng, h.lat])];
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
  }, [addUserMarker, updateHospitalDistances, onUserLocation, clearRoute]);

  const doBrowserLocate = useCallback(
    (AMap: any, map: any) => {
      if (!navigator.geolocation) {
        setLocating(false);
        setLocationError("浏览器不支持定位");
        setUserLocated(false);
        onUserLocation?.(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          addUserMarker(AMap, map, longitude, latitude);
          updateHospitalDistances(longitude, latitude, AMap, map);
          setUserLocated(true);
          setLocating(false);
          onUserLocation?.(true);

          const allPositions = [[longitude, latitude], ...staticHospitals.map((h) => [h.lng, h.lat])];
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
          onUserLocation?.(false);
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
    [addUserMarker, updateHospitalDistances, onUserLocation]
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

    hospitalMarkersRef.current.clear();

    staticHospitals.forEach((hospital) => {
      const size = 36;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 36 46">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" fill="#ef4444"/>
        <rect x="14" y="10" width="8" height="16" fill="white" rx="1"/>
        <rect x="10" y="14" width="16" height="8" fill="white" rx="1"/>
      </svg>`;

      const marker = new AMap.Marker({
        position: [hospital.lng, hospital.lat],
        content: `<img src="data:image/svg+xml;base64,${btoa(svg)}" style="width:${size}px;height:${size + 10}px;display:block;"/>`,
        anchor: "bottom-center",
        offset: new AMap.Pixel(0, 0),
      });

      marker.on("click", () => setSelectedHospital(hospital.id));
      marker.setMap(map);
      hospitalMarkersRef.current.set(hospital.id, marker);
    });

    setTimeout(() => {
      map.setFitView();
      const currentZoom = map.getZoom();
      if (currentZoom > 15) map.setZoom(15);
      if (currentZoom < 12) map.setZoom(13);

      if (initialSelectedHospitalId && !autoSelectedRef.current) {
        autoSelectedRef.current = true;
        const targetHospital = staticHospitals.find((h) => h.id === initialSelectedHospitalId);
        if (targetHospital) {
          map.setCenter([targetHospital.lng, targetHospital.lat]);
          map.setZoom(15);
          setSelectedHospital(targetHospital.id);
        }
      }
    }, 300);

    mapInstanceRef.current = map;

    setTimeout(() => doLocate(), 500);
  }, [loaded, doLocate, initialSelectedHospitalId]);

  useEffect(() => {
    if (!selectedHospital || !userPosRef.current || !mapInstanceRef.current || !window.AMap) return;
    const hospital = hospitalsWithDist.find((h) => h.id === selectedHospital);
    if (hospital) {
      drawRoute(window.AMap, mapInstanceRef.current, userPosRef.current, [hospital.lng, hospital.lat]);
    }
  }, [selectedHospital, hospitalsWithDist, drawRoute, userLocated]);

  const handleNavigate = (hospital: HospitalWithDistance) => {
    const { lng, lat, name } = hospital;
    let url = `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=car&policy=1&src=守望平台&coordinate=gaode&callnative=1`;
    if (userPosRef.current) {
      url += `&from=${userPosRef.current[0]},${userPosRef.current[1]},我的位置`;
    }
    window.open(url, "_blank");
  };

  const selected = hospitalsWithDist.find((h) => h.id === selectedHospital);
  const nearest = hospitalsWithDist[0];

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-2xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
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
            <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
          ) : userLocated ? (
            <Crosshair className="w-5 h-5 text-primary-500" />
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

      {userLocated && nearest && !selected && (
        <div className="absolute top-14 left-3 right-3 z-10">
          <div className="bg-green-500 text-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-sm">
            <Navigation className="w-4 h-4" />
            <span className="font-medium">最近医院：{nearest.name}</span>
            <span className="text-green-100 ml-auto">{nearest.distance}</span>
          </div>
        </div>
      )}

      {locationError && (
        <div className="absolute top-14 left-3 right-3 z-10">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{locationError}，显示默认位置附近医院</span>
          </div>
        </div>
      )}

      {!userLocated && !locating && !locationError && loaded && !selected && (
        <div className="absolute bottom-24 left-3 right-3 z-10">
          <button
            onClick={doLocate}
            className="w-full bg-white rounded-xl px-4 py-3 shadow-lg flex items-center justify-center gap-2 btn-pressable"
          >
            <Crosshair className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">定位到我的位置，查找最近医院</span>
          </button>
        </div>
      )}

      {selected && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-20 max-h-[60%] overflow-y-auto scrollbar-hide">
          <div className="p-4 pb-8">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-lg">{selected.name}</h3>
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full font-medium">
                    {selected.level}
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
                  setSelectedHospital(null);
                  clearRoute();
                }}
                className="p-1 -mr-1 text-gray-400 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userLocated && routeInfo && (
              <div className="bg-blue-50 rounded-xl p-3 mb-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm font-semibold text-blue-700">
                      {routeLoading ? "路线规划中..." : `驾车约${formatDuration(routeInfo.duration)}`}
                    </div>
                    <div className="text-xs text-blue-500">{formatDistance(routeInfo.distance)}</div>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-blue-600">
                  <Clock className="w-3.5 h-3.5" /> 推荐路线
                </div>
              </div>
            )}

            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Stethoscope className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-semibold text-gray-600">建议挂号科室</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selected.departments.map((dept) => (
                  <span
                    key={dept}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium",
                      dept.includes("罕见病") || dept.includes("遗传") || dept.includes("骨科")
                        ? "bg-primary-50 text-primary-600 border border-primary-200"
                        : "bg-gray-50 text-gray-600 border border-gray-100"
                    )}
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-gray-600">推荐医生</span>
              </div>
              <div className="space-y-2">
                {selected.recommendedDoctors.map((doctor, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{doctor.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded font-medium">
                          {doctor.title}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span className="text-primary-500 font-medium">{doctor.department}</span>
                        <span className="mx-1 text-gray-300">|</span>
                        擅长：{doctor.specialty}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${selected.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium btn-pressable"
              >
                <Phone className="w-4 h-4" /> 电话咨询
              </a>
              <button
                onClick={() => handleNavigate(selected)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-500 text-white rounded-xl font-medium btn-pressable shadow-lg shadow-primary-200/50"
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
