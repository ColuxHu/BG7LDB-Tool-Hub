const DATA_PATH = "data/telegraph_compat_db.supplemented.json";
const HAN_CONVERSION_PATH = "data/han_conversion_map.json";
const CORPORA_MANIFEST_PATH = "corpora/manifest.json";
const CANVAS_SERIF_FALLBACK = '"Noto Serif SC", "Songti SC", SimSun, serif';

const hanConversionIcons = {
  none: { path: "assets/icons/han-conversion-none.svg", alt: "不转换" },
  s2t: { path: "assets/icons/han-conversion-s2t.svg", alt: "转为繁体" },
  t2s: { path: "assets/icons/han-conversion-t2s.svg", alt: "转为简体" },
};

const hanConversionModes = ["none", "s2t", "t2s"];

const widthNormalizeIcons = {
  none: { path: "assets/icons/width-normalize-none.svg", alt: "不转换全半角" },
  full: { path: "assets/icons/width-normalize-full.svg", alt: "转为全角" },
  half: { path: "assets/icons/width-normalize-half.svg", alt: "转为半角" },
};

const widthNormalizeModes = ["none", "full", "half"];

const variantAnnotationIcons = {
  on: { path: "assets/icons/variant-annotation-on.svg", alt: "标注异码" },
  off: { path: "assets/icons/variant-annotation-off.svg", alt: "不标注异码" },
};

const fieldLabels = {
  kMainlandTelegraph: "83",
  kTaiwanTelegraph: "TW",
};

const codeClasses = {
  kMainlandTelegraph: "is-mainland",
  kTaiwanTelegraph: "is-taiwan",
};

const strategies = {
  "taiwan-first": ["kTaiwanTelegraph", "kMainlandTelegraph"],
  "mainland-first": ["kMainlandTelegraph", "kTaiwanTelegraph"],
  "taiwan-only": ["kTaiwanTelegraph"],
  "mainland-only": ["kMainlandTelegraph"],
};

const state = {
  db: null,
  hanConversion: { s2t: {}, t2s: {} },
  mode: "encode",
  entries: [],
  plainCodes: "",
  plainText: "",
  corpusDocuments: [],
  selectedCorpusByMode: { encode: "", decode: "" },
};

const els = {
  loadStatus: document.querySelector("#loadStatus"),
  sourceText: document.querySelector("#sourceText"),
  corpusSelect: document.querySelector("#corpusSelect"),
  strategy: document.querySelector("#strategy"),
  hanConversion: document.querySelector("#hanConversion"),
  hanConversionToggle: document.querySelector("#hanConversionToggle"),
  hanConversionIcon: document.querySelector("#hanConversionIcon"),
  normalizeWidthToggle: document.querySelector("#normalizeWidthToggle"),
  normalizeWidthIcon: document.querySelector("#normalizeWidthIcon"),
  normalizeWidth: document.querySelector("#normalizeWidth"),
  markVariantsToggle: document.querySelector("#markVariantsToggle"),
  markVariantsIcon: document.querySelector("#markVariantsIcon"),
  markVariants: document.querySelector("#markVariants"),
  codeOutput: document.querySelector("#codeOutput"),
  reverseOutput: document.querySelector("#reverseOutput"),
  globalAlert: document.querySelector("#globalAlert"),
  summary: document.querySelector("#summary"),
  paperGrid: document.querySelector("#paperGrid"),
  paperDate: document.querySelector("#paperDate"),
  tabs: document.querySelectorAll(".tab"),
  copyCodes: document.querySelector("#copyCodes"),
  exportImage: document.querySelector("#exportImage"),
  clearAll: document.querySelector("#clearAll"),
  backToTop: document.querySelector("#backToTop"),
  jumpToPaper: document.querySelector("#jumpToPaper"),
  quickJumps: document.querySelector("#quickJumps"),
  telegramPaper: document.querySelector("#telegramPaper"),
  pasteClipboard: document.querySelector("#pasteClipboard"),
};

function todayLabel() {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getCanvasSerifFamily() {
  const lang = document.documentElement.lang;
  if (lang === "zh-TW") {
    return detectLocalSerif("tw");
  }
  if (lang === "zh-HK" || lang === "zh-MO") {
    return detectLocalSerif("hk");
  }
  return detectLocalSerif("sc");
}

function detectLocalSerif(region) {
  // 优先检测本地是否安装了思源字体系列；若存在则返回以该家族为首的 font-family 字符串
  if (!document.fonts || !document.fonts.check) {
    // 无法检测，返回默认首选字符串
    if (region === "tw") return `"Source Han Serif TW", ${CANVAS_SERIF_FALLBACK}`;
    if (region === "hk") return `"Source Han Serif HK", "Source Han Serif TC", ${CANVAS_SERIF_FALLBACK}`;
    return `"Source Han Serif SC", ${CANVAS_SERIF_FALLBACK}`;
  }

  const candidatesByRegion = {
    sc: ["Source Han Serif SC", "Source Han Serif CN", "Noto Serif SC"],
    tw: ["Source Han Serif TW", "Source Han Serif TC", "Noto Serif TC"],
    hk: ["Source Han Serif HK", "Source Han Serif TC", "Noto Serif HK"],
  };

  const candidates = candidatesByRegion[region] || candidatesByRegion.sc;
  for (const fam of candidates) {
    try {
      if (document.fonts.check(`12px "${fam}"`)) {
        return `"${fam}", ${CANVAS_SERIF_FALLBACK}`;
      }
    } catch (e) {
      // ignore
    }
  }

  // 未检测到本地思源字体，提示用户并使用回退序列
  setGlobalAlert("未检测到本地思源字体，将使用回退字体；如需更好显示请安装 Source Han Serif。");
  if (region === "tw") return `"Source Han Serif TW", ${CANVAS_SERIF_FALLBACK}`;
  if (region === "hk") return `"Source Han Serif HK", "Source Han Serif TC", ${CANVAS_SERIF_FALLBACK}`;
  return `"Source Han Serif SC", ${CANVAS_SERIF_FALLBACK}`;
}

async function ensureCanvasFonts() {
  // 优先尝试使用与页面相同的 assets 路径加载思源字体，然后回退到本地已安装字体
  if (!document.fonts) return;
  const families = [
    {
      family: "Source Han Serif SC",
      files: { 400: "SourceHanSerifCN-Regular.otf", 700: "SourceHanSerifCN-Bold.otf" },
    },
    {
      family: "Source Han Serif TW",
      files: { 400: "SourceHanSerifTW-Regular.otf", 700: "SourceHanSerifTW-Bold.otf" },
    },
    {
      family: "Source Han Serif HK",
      files: { 400: "SourceHanSerifTC-Regular.otf", 700: "SourceHanSerifTC-Bold.otf" },
    },
  ];

  // 如果支持 FontFace API，尝试从 assets 路径加载字体文件（与 CSS 中相同路径）
  if (window.FontFace) {
    // 探测器：尝试 HEAD 请求以确定首选可用 URL
    async function probeUrl(url) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
      } catch (e) {
        return false;
      }
    }

    const injected = [];
    for (const fam of families) {
      for (const weight of [400, 700]) {
        const fileName = fam.files[weight];
        if (!fileName) continue;
        const fontPath = `assets/fonts/source-han-serif/${fileName}`;
        const candidatePaths = [`/${fontPath}`, `${fontPath}`, `./${fontPath}`, `./public/${fontPath}`, `/public/${fontPath}`];
        const candidates = [];
        for (const p of candidatePaths) {
          try {
            candidates.push(new URL(p, document.baseURI).href);
          } catch (e) {
            try {
              candidates.push(new URL(p, window.location.href).href);
            } catch (e2) {
              // ignore
            }
          }
        }

        let chosen = null;
        for (const url of candidates) {
          // eslint-disable-next-line no-await-in-loop
          if (await probeUrl(url)) {
            chosen = url;
            break;
          }
        }

        if (chosen) {
          try {
            const face = new FontFace(fam.family, `url(${chosen}) format("opentype")`, { weight: String(weight) });
            // eslint-disable-next-line no-await-in-loop
            await face.load();
            document.fonts.add(face);
            injected.push({ family: fam.family, weight, url: chosen });
            continue;
          } catch (e) {
            // 如果通过 FontFace 加载失败，继续尝试下一个候选
          }
        }
        // 若未找到可用的候选或加载失败，则跳过，后续会使用 detectLocalSerif 的回退策略
      }
    }

    if (injected.length) {
      let css = "";
      for (const item of injected) {
        css += `@font-face { font-family: \"${item.family}\"; src: url(\"${item.url}\") format(\"opentype\"); font-weight: ${item.weight}; font-style: normal; font-display: swap; }\n`;
      }
      let styleEl = document.getElementById("dynamic-source-han");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "dynamic-source-han";
        document.head.appendChild(styleEl);
      }
      // 把动态注入的规则置于现有样式之前
      styleEl.textContent = css + styleEl.textContent;
    }
  }

  // 检查当前文档语言并构造期望的 font-family
  const lang = document.documentElement.lang;
  const region = lang === "zh-TW" ? "tw" : lang === "zh-HK" || lang === "zh-MO" ? "hk" : "sc";
  const serif = detectLocalSerif(region);
  try {
    await Promise.all([document.fonts.load(`400 24px ${serif}`), document.fonts.load(`700 46px ${serif}`)]);
    await document.fonts.ready;
  } catch (e) {
    // 如果加载失败，alert 已由 detectLocalSerif 提示，记录但不阻塞导出
    console.warn("ensureCanvasFonts: font load failed", e);
  }
}

function setLoading(message) {
  els.loadStatus.textContent = message;
}

function setGlobalAlert(message) {
  els.globalAlert.textContent = message;
  els.globalAlert.classList.toggle("is-hidden", !message);
}

function getAssetCandidates(path) {
  const cleanPath = path.replace(/^\/+/, "");
  return [
    `./public/${cleanPath}`,
    `./${cleanPath}`,
    `/public/${cleanPath}`,
    `/${cleanPath}`,
  ];
}

async function fetchRuntimeJson(path) {
  const candidates = getAssetCandidates(path);
  let lastError = null;
  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        lastError = new Error(`${url} (${response.status})`);
        continue;
      }
      try {
        return await response.json();
      } catch (error) {
        lastError = new Error(`${url} 不是有效 JSON`);
      }
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`无法加载 ${candidates.join(" 或 ")}${lastError ? `：${lastError.message}` : ""}`);
}

async function fetchRuntimeText(path) {
  const candidates = getAssetCandidates(path);
  let lastError = null;
  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        lastError = new Error(`${url} (${response.status})`);
        continue;
      }
      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`无法加载 ${candidates.join(" 或 ")}${lastError ? `：${lastError.message}` : ""}`);
}

function corpusPath(fileName) {
  return `corpora/${fileName.split("/").map(encodeURIComponent).join("/")}`;
}

function documentsForCurrentMode() {
  return state.corpusDocuments.filter((item) => (item.mode || "encode") === state.mode);
}

function renderCorpusOptions() {
  if (!els.corpusSelect) {
    return;
  }
  const documents = documentsForCurrentMode();
  const selectedFile = state.selectedCorpusByMode[state.mode] || "";
  els.corpusSelect.innerHTML = "";
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = documents.length
    ? "选择测试文档"
    : state.mode === "decode"
      ? "暂无电码测试文档"
      : "暂无汉字测试文档";
  els.corpusSelect.append(emptyOption);

  for (const item of documents) {
    const option = document.createElement("option");
    option.value = item.file;
    option.textContent = item.title || item.file;
    els.corpusSelect.append(option);
  }

  if (documents.some((item) => item.file === selectedFile)) {
    els.corpusSelect.value = selectedFile;
  }
  els.corpusSelect.disabled = !documents.length;
}

function resetCorpusSelection() {
  state.selectedCorpusByMode[state.mode] = "";
  if (els.corpusSelect) {
    els.corpusSelect.value = "";
  }
}

async function loadCorporaManifest() {
  try {
    const manifest = await fetchRuntimeJson(CORPORA_MANIFEST_PATH);
    state.corpusDocuments = Array.isArray(manifest.documents) ? manifest.documents : [];
    renderCorpusOptions();
  } catch (error) {
    state.corpusDocuments = [];
    renderCorpusOptions();
    console.warn(error);
  }
}

async function loadSelectedCorpus() {
  const fileName = els.corpusSelect?.value;
  state.selectedCorpusByMode[state.mode] = fileName || "";
  if (!fileName) {
    return;
  }
  const documentInfo = documentsForCurrentMode().find((item) => item.file === fileName);
  if (!documentInfo) {
    return;
  }
  els.corpusSelect.disabled = true;
  try {
    const text = await fetchRuntimeText(corpusPath(fileName));
    els.sourceText.value = text;
    refresh();
    els.summary.textContent = `已载入测试文档：${documentInfo?.title || fileName}`;
  } catch (error) {
    setGlobalAlert(error.message);
  } finally {
    els.corpusSelect.disabled = false;
  }
}

function syncHanConversionIcon() {
  if (!els.hanConversionIcon) {
    return;
  }
  const icon = hanConversionIcons[els.hanConversion.value] || hanConversionIcons.none;
  const candidates = getAssetCandidates(icon.path);
  let candidateIndex = 0;
  els.hanConversionIcon.onerror = () => {
    candidateIndex += 1;
    if (candidateIndex < candidates.length) {
      els.hanConversionIcon.src = candidates[candidateIndex];
    }
  };
  els.hanConversionIcon.src = candidates[candidateIndex];
  if (els.hanConversionToggle) {
    els.hanConversionToggle.setAttribute("aria-label", icon.alt);
  }
}

function setIconImage(imageEl, icon) {
  if (!imageEl) {
    return;
  }
  const candidates = getAssetCandidates(icon.path);
  let candidateIndex = 0;
  imageEl.onerror = () => {
    candidateIndex += 1;
    if (candidateIndex < candidates.length) {
      imageEl.src = candidates[candidateIndex];
    }
  };
  imageEl.src = candidates[candidateIndex];
}

function cycleHanConversion() {
  const currentIndex = hanConversionModes.indexOf(els.hanConversion.value);
  const nextIndex = (currentIndex + 1) % hanConversionModes.length;
  els.hanConversion.value = hanConversionModes[nextIndex];
  syncHanConversionIcon();
  refresh();
}

function syncNormalizeWidthIcon() {
  const icon = widthNormalizeIcons[els.normalizeWidth.value] || widthNormalizeIcons.none;
  setIconImage(els.normalizeWidthIcon, icon);
  if (els.normalizeWidthToggle) {
    els.normalizeWidthToggle.setAttribute("aria-label", icon.alt);
  }
}

function cycleNormalizeWidth() {
  const currentIndex = widthNormalizeModes.indexOf(els.normalizeWidth.value);
  const nextIndex = (currentIndex + 1) % widthNormalizeModes.length;
  els.normalizeWidth.value = widthNormalizeModes[nextIndex];
  syncNormalizeWidthIcon();
  refresh();
}

function isVariantAnnotationEnabled() {
  return Boolean(els.markVariants?.checked);
}

function syncVariantAnnotationIcon() {
  const icon = isVariantAnnotationEnabled() ? variantAnnotationIcons.on : variantAnnotationIcons.off;
  setIconImage(els.markVariantsIcon, icon);
  if (els.markVariantsToggle) {
    els.markVariantsToggle.setAttribute("aria-label", icon.alt);
    els.markVariantsToggle.setAttribute("aria-pressed", String(isVariantAnnotationEnabled()));
  }
}

function toggleVariantAnnotation() {
  els.markVariants.checked = !els.markVariants.checked;
  syncVariantAnnotationIcon();
  refresh();
}

async function loadDatabase() {
  setLoading("装载中");
  const [db, conversion] = await Promise.all([
    fetchRuntimeJson(DATA_PATH),
    fetchRuntimeJson(HAN_CONVERSION_PATH),
  ]);
  state.db = db;
  state.hanConversion = conversion;
  const forwardCount = Object.keys(state.db.forward || {}).length;
  const reverseCount = Object.keys(state.db.reverse || {}).length;
  setLoading(`${forwardCount} 字`);
  els.summary.textContent = `已载入 ${forwardCount} 字，${reverseCount} 组电码`;
}

function convertHanVariant(text) {
  const conversion = state.hanConversion?.[els.hanConversion?.value] || {};
  if (!Object.keys(conversion).length) {
    return text;
  }
  return Array.from(text, (char) => conversion[char] || char).join("");
}

function toFullwidth(text) {
  return Array.from(text, (char) => {
    const code = char.codePointAt(0);
    if (code === 0x20) {
      return "\u3000";
    }
    if (code >= 0x21 && code <= 0x7e) {
      return String.fromCodePoint(code + 0xfee0);
    }
    return char;
  }).join("");
}

function convertWidth(text) {
  if (els.normalizeWidth.value === "half") {
    return text.normalize("NFKC");
  }
  if (els.normalizeWidth.value === "full") {
    return toFullwidth(text.normalize("NFKC"));
  }
  return text;
}

function normalizeInputText(text) {
  let normalized = convertWidth(text);
  if (state.mode === "encode") {
    normalized = convertHanVariant(normalized);
  }
  return normalized;
}

function pickCode(record, strategyName) {
  const order = strategies[strategyName] || strategies["taiwan-first"];
  for (const field of order) {
    if (record?.[field]) {
      return { code: record[field], field };
    }
  }
  return { code: "", field: "" };
}

function getVariantNote(record, chosenField) {
  return getVariantMeta(record, chosenField).note;
}

function getVariantNoteField(record, chosenField) {
  return getVariantMeta(record, chosenField).noteField;
}

function getVariantMeta(record, chosenField) {
  const empty = { note: "", noteField: "" };
  if (!record?.kMainlandTelegraph || !record?.kTaiwanTelegraph) {
    return empty;
  }
  if (record.kMainlandTelegraph === record.kTaiwanTelegraph) {
    return empty;
  }
  if (!fieldLabels[chosenField]) {
    return empty;
  }
  const otherField =
    chosenField === "kMainlandTelegraph" ? "kTaiwanTelegraph" : "kMainlandTelegraph";
  return {
    note: `${fieldLabels[otherField]}:${record[otherField]}`,
    noteField: otherField,
  };
}

function getCodeMap(record, chosenField) {
  const codes = {
    kMainlandTelegraph: "",
    kTaiwanTelegraph: "",
  };
  if (!record) {
    return codes;
  }
  if (isVariantAnnotationEnabled()) {
    codes.kMainlandTelegraph = record.kMainlandTelegraph || "";
    codes.kTaiwanTelegraph = record.kTaiwanTelegraph || "";
    return codes;
  }
  if (fieldLabels[chosenField]) {
    codes[chosenField] = record[chosenField] || "";
  }
  return codes;
}

function encodeText(text) {
  const chars = Array.from(text);
  return chars.map((char) => {
    if (/\s/.test(char)) {
      return { char, code: "", field: "", note: "", whitespace: true };
    }
    const record = state.db.forward?.[char];
    const chosen = pickCode(record, els.strategy.value);
    const variantMeta = isVariantAnnotationEnabled()
      ? getVariantMeta(record, chosen.field)
      : { note: "", noteField: "" };
    return {
      char,
      code: chosen.code,
      field: chosen.field,
      codes: getCodeMap(record, chosen.field),
      note: variantMeta.note,
      noteField: variantMeta.noteField,
      missing: !chosen.code,
    };
  });
}

function parseCodes(text) {
  return text.match(/\d{4}/g) || [];
}

function decodeCodes(text) {
  const preferred = strategies[els.strategy.value] || strategies["taiwan-first"];
  return parseCodes(text).map((code) => {
    const matches = state.db.reverse?.[code] || [];
    const sorted = [...matches].sort((a, b) => {
      return preferred.indexOf(a.type) - preferred.indexOf(b.type);
    });
    return { code, matches: sorted };
  });
}

function getPaperCodeLines(entry) {
  if (entry.paperCodes) {
    return entry.paperCodes;
  }

  const order = strategies[els.strategy.value] || strategies["taiwan-first"];
  if (entry.codes) {
    if (order.length === 1) {
      const field = order[0];
      return [{ code: entry.codes[field] || "????", field, centered: true }];
    }

    const available = order
      .map((field) => ({ code: entry.codes[field], field, centered: false }))
      .filter((item) => item.code);

    if (available.length >= 2) {
      return available.slice(0, 2);
    }
    if (available.length === 1) {
      return [{ ...available[0], centered: true }];
    }
    return [{ code: "????", field: order[0], centered: true }];
  }

  if (entry.code) {
    return [{ code: entry.code, field: entry.field, centered: true }];
  }
  return [];
}

function renderPaperCode(entry) {
  const lines = getPaperCodeLines(entry);
  const singleClass = lines.length <= 1 ? " is-single" : "";
  const first = lines[0] || {};
  const second = lines[1] || {};

  return `
    <span class="paper-code-box${singleClass}">
      <span class="paper-code ${codeClasses[first.field] || ""}">${first.code || ""}</span>
      <span class="paper-code-alt ${codeClasses[second.field] || ""}">${second.code || ""}</span>
    </span>
    <span class="paper-char">${entry.char || ""}</span>
  `;
}

function renderEncode(entries) {
  els.codeOutput.innerHTML = "";
  els.reverseOutput.innerHTML = "";
  els.reverseOutput.classList.remove("is-hidden");
  const fragment = document.createDocumentFragment();
  const validEntries = entries.filter((entry) => entry.code);
  const missingEntries = entries.filter((entry) => entry.missing);

  state.plainCodes = validEntries.map((entry) => entry.code).join(" ");
  state.plainText = entries.filter((entry) => !entry.whitespace).map((entry) => entry.char).join("");
  els.codeOutput.textContent = state.plainCodes || "无可用电码";

  for (const entry of entries) {
    if (entry.whitespace) {
      continue;
    }
    const chip = document.createElement("div");
    chip.className = `code-chip${entry.note ? " variant" : ""}${entry.missing ? " missing" : ""}`;
    chip.innerHTML = `
      <span class="char">${entry.char}</span>
      <span class="code ${codeClasses[entry.field] || ""}">${entry.code || "----"}</span>
      <span class="note ${codeClasses[entry.noteField] || ""}">${entry.missing ? "未收录" : entry.note}</span>
    `;
    fragment.append(chip);
  }

  els.reverseOutput.append(fragment);
  renderPaper(entries);
  els.summary.textContent = `生成 ${validEntries.length} 组电码${missingEntries.length ? `，${missingEntries.length} 字未命中` : ""}`;
  setGlobalAlert(
    missingEntries.length
      ? `有 ${missingEntries.length} 个字无法转换：${missingEntries.map((entry) => entry.char).join(" ")}`
      : "",
  );
}

function renderDecode(rows) {
  els.codeOutput.innerHTML = "";
  els.paperGrid.innerHTML = "";
  els.reverseOutput.innerHTML = "";
  els.reverseOutput.classList.remove("is-hidden");
  const fragment = document.createDocumentFragment();
  const missingRows = rows.filter((row) => !row.matches.length);

  for (const row of rows) {
    const line = document.createElement("div");
    line.className = "reverse-row";
    const candidates = row.matches.length
      ? row.matches
        .map(
          (item) =>
            `<span class="candidate ${codeClasses[item.type] || ""}">${item.char} ${fieldLabels[item.type]}</span>`,
        )
        .join("")
      : `<span class="candidate">未收录</span>`;
    line.innerHTML = `<span class="reverse-code">${row.code}</span>${candidates}`;
    fragment.append(line);
  }

  els.reverseOutput.append(fragment);
  const decoded = rows.map((row) => row.matches[0]?.char || "□").join("");
  state.plainCodes = rows.map((row) => row.code).join(" ");
  state.plainText = decoded;
  els.codeOutput.textContent = decoded || "等待输入";
  renderPaper(
    rows.map((row) => ({
      char: row.matches[0]?.char || "□",
      code: row.code,
      field: row.matches[0]?.type || "",
      note: row.matches.length > 1 ? "多字" : "",
    })),
  );
  els.summary.textContent = rows.length ? `译出 ${rows.length} 组电码` : "未识别四位电码";
  setGlobalAlert(
    missingRows.length
      ? `有 ${missingRows.length} 个电码无法转换：${missingRows.map((row) => row.code).join(" ")}`
      : "",
  );
}

function renderPaper(entries) {
  els.paperGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const visible = entries.filter((entry) => !entry.whitespace);
  const rows = Math.max(2, Math.ceil(visible.length / 10));

  for (let row = 0; row < rows; row += 1) {
    const rowEl = document.createElement("div");
    rowEl.className = "paper-row";

    for (let col = 0; col < 10; col += 1) {
      const entry = visible[row * 10 + col] || {};
      const cell = document.createElement("div");
      cell.className = "paper-cell";
      cell.innerHTML = renderPaperCode(entry);
      rowEl.append(cell);
    }

    const count = document.createElement("div");
    count.className = "paper-count";
    count.textContent = String((row + 1) * 10);
    rowEl.append(count);
    fragment.append(rowEl);
  }

  els.paperGrid.append(fragment);
}

function refresh() {
  if (!state.db) {
    return;
  }
  const text = normalizeInputText(els.sourceText.value);
  if (!text.trim()) {
    state.entries = [];
    state.plainCodes = "";
    state.plainText = "";
    els.codeOutput.innerHTML = "";
    els.reverseOutput.innerHTML = "";
    els.reverseOutput.classList.remove("is-hidden");
    setGlobalAlert("");
    renderPaper([]);
    els.summary.textContent = "等待输入";
    return;
  }

  if (state.mode === "encode") {
    state.entries = encodeText(text);
    renderEncode(state.entries);
  } else {
    const rows = decodeCodes(text);
    state.entries = rows;
    renderDecode(rows);
  }
}

async function copyPlainCodes() {
  const value = state.mode === "encode" ? state.plainCodes : state.plainText;
  if (!value) {
    return;
  }
  await navigator.clipboard.writeText(value);
  els.copyCodes.textContent = "已复制";
  window.setTimeout(() => {
    els.copyCodes.textContent = state.mode === "encode" ? "复制纯码" : "复制译文";
  }, 1200);
}

async function pasteFromClipboard() {
  if (!navigator.clipboard || !els.pasteClipboard) {
    setGlobalAlert("此环境不支持剪贴板访问，请手动粘贴。");
    return;
  }
  try {
    const text = await navigator.clipboard.readText();
    if (text == null) return;
    els.sourceText.value = text;
    refresh();
    const original = els.pasteClipboard.textContent;
    els.pasteClipboard.textContent = "已粘贴";
    window.setTimeout(() => {
      els.pasteClipboard.textContent = original || "一键粘贴";
    }, 1200);
  } catch (err) {
    console.error(err);
    setGlobalAlert("粘贴失败：请允许访问剪贴板或手动粘贴。");
  }
}

function drawExportCanvas() {
  const entries =
    state.mode === "encode"
      ? state.entries.filter((entry) => !entry.whitespace)
      : state.entries.map((row) => ({
        char: row.matches[0]?.char || "□",
        code: row.code,
        field: row.matches[0]?.type || "",
        note: row.matches.length > 1 ? "多字" : "",
      }));

  const width = 1400;
  const startX = 72;
  const startY = 190;
  const countWidth = 52;
  const columns = 10;
  const contentWidth = width - startX * 2 - countWidth;
  const cell = contentWidth / columns;
  const codeHeight = 40;
  const rowHeight = codeHeight + cell;
  const rows = Math.max(2, Math.ceil(entries.length / columns));
  const gridHeight = rows * rowHeight;
  const footerTop = startY + gridHeight + 44;
  const height = footerTop + 96;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const serif = getCanvasSerifFamily();

  ctx.fillStyle = "#fbf1df";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#b2211f";
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.fillStyle = "#b2211f";
  ctx.font = `700 46px ${serif}`;
  ctx.fillText("中国电报报文纸", 72, 105);
  ctx.font = `700 28px ${serif}`;
  ctx.fillText("兼容校核联", width - 250, 105);

  ctx.fillStyle = "#2e6657";
  ctx.font = `700 30px ${serif}`;
  ctx.textAlign = "center";
  ctx.fillText("迅速  准确  保密  熟练", width / 2, 155);
  ctx.textAlign = "start";

  ctx.strokeStyle = "#b2211f";
  ctx.lineWidth = 2;
  for (let row = 0; row <= rows; row += 1) {
    ctx.beginPath();
    ctx.moveTo(startX, startY + row * rowHeight);
    ctx.lineTo(startX + columns * cell + countWidth, startY + row * rowHeight);
    ctx.stroke();
  }
  for (let row = 0; row < rows; row += 1) {
    ctx.beginPath();
    ctx.moveTo(startX, startY + row * rowHeight + codeHeight);
    ctx.lineTo(startX + columns * cell, startY + row * rowHeight + codeHeight);
    ctx.stroke();
  }
  for (let col = 0; col <= columns; col += 1) {
    ctx.beginPath();
    ctx.moveTo(startX + col * cell, startY);
    ctx.lineTo(startX + col * cell, startY + rows * rowHeight);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(startX + columns * cell + countWidth, startY);
  ctx.lineTo(startX + columns * cell + countWidth, startY + rows * rowHeight);
  ctx.stroke();

  entries.forEach((entry, index) => {
    const x = startX + (index % columns) * cell;
    const y = startY + Math.floor(index / columns) * rowHeight;
    const lines = getPaperCodeLines(entry);
    const first = lines[0] || {};
    const second = lines[1] || {};
    const firstColor = first.field === "kMainlandTelegraph" ? "#b2211f" : "#244b65";
    const secondColor = second.field === "kMainlandTelegraph" ? "#b2211f" : "#244b65";
    ctx.textAlign = "center";
    ctx.fillStyle = firstColor;
    const mainCodeSize = Math.min(24, Math.max(18, Math.floor(cell * 0.18)));
    const altCodeSize = Math.min(22, Math.max(16, Math.floor(cell * 0.16)));
    if (lines.length <= 1) {
      ctx.font = `700 ${mainCodeSize}px Courier New, monospace`;
      ctx.fillText(first.code || "", x + cell / 2, y + 27);
    } else {
      ctx.font = `700 ${mainCodeSize}px Courier New, monospace`;
      ctx.fillText(first.code || "", x + cell / 2, y + 17);
      ctx.fillStyle = secondColor;
      ctx.font = `700 ${altCodeSize}px Courier New, monospace`;
      ctx.fillText(second.code || "", x + cell / 2, y + 35);
    }
    ctx.fillStyle = "#241b17";
    const charSize = Math.floor(cell * 0.82);
    ctx.font = `700 ${charSize}px ${serif}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // 在 codeHeight 之下的方格区域垂直居中
    ctx.fillText(entry.char, x + cell / 2, y + codeHeight + cell / 2);
    // 恢复默认对齐，将在循环末尾统一设置
    ctx.textBaseline = "alphabetic";
  });
  ctx.textAlign = "start";

  ctx.fillStyle = "#b2211f";
  ctx.font = `18px ${serif}`;
  ctx.textAlign = "center";
  for (let row = 0; row < rows; row += 1) {
    ctx.fillText(
      String((row + 1) * 10),
      startX + columns * cell + countWidth / 2,
      startY + row * rowHeight + rowHeight - 12,
    );
  }

  ctx.fillStyle = "#b2211f";
  ctx.font = `700 24px ${serif}`;
  ctx.textAlign = "start";
  ctx.fillText("译电员：识盈", 72, footerTop);
  ctx.textAlign = "right";
  ctx.fillText(todayLabel(), width - 72, footerTop);
  ctx.textAlign = "start";
  return canvas;
}

async function exportImage() {
  try {
    await ensureCanvasFonts();
  } catch (err) {
    console.warn("ensureCanvasFonts failed:", err);
    setGlobalAlert("警告：字体加载失败，导出将使用替代字体");
  }
  const canvas = drawExportCanvas();
  // 使用 toBlob 生成可下载的二进制，避免在某些环境下 data: URL 被阻止或过大
  return new Promise((resolve) => {
    if (!canvas.toBlob) {
      // 退回到 toDataURL（极老环境）
      try {
        const link = document.createElement("a");
        link.download = `telegraph-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (e) {
        setGlobalAlert("导出失败：无法生成图片");
      }
      resolve();
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        setGlobalAlert("导出失败：无法生成图片");
        resolve();
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `telegraph-${Date.now()}.png`;
      link.href = url;
      // 在某些上下文下需要把链接加入 DOM 才能触发下载
      document.body.appendChild(link);
      link.click();
      link.remove();
      // 延迟撤销，确保浏览器完成下载流程
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      resolve();
    }, "image/png");
  });
}

function setMode(mode) {
  state.mode = mode;
  els.tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.mode === mode);
  });
  renderCorpusOptions();
  els.sourceText.placeholder =
    mode === "encode" ? "输入中文，例如：一丁七万" : "输入四位电码，例如：0001 0002 0003";
  els.copyCodes.textContent = mode === "encode" ? "复制纯码" : "复制译文";
  refresh();
}

function bindEvents() {
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });
  els.corpusSelect?.addEventListener("focus", loadCorporaManifest);
  els.corpusSelect?.addEventListener("change", loadSelectedCorpus);
  els.sourceText.addEventListener("input", () => {
    resetCorpusSelection();
    refresh();
  });
  els.strategy.addEventListener("change", refresh);
  els.hanConversionToggle.addEventListener("click", cycleHanConversion);
  els.normalizeWidthToggle.addEventListener("click", cycleNormalizeWidth);
  els.markVariantsToggle.addEventListener("click", toggleVariantAnnotation);
  els.markVariants.addEventListener("change", () => {
    syncVariantAnnotationIcon();
    refresh();
  });
  els.copyCodes.addEventListener("click", copyPlainCodes);
  if (els.pasteClipboard) {
    els.pasteClipboard.addEventListener("click", pasteFromClipboard);
  }
  els.exportImage.addEventListener("click", exportImage);
  els.clearAll.addEventListener("click", () => {
    els.sourceText.value = "";
    resetCorpusSelection();
    refresh();
  });
  els.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  els.jumpToPaper.addEventListener("click", () => {
    els.telegramPaper.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  window.addEventListener("scroll", () => {
    els.quickJumps.classList.add("is-visible");
    els.backToTop.classList.toggle("is-hidden", window.scrollY <= 220);
  });
}

els.paperDate.textContent = todayLabel();
bindEvents();
syncHanConversionIcon();
syncNormalizeWidthIcon();
syncVariantAnnotationIcon();
loadCorporaManifest();
els.quickJumps.classList.add("is-visible");
els.backToTop.classList.add("is-hidden");
loadDatabase()
  .then(refresh)
  .catch((error) => {
    setLoading("失败");
    els.summary.textContent = error.message;
  });
