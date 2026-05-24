# 乒乓球双打辅助记分器

乒乓球双打辅助记分器是一个可静态部署的 PWA，用于辅助记录双打比分、发接发顺序和决胜局换边提示。

## 本地开发

推荐从仓库根目录运行整站开发服务器：

```bash
npm run dev
```

然后访问：

```text
http://127.0.0.1:5173/table-tennis-doubles/
```

如果只开发本应用，也可以运行：

```bash
npm run dev:table-tennis
```

## 项目结构

```text
.
|-- assets/icons/     # PWA 图标
|-- docs/             # 产品与需求文档
|-- src/              # 页面样式与交互逻辑
|-- index.html        # 应用入口
|-- manifest.json     # PWA manifest
|-- sw.js             # Service worker 缓存策略
|-- vite.config.mjs
`-- package.json
```

## 规则依据

规则相关逻辑以 `docs/2026_Statutes_v1_consolidated_clean.pdf` 中 ITTF Statutes 2026 第 2 章为准，尤其是：

- `2.11 A GAME`：一局 11 分，10 平后领先 2 分获胜。
- `2.12 A MATCH`：比赛由任意奇数局组成。
- `2.13 THE ORDER OF SERVING, RECEIVING AND ENDS`：发接发顺序、双打换发、下一局先发/先接、决胜局 5 分换边。
- `2.14 OUT OF ORDER OF SERVING, RECEIVING OR ENDS`：发现顺序错误后按既有比分和正确顺序恢复。

`21 分制` 仅作为兼容模式保留。程序允许任意局制和分制组合，并复用同一套双打发接发顺序规则；差异是 21 分胜局、20 平后每分换发、20 平前每 5 分换发、决胜局 10 分换边。
