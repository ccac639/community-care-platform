import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 类名合并工具
 * 小程序中如果使用 Taro + Tailwind 方案，依然可用；如未使用，可保留以兼容 Web 端代码
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化秒数为 mm:ss
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * 高德地图相关配置
 * 注意：小程序环境通常使用微信/抖音原生地图组件或 Taro 封装，
 *      不需要 Web 端 JS API Key，但此处保留导出以兼容可能的 H5 端代码。
 */
export const AMAP_KEY = "ac174ae87f8478936868875cf5ff0eda";
export const AMAP_SECURITY_CODE = "f334a8c7077f638e084d79838d68cab5";
