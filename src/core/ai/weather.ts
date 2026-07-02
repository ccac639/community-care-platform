// 天气数据 — AI能力模块
import type { WeatherData } from "./types";
import { delay } from "./_utils";

/**
 * 获取当前位置天气信息
 * 包含天气状况、室外温度、室内温度、湿度、风力、空气质量等
 */
export async function getCurrentWeather(): Promise<WeatherData> {
  await delay(500);

  const now = new Date();
  const hour = now.getHours();
  let baseTemp = 26;
  if (hour >= 11 && hour <= 14) baseTemp = 33;
  else if (hour >= 15 && hour <= 17) baseTemp = 31;
  else if (hour >= 6 && hour <= 10) baseTemp = 27;
  else if (hour >= 18 && hour <= 20) baseTemp = 28;
  else baseTemp = 24;

  const indoorTemp = baseTemp - 4 + Math.random() * 2;

  const weathers = [
    { weather: "晴", icon: "☀️" },
    { weather: "多云", icon: "⛅" },
    { weather: "阴", icon: "☁️" },
  ];
  const pick = weathers[Math.floor(Math.random() * weathers.length)];

  return {
    city: "北京市",
    weather: pick.weather,
    icon: pick.icon,
    outdoorTemp: Math.round(baseTemp + Math.random() * 2),
    indoorTemp: Math.round(indoorTemp * 10) / 10,
    humidity: Math.round(45 + Math.random() * 20),
    wind: "东南风 2级",
    aqi: Math.round(60 + Math.random() * 40),
    aqiLevel: "良",
    feelsLike: Math.round(baseTemp + 2 + Math.random() * 2),
  };
}
