/**
 * 小程序全局类型声明
 *
 * 说明：
 * - 小程序环境中不存在 document / window 等 DOM 全局对象，此处不做声明，
 *   避免在代码中误用导致运行时错误。
 * - 如需使用 process.env 等变量，可在此处补充声明。
 * - Taro 框架自身的类型由 @tarojs/taro 提供，无需在此重复声明。
 */

/// <reference types="@tarojs/taro" />

// 兼容 Web 端代码中可能残留的 process.env 引用（小程序构建时由 Taro 注入）
declare const process: {
  env: {
    [key: string]: string | undefined;
    TARO_ENV: "weapp" | "swan" | "alipay" | "tt" | "h5" | "rn" | "qq" | "quickapp";
    [key: `TARO_PLATFORM_${string}`]: string;
  };
};

export {};
