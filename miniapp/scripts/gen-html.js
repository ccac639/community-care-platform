/**
 * 生成 index.html（Taro 3.6 H5 构建后补丁）
 * 读取 dist/js 和 dist/css 目录，生成带正确资源引用的 HTML 文件
 */
const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "..", "dist");
const publicPath = process.env.H5_PUBLIC_PATH || "/";

function findFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => `${publicPath}${dir.split(path.sep).pop()}/${f}`);
}

const jsFiles = findFiles(path.join(distDir, "js"), ".js");
const cssFiles = findFiles(path.join(distDir, "css"), ".css");

// 排除 .LICENSE.txt 文件
const cleanJs = jsFiles.filter((f) => !f.includes(".LICENSE."));
const cleanCss = cssFiles;

const jsTags = cleanJs.map((src) => `<script src="${src}"></script>`).join("\n    ");
const cssTags = cleanCss.map((href) => `<link rel="stylesheet" href="${href}">`).join("\n    ");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#4f46e5">
  <title>守望 - AI全龄社区关怀服务平台</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow-x: hidden; }
    #app { width: 100%; min-height: 100vh; }
    .loading { display: flex; align-items: center; justify-content: center; height: 100vh; color: #6b7280; font-size: 14px; }
  </style>
  ${cssTags}
</head>
<body>
  <div id="app">
    <div class="loading">加载中...</div>
  </div>
  <script>
    // Taro H5 路由配置
    window.__TARO_CONFIG = {
      router: { basename: "${publicPath}" }
    };
  </script>
  ${jsTags}
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, "index.html"), html, "utf-8");
console.log("✅ index.html generated successfully");
