import { useState } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import TabBar from "@/components/TabBar";
import { analyzeFoodLabel, type FoodAnalysisResult } from "@/core/ai";
import { foodAdditives } from "@/data/mockData";
import "./index.scss";

type RiskLevel = "safe" | "warning" | "danger";
type Step = "upload" | "analyzing" | "result";

interface RiskCfg {
  icon: string;
  color: string;
  bg: string;
  border: string;
  label: string;
}

const riskConfig: Record<RiskLevel, RiskCfg> = {
  safe: {
    icon: "✅",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    label: "安全",
  },
  warning: {
    icon: "⚠️",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    label: "注意",
  },
  danger: {
    icon: "❌",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    label: "危险",
  },
};

export default function Food() {
  const [step, setStep] = useState<Step>("upload");
  const [image, setImage] = useState<string>("");
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);

  const handleChooseImage = (sourceType: "camera" | "album") => {
    Taro.chooseImage({
      count: 1,
      sourceType: [sourceType],
      success: async (res) => {
        const filePath = res.tempFilePaths[0];
        setImage(filePath);
        setStep("analyzing");
        const analysisResult = await analyzeFoodLabel(filePath);
        setResult(analysisResult);
        setStep("result");
      },
      fail: () => {
        Taro.showToast({ title: "未选择图片", icon: "none" });
      },
    });
  };

  const handleReset = () => {
    setStep("upload");
    setImage("");
    setResult(null);
  };

  const handleBack = () => {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: "/pages/home/index" });
    });
  };

  const scoreColor = result
    ? result.score >= 80
      ? "#16a34a"
      : result.score >= 60
      ? "#d97706"
      : "#dc2626"
    : "#dc2626";

  return (
    <View className="food-page">
      {/* 顶部橙色渐变背景 */}
      <View className="header">
        <View className="header-deco header-deco-1" />
        <View className="header-deco header-deco-2" />
        <View className="header-content">
          <View className="header-title-row">
            <View className="back-btn" onClick={handleBack}>
              <Text className="back-icon">←</Text>
            </View>
            <View className="title-row">
              <Text className="title-icon">🍽️</Text>
              <Text className="title">食品安全</Text>
            </View>
          </View>
          <Text className="header-subtitle">
            拍照识别配料表，AI守护每一餐
          </Text>
        </View>
      </View>

      {/* 上传步骤 */}
      {step === "upload" && (
        <View className="upload-section">
          <View className="upload-card">
            <View className="upload-icon-wrap">
              <Text className="upload-icon">📷</Text>
            </View>
            <Text className="upload-title">扫描食品配料表</Text>
            <Text className="upload-desc">
              拍照或上传配料表照片{"\n"}AI自动识别添加剂并给出建议
            </Text>
            <View className="upload-btns">
              <View
                className="upload-btn upload-btn-primary"
                onClick={() => handleChooseImage("camera")}
              >
                <Text className="upload-btn-icon">📷</Text>
                <Text className="upload-btn-text">拍照识别</Text>
              </View>
              <View
                className="upload-btn upload-btn-outline"
                onClick={() => handleChooseImage("album")}
              >
                <Text className="upload-btn-icon">🖼️</Text>
                <Text className="upload-btn-text">上传图片</Text>
              </View>
            </View>
          </View>

          <View className="additive-card">
            <View className="additive-header">
              <Text className="additive-header-icon">ℹ️</Text>
              <Text className="additive-header-title">常见食品添加剂</Text>
            </View>
            <View className="additive-list">
              {foodAdditives.map((item) => {
                const cfg = riskConfig[item.risk];
                return (
                  <View
                    key={item.name}
                    className="additive-item"
                    style={{ borderColor: cfg.border }}
                  >
                    <View
                      className="additive-item-icon"
                      style={{ background: cfg.bg }}
                    >
                      <Text className="additive-item-emoji">{cfg.icon}</Text>
                    </View>
                    <View className="additive-item-info">
                      <View className="additive-item-name-row">
                        <Text className="additive-item-name">{item.name}</Text>
                        <View
                          className="additive-item-badge"
                          style={{ background: cfg.color }}
                        >
                          <Text className="additive-item-badge-text">
                            {cfg.label}
                          </Text>
                        </View>
                      </View>
                      <Text className="additive-item-desc">{item.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* 分析中 */}
      {step === "analyzing" && (
        <View className="analyzing-section">
          {image ? (
            <Image
              className="analyzing-image"
              src={image}
              mode="aspectFill"
            />
          ) : null}
          <View className="analyzing-spinner">
            <View className="analyzing-spinner-ring" />
          </View>
          <Text className="analyzing-text">正在识别配料表...</Text>
          <Text className="analyzing-subtext">AI分析中，请稍候</Text>
        </View>
      )}

      {/* 结果展示 */}
      {step === "result" && result && (
        <View className="result-section">
          {/* 评分卡 */}
          <View className="score-card">
            <View className="score-ring-wrap">
              <View
                className="score-ring"
                style={{
                  background: `conic-gradient(${scoreColor} ${
                    (result.score / 100) * 360
                  }deg, #f3f4f6 0deg)`,
                }}
              >
                <Text className="score-value" style={{ color: scoreColor }}>
                  {result.score}
                </Text>
              </View>
            </View>
            <View className="score-info">
              <Text className="score-product">{result.productName}</Text>
              <Text className="score-summary">{result.summary}</Text>
            </View>
          </View>

          {/* 配料成分分析 */}
          <View className="section-title-row">
            <Text className="section-title-icon">📋</Text>
            <Text className="section-title">配料成分分析</Text>
          </View>
          <View className="ingredients-card">
            {result.ingredients.map((ing, i) => {
              const cfg = riskConfig[ing.risk];
              return (
                <View
                  key={i}
                  className={`ingredient-item ${
                    i > 0 ? "ingredient-item-border" : ""
                  }`}
                >
                  <Text className="ingredient-item-emoji">{cfg.icon}</Text>
                  <View className="ingredient-item-info">
                    <View className="ingredient-item-name-row">
                      <Text className="ingredient-item-name">{ing.name}</Text>
                      <View
                        className="ingredient-item-badge"
                        style={{ background: cfg.color }}
                      >
                        <Text className="ingredient-item-badge-text">
                          {cfg.label}
                        </Text>
                      </View>
                    </View>
                    <Text className="ingredient-item-desc">{ing.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* 健康建议 */}
          <View className="section-title-row">
            <Text className="section-title-icon">💡</Text>
            <Text className="section-title">健康建议</Text>
          </View>
          <View className="suggestions-card">
            {result.suggestions.map((s, i) => (
              <View key={i} className="suggestion-item">
                <Text className="suggestion-item-icon">✅</Text>
                <Text className="suggestion-item-text">{s}</Text>
              </View>
            ))}
          </View>

          {/* 重新识别 */}
          <View className="reset-btn" onClick={handleReset}>
            <Text className="reset-btn-text">重新识别</Text>
          </View>
        </View>
      )}
      <TabBar current="food" />
    </View>
  );
}
