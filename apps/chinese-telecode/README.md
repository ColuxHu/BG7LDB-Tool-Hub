# 中文电报码兼容译码台

静态部署的中文电报码工具。前端源码在 `src/`，运行时公开资产从 `public/` 发布。原始资料和本地数据处理文件保留在 `non-public/`，该目录被 Git 忽略，不进入公开仓库。

## 本地开发

推荐从仓库根目录运行整站开发服务器：

```bash
npm run dev
```

然后访问：

```text
http://127.0.0.1:5173/chinese-telecode/
```

如果只开发本应用，也可以运行：

```bash
npm run dev:telecode
```

## 构建

从仓库根目录构建全部应用：

```bash
npm run build
```

只构建本应用：

```bash
npm run build --workspace @bg7ldb/chinese-telecode
```

构建前会自动同步 `public/corpora/manifest.json`。

## 目录约定

```text
.
|-- index.html          # Vite 入口页面
|-- src/                # Web App 源码
|-- public/             # 会随构建发布的运行时资产和数据
|-- scripts/            # 公开构建脚本
|-- non-public/         # 本地原始资料和数据处理文件，Git 忽略
|-- server.mjs          # 本地静态预览服务
|-- vite.config.mjs
`-- package.json
```

## 数据说明

- `public/data/telegraph_compat_db.supplemented.json`：前端电报码查询主数据。
- `public/data/han_conversion_map.json`：简繁转换映射表，只使用 Unihan 明确的 `kTraditionalVariant` / `kSimplifiedVariant` 关系。
- `public/corpora/`：示例语料及其 manifest。
- `non-public/`：本地原始数据、历史资料、数据处理脚本和扫描报告，不作为 Web 发布入口。
