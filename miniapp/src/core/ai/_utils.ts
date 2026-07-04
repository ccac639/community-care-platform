// 内部工具：模拟异步延迟
// 小程序环境同样支持 setTimeout + Promise，无需改动
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
