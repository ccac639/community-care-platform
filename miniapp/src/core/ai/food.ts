// 生活风险 — AI能力模块
import type { FoodAnalysisResult } from "./types";
import { delay } from "./_utils";

/**
 * AI配料表识别分析
 * 根据上传的配料表图片，识别添加剂并给出风险评级和建议
 */
export async function analyzeFoodLabel(_imageData: string): Promise<FoodAnalysisResult> {
  await delay(2000);

  return {
    productName: "某品牌乳酸菌饮品",
    score: 65,
    level: "warning",
    summary: "含有多种食品添加剂，儿童建议少量饮用",
    ingredients: [
      { name: "水", risk: "safe", desc: "安全成分" },
      { name: "全脂乳粉", risk: "safe", desc: "优质奶源" },
      { name: "白砂糖", risk: "warning", desc: "含糖量较高，儿童需控制" },
      { name: "柠檬黄", risk: "warning", desc: "人工色素，可能影响儿童注意力" },
      { name: "安赛蜜", risk: "warning", desc: "人工甜味剂，建议适量食用" },
      { name: "山梨酸钾", risk: "safe", desc: "国标允许防腐剂" },
    ],
    suggestions: [
      "建议儿童每日饮用不超过1瓶",
      "不含三聚氰胺等违禁添加物",
      "乳糖不耐受人群请谨慎饮用",
    ],
  };
}
