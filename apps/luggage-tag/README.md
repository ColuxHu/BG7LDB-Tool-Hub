# 行李牌生成器

面向三色墨水屏标签的行李牌图片生成工具，支持像素字体、二维码排版、二维码图片识别和 PNG 导出。

## 本地开发

推荐从仓库根目录运行整站开发服务器：

```bash
npm run dev
```

然后访问：

```text
http://127.0.0.1:5173/luggage-tag/
```

如果只开发本应用，也可以运行：

```bash
npm run dev:luggage
```

## 目录

```text
.
|-- fusion-pixel-font-12px-monospaced-ttf/  # 开源像素字体
|-- index.html                              # 应用入口
|-- script.js                               # 交互与绘制逻辑
|-- styles.css                              # 页面样式
|-- vite.config.mjs
`-- package.json
```
