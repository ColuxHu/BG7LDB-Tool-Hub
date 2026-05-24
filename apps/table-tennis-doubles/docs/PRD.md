# 乒乓球双打辅助记分器 PRD

## 1. 产品定位

本工具是集成于个人工具站的横屏单页 Web 辅助记分器，专为乒乓球双打比赛设计。

核心目标：

- 快速记录双打比分。
- 自动提示当前发球方、接发球方和发球方向。
- 处理 11 分制 / 21 分制、平分追分、决胜局换边等复杂规则。
- 最大限度避免赛中误触导致比分或规则被破坏。
- 支持弱视、色盲、行动不便、远程外设操控等无障碍使用场景。

设计原则：

- 极简。
- 高对比。
- 绝对防误触。
- 零输入快速开局。
- 赛中修正高效。
- 静态部署，支持 PWA 离线安装。
- UI 风格遵循 Google Material Design 3 的深色、清晰层级、大触控目标和柔和状态反馈。

## 2. 视口与布局

### 2.1 主画布比例

主界面采用 `sqrt(2):1` 作为推荐比例，约 `1.414:1`。

适配规则：

- 宽屏设备：高度优先，主画布高度不超过 `95vh`。
- 窄屏设备：宽度优先，主画布宽度不超过 `95vw`。
- 内部控件允许在小屏下做轻微压缩，避免文字溢出或按钮遮挡。
- 加分区、球台区、底部工具栏必须保持稳定尺寸，不因比分变化或文字变化产生跳动。

### 2.2 三栏布局

界面分为三栏：

```text
[ 甲队计分与加分 ] [ 球台与发接发状态 ] [ 乙队计分与加分 ]
```

左右两侧为大面积盲操加分区，中间为球台、球员站位和当前发球路线。

### 2.3 Google / Material 触控热区

所有可点击控件必须满足 Material / Chrome 移动端触控习惯：

- 顶部、底部小按钮的可点击热区不得小于 `48px * 48px`。
- 按钮之间保留足够间距，避免运动场景下湿手误触。
- 左右 `+1` 盲操区应继续远大于最小触控标准。
- 文字较短的按钮也必须通过 padding 或外层 hit area 撑大触控区域。

### 2.4 布局稳定性

为满足 Core Web Vitals 中的 CLS 要求：

- 计分、球员圆圈、工具栏、状态横幅均使用稳定尺寸。
- 历史轨迹提示隐藏时仍占据固定空间，使用 `opacity-0` 或 `visibility: hidden`，不得用 `display: none` 造成布局跳动。
- 发球 SVG 指引线骨架必须在初始 HTML 中常驻 DOM，未使用时通过 `opacity-0` 或 `hidden` 状态控制显示，不在比赛开始后动态插入节点。
- 页面加载、比分变化、平分追分文案变化、局末确认出现时，主画布不应发生可见位移。

## 3. 核心状态机

系统使用明确状态机管理比赛流程。

```js
gamePhase:
  "SETUP_SERVER"       // 选择先发球员
  "SETUP_RECEIVER"     // 选择先接发球员
  "PLAYING"            // 比赛进行中
  "GAME_POINT_CONFIRM" // 单局结束待确认
  "MATCH_FINISHED"     // 全场结束
```

保护锁与临时管理状态：

```js
isLocked: boolean
adminUnlockedUntil: timestamp | null
```

说明：

- `isLocked = true` 时，危险/低频操作被保护锁定，赛中必要操作仍保持可用。
- `adminUnlockedUntil` 用于赛中临时解锁高级设置操作。
- 临时解锁默认 15 秒后自动失效。
- 解锁后若无操作，也自动回到赛中沙盒状态。

## 4. 赛中防误触沙盒

### 4.1 PLAYING 状态下允许操作

比赛进行中默认只允许以下操作：

- 甲队 `+1`
- 乙队 `+1`
- “撤销”
- “快速设置”
- “帮助”
- “视觉换边”

其中：

- “帮助”打开时暂停键盘快捷键监听。
- “视觉换边”只改变视觉视角，不改变真实比赛状态，也不进入撤销历史栈。

### 4.2 PLAYING 状态下禁用操作

以下操作赛中默认禁用：

- 局制切换：三局两胜 / 五局三胜 / 七局四胜
- 分制切换：11 分制 / 21 分制
- “重置”
- “高级设置”

若确实需要修改，用户必须长按“锁定”解锁高级设置操作，进入短时管理窗口。

## 5. 保护锁机制

“锁定”的定位是防止误触无关按钮和危险按钮，不是暂停比赛。锁定后，加分、撤销、快速设置等比赛中必须使用的高频按钮仍应可用。

### 5.1 进入保护锁

点击“锁定”后：

```js
isLocked = true
```

保护锁状态下：

- 甲队 `+1`、乙队 `+1`、“撤销”、“快速设置”仍保持可用。
- “帮助”和“视觉换边”仍保持可用。
- 局制切换、分制切换、“重置”、“高级设置”等低频/危险操作被锁定。
- “锁定”按钮变为琥珀色高亮。
- 非关键区域降低亮度。

### 5.2 解除保护锁

解除保护锁必须长按“锁定”按钮 `1.5s`。

长按期间显示进度条，进度满后：

```js
isLocked = false
```

解除后可临时访问“重置”、“高级设置”、局制切换、分制切换等低频操作。临时管理窗口默认 15 秒后自动失效。

### 5.3 保护锁状态视觉规则

保护锁开启时不应干扰比赛中常用操作：

- 比分保持高对比度。
- 当前发球方、接发球方仍保持可辨识。
- 加分、撤销、快速设置按钮保持正常可点击状态。
- 被保护的低频/危险按钮降低透明度，并显示明确的禁用状态。

## 6. 双打发接发模型

V2 将发球轮换和站位变化拆成两个独立模型。

### 6.1 发接发模型

```js
serveState = {
  serverId,
  receiverId,
  serverTeam,
  receiverTeam,
  forcedServeOffset
}
```

负责回答：

- 当前谁发球？
- 发给谁？
- 当前是否处于强制换发修正状态？

### 6.2 物理站位模型

```js
courtPositions = {
  topLeft,
  topRight,
  bottomLeft,
  bottomRight
}
```

负责回答：

- 四名球员现在站在球台哪个角。
- 视觉换边后如何显示。
- 决胜局换边后如何调整接发方站位。

### 6.3 发球轮换规则

11 分制常规阶段：

```js
rotation = Math.floor(totalScore / 2) % 4
```

11 分制平分后，即双方均 `>= 10`：

```js
rotation = totalScore % 4
```

21 分制常规阶段：

```js
rotation = Math.floor(totalScore / 5) % 4
```

21 分制平分后，即双方均 `>= 20`：

```js
rotation = totalScore % 4
```

### 6.4 决胜局换边

当满足以下条件时触发决胜局换边：

- 当前局为最大局数，即 `currentSet === bestOf`。
- 任意一方达到换边临界分：
  - 11 分制：5 分。
  - 21 分制：10 分。
- 本局尚未执行过决胜局换边。

触发后：

- 保持当前 `serverId` 不变。
- 更新 `courtPositions`。
- 强制对调接发方及其同伴的物理站位。
- 播报：“决胜局换边，请交换场地”。

## 7. 局末与全场结束

### 7.1 单局获胜条件

当任一方满足：

```js
score >= targetScore && Math.abs(scoreA - scoreB) >= 2
```

进入：

```js
gamePhase = "GAME_POINT_CONFIRM"
```

### 7.2 局末确认

系统不自动进入下一局，必须弹出确认：

```text
本局结束，甲队获胜？
[确认] [撤销]
```

确认后：

- 大比分 +1。
- 小比分清零。
- 自动执行视觉换边。
- 重置为选发球 / 接发球流程。
- 下一局由规则推荐的发球方优先选择。

### 7.3 全场结束

当某队大比分达到：

```js
Math.ceil(bestOf / 2)
```

进入：

```js
gamePhase = "MATCH_FINISHED"
```

显示全场胜者，并禁用加分操作，仅保留“重置”和“帮助”。

## 8. 顶部控制栏

布局：

```text
[局制] [分制] ----- [大比分 当前局] ----- [?] [视觉换边]
```

### 8.1 局制切换

循环切换：

- 三局两胜
- 五局三胜
- 七局四胜

赛中禁用。

### 8.2 分制切换

循环切换：

- 11 分制
- 21 分制

赛中禁用。

### 8.3 大比分与当前局

显示示例：

```text
0 第一局 0
1 第三局 1
1 平分追分中 1
```

平分追分阶段可使用轻微闪烁，但不能影响可读性。

### 8.4 帮助

点击后显示规则速查浮层。

帮助打开期间：

- 暂停键盘快捷键。
- 不改变比赛状态。
- 可在赛中打开。

### 8.5 视觉换边

点击后：

```js
visualSwapped = !visualSwapped
```

只影响显示，不影响真实比分、发接发、历史栈。

## 9. 中间球台视图

### 9.1 状态横幅

使用：

```html
role="status"
aria-live="assertive"
```

未开局时提示：

```text
请选择先发球员
请选择先接发球员
```

比赛中提示：

```text
A2 发球给 B1
平分追分，每分轮换
决胜局已换边
```

### 9.2 球员圆圈

四名球员位于球台四角。

视觉编码：

- 发球员：使用 Material 3 Primary Container 风格，不使用纯 `#FFFF00`。推荐 Tailwind 组合为 `bg-amber-500/20 text-amber-400 ring-amber-500`，文字显示 `发`。
- 接发球员：使用 Material 3 Secondary Container 风格，不使用纯 `#0000FF`。推荐 Tailwind 组合为 `bg-sky-500/20 text-sky-400 ring-sky-500`，文字显示 `接`。
- 非焦点球员：使用 Material 3 Outline Variant 风格，推荐 `text-slate-600 bg-slate-900/30 ring-transparent`，并降低视觉权重。
- 不单独依赖颜色传达状态。

示例：

```text
A2 发
B1 接
```

### 9.3 发球指引线

使用 SVG `<line>` 绘制发球轨迹。

实现要求：

- 根据发球圆圈和接发球圆圈的 `getBoundingClientRect()` 动态计算中心点。
- 使用黄色虚线。
- 线尾带箭头。
- 页面 resize、视觉换边、站位变化后重新计算。

## 10. 左右计分区

### 10.1 小比分显示

左右分别显示当前小比分。

要求：

- 超大字号。
- 高对比度。
- `aria-live="polite"`。
- 不因两位数 / 三位数导致布局跳动。

### 10.2 加分按钮

左右各一个超大 `+1` 按钮。

触发：

```js
addScore("A")
addScore("B")
```

每次加分前必须保存历史：

```js
pushHistory()
```

### 10.3 最近得分提示

比分下方显示：

```text
甲队刚刚得分
```

3 秒后淡出。

## 11. 底部工具栏

布局：

```text
[重置] [快速设置] ----- [撤销] ----- [高级设置] [锁定]
```

### 11.1 重置

清空：

- 小比分
- 大比分
- 当前局
- 历史栈
- 发接发选择
- 决胜局换边标记
- localStorage

赛中默认禁用。

### 11.2 快速设置

赛中可用。

点击后在中间球台区显示轻量面板。

功能：

- 甲队小分 `-1`
- 乙队小分 `-1`
- 甲队局分 `+1 / -1`
- 乙队局分 `+1 / -1`
- 强制换发
- 完成

要求：

- 每次修改前进入历史栈。
- 修改后播报“已校正，比分回到 X 比 Y”。
- 点击面板外关闭。
- 面板打开期间，加分键建议禁用，避免叠加误触。

### 11.3 撤销

维护完整历史栈：

```js
history = []
```

任何状态变动前：

```js
history.push(JSON.stringify(state))
```

撤销后：

```js
state = JSON.parse(history.pop())
```

不限制撤销次数。

### 11.4 高级设置

用于低频设置：

- 修改 P1-P4 姓名。
- 设置初始让分。
- 手动修改当前局数。
- 手动指定发球方 / 接发方。
- 开启或关闭无障碍设置：
  - 语音播报。
  - 键盘与外设映射。
- 清理本地缓存。

赛中默认禁用，除非进入短时管理解锁状态。

### 11.5 锁定

详见第 5 节。

## 12. 无障碍规范

无障碍增强功能默认关闭，需要时由用户在“高级设置”中手动开启。基础高对比视觉、发球/接发文字标识、按钮 `aria-label` 等不影响普通操作的基础可访问性能力始终保留。

推荐状态字段：

```js
accessibility = {
  ttsEnabled: false,
  keyboardControlEnabled: false
}
```

### 12.1 语音播报

使用浏览器原生：

```js
window.speechSynthesis
```

提供语音开关：

```js
accessibility.ttsEnabled: boolean
```

默认关闭。用户需要进入“高级设置”开启后，才进行语音播报。

播报规则：

- 常规得分：“9 比 7”。
- 换发球：“10 比 8，A2 发球给 B1”。
- 平分：“10 平，追分，每分轮换”。
- 局末：“本局结束，甲队获胜，请确认”。
- 决胜局换边：“决胜局换边，请交换场地”。
- 修正：“已校正，比分回到 9 比 7”。

注意：

- 首次播报必须发生在用户交互之后。
- 帮助、高级设置、快速设置打开时避免连续播报干扰。

### 12.2 Lighthouse a11y 基础要求

为符合 Chrome Lighthouse 无障碍审计要求：

- 所有交互节点必须使用原生 `<button>`、`<input>`、`<dialog>` 等语义元素，或补齐准确的 `role`。
- 所有纯符号按钮必须提供 `aria-label` 或 `sr-only` 文本。
- `+1` 按钮视觉上可只显示 `+1`，但 DOM 中必须包含屏幕阅读器文本，例如“团队 A 当前得分，点击增加一分”。
- Guide Banner 使用 `role="status"` 和 `aria-live="assertive"`。
- 左右比分区域使用 `aria-live="polite"`。
- 禁用按钮必须使用真实 `disabled` 属性，并提供可理解的禁用视觉状态。
- 页面文本与背景对比度必须满足 WCAG AA，关键比分和状态提示应优先满足更高对比度。
- 不依赖颜色单独传达发球、接发、禁用、锁定等状态。

### 12.3 浮层焦点管理

当打开“帮助”、“快速设置”、“高级设置”或局末确认浮层时：

- 初始焦点移动到浮层内的标题或首个可操作按钮。
- Tab 焦点被锁定在浮层内部，不能跳到背后的 `+1` 按钮或工具栏。
- `Esc` 可关闭非破坏性浮层；局末确认可关闭但不能误触确认。
- 关闭浮层后，焦点返回触发该浮层的按钮。
- 背景区域应使用 `aria-hidden="true"` 或等价机制从辅助技术导航中临时移除。

### 12.4 键盘与外设映射

键盘与外设映射默认关闭。用户需要进入“高级设置”开启后，才监听以下全局快捷键：

```text
A 或 Left Arrow   甲队 +1
D 或 Right Arrow  乙队 +1
Space             撤销
L                 锁定相关操作，可选
```

限制：

- `accessibility.keyboardControlEnabled = false` 时，不监听任何比赛快捷键。
- 帮助打开时暂停快捷键。
- 高级设置输入框聚焦时暂停快捷键。
- 快速设置面板打开时暂停加分快捷键，只保留必要确认操作。

### 12.5 色彩与视觉

要求：

- 整体采用 Material Design 3 暗色主题风格，背景使用接近纯黑的 `bg-slate-950`。
- 主要表面使用 `slate-900` / `slate-800` 层级表达，不使用大面积纯色块。
- 分数使用高亮白色。
- 发球和接发状态使用颜色 + 文字双重编码。
- 发球、接发高亮使用低饱和容器色，不使用刺眼纯黄或纯蓝。
- 非焦点人员使用钝化的 `Outline Variant` 风格，而不只是简单透明。
- 禁用状态不能只靠颜色区分，必须降低透明度并改变按钮状态。
- 所有按钮提供 `aria-label`。

### 12.6 Material 3 组件反馈

按钮和可交互控件应具有清晰但克制的状态反馈：

- 所有按钮提供 hover、active、focus-visible、disabled 四类状态。
- 点击时使用 `active:scale-95`、`active:bg-opacity-80`、`transition-all` 或等价实现，模拟 Material 的按压反馈。
- 焦点态使用可见 focus ring，颜色与当前语义一致。
- 高危按钮如“重置”、“高级设置”在保护锁开启时使用 disabled 样式和说明性 `aria-label`。
- 不使用夸张动画，所有动效应短、轻、可预测。

## 13. 持久化

使用 localStorage 保存状态。

推荐方式：

```js
saveState()
loadState()
```

状态变化后主动保存，而不是只依赖 `renderUI()` 末尾保存。

保存内容：

- 比分
- 大比分
- 当前局
- 规则设置
- 球员姓名
- 发接发状态
- 物理站位
- 是否已决胜局换边
- `visualSwapped`
- `accessibility.ttsEnabled`
- `accessibility.keyboardControlEnabled`

不建议保存：

- 临时弹窗状态
- 锁定长按进度
- 短时 admin 解锁倒计时

## 14. 技术实现

技术栈：

- 原生 HTML5
- Tailwind CSS CDN
- 原生 ES6 JavaScript
- 无现代前端构建链
- 静态 PWA 资源包

部署方式：

- 可直接静态托管。
- 可封装为 `nginx:alpine` Docker 镜像。
- 可通过主站 Nginx 反向代理访问。

### 14.1 静态资源结构

推荐最小文件结构：

```text
index.html
manifest.json
sw.js
icon-192.png
icon-512.png
```

`index.html` 负责完整 UI 与业务逻辑，`manifest.json` 和 `sw.js` 用于满足 Chrome PWA 安装、横屏和离线加载要求。

### 14.2 PWA Manifest

必须提供 `manifest.json`：

```json
{
  "name": "乒乓双打发球辅助器",
  "short_name": "双打辅助",
  "start_url": "./index.html",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#020617",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

`index.html` 需要包含：

```html
<link rel="manifest" href="./manifest.json">
<meta name="theme-color" content="#0f172a">
```

### 14.3 Service Worker

必须提供 `sw.js`，缓存核心静态资源以支持离线启动：

```js
const CACHE_NAME = 'table-tennis-doubles-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
```

`index.html` 底部注册：

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}
```

### 14.4 Google / Lighthouse 验收清单

实现完成后以 Chrome Lighthouse 为验收基准：

- 所有按钮触控热区不小于 `48px * 48px`。
- 首页加载后无明显 CLS；比分变化、历史提示、SVG 指线、弹窗出现均不挤压布局。
- Accessibility 审计无严重问题：名称、角色、焦点顺序、颜色对比、弹窗焦点锁均通过。
- PWA 可安装，`display: standalone` 生效，启动方向为横屏。
- 离线打开已访问过的页面时，核心 UI 可加载。
- 静态资源体积保持轻量，避免引入不必要依赖。

## 15. 相比原方案的关键修订

- 新增明确状态机，避免局末、重置、选人、赛中修正混在一起。
- 将发球模型和站位模型拆开，便于处理视觉换边、决胜局换位和强制换发。
- 明确“视觉换边”只改变显示视角，不改变真实比赛状态，也不进入撤销历史栈。
- 修正“锁定”语义：保护锁只锁定规则切换、重置、高级设置等低频/危险操作，加分、撤销、快速设置等赛中必要操作不受影响。
- 增加短时高级设置解锁机制 `adminUnlockedUntil`，默认 15 秒后自动回到赛中沙盒。
- 将局末确认正式纳入 `GAME_POINT_CONFIRM` 状态，避免自动结算造成争议。
- 明确“快速设置”打开时建议暂停加分键，避免修正时叠加误触。
- 调整无障碍增强功能默认状态：语音播报、键盘与外设映射默认关闭，需要在“高级设置”中手动开启。
- 补充浏览器语音播报约束：首次播报需要用户交互。
- 补充快捷键启用与暂停规则，避免未授权监听或在帮助、高级设置、快速设置场景下误触。
- 将 localStorage 策略改为状态变化后统一 `saveState()`，渲染只负责显示。
- 统一命名为“快速设置”。
- 增加 Google 风格设计要求：Material Design 3 暗色主题、低饱和状态色、48px 触控热区、按压反馈和 focus-visible 状态。
- 增加 Core Web Vitals / CLS 防护：SVG 指线常驻 DOM、历史提示固定占位、比分与弹窗不引发布局跳动。
- 增加 Lighthouse a11y 要求：`sr-only` 文本、语义化控件、弹窗焦点锁、aria-live、真实 disabled 状态。
- 增加 PWA 要求：`manifest.json`、横屏 `standalone`、Service Worker 离线缓存、安装图标与 Lighthouse 验收清单。
