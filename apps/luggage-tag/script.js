const FONT_FALLBACKS = {
    PixelFontZHHans: '"PixelFontZHHans", "PixelFontZHHant", "PixelFontLatin", sans-serif',
    PixelFontZHHant: '"PixelFontZHHant", "PixelFontZHHans", "PixelFontLatin", sans-serif',
    PixelFontLatin: '"PixelFontLatin", sans-serif',
    PixelFontJA: '"PixelFontJA", "PixelFontZHHans", "PixelFontLatin", sans-serif',
    PixelFontKO: '"PixelFontKO", "PixelFontZHHans", "PixelFontLatin", sans-serif'
};

const LANGUAGE_STORAGE_KEY = 'luggageTagLanguage';
const SUPPORTED_LANGUAGES = ['zh-CN', 'en'];
let currentLanguage = getSavedLanguage();

const I18N = {
    'zh-CN': {
        pageTitle: '行李牌生成器 | BG7LDB Tool Hub',
        heading: '🧳 三色墨水屏行李牌生成',
        languageButton: 'EN',
        languageButtonLabel: 'Switch to English',
        ownerLabel: '所有者标识',
        scanTextLabel: '扫码提示文案',
        qrDataLabel: '二维码数据',
        scanButton: '选择扫描二维码',
        advancedOptions: '高级选项',
        fontLabel: '字体',
        fontNoticePrefix: '开源字体支持：',
        fontZHHans: '简体中文',
        fontZHHant: '繁体中文',
        fontLatin: '英文',
        fontJA: '日文',
        fontKO: '朝鲜文',
        topThanksLabel: '上方感谢词',
        bottomThanksLabel: '下方感谢词',
        generateButton: '实时预览',
        canvasLabel: '行李牌预览',
        downloadButton: '保存图片',
        bleButton: '蓝牙直刷',
        bleDisconnectedButton: '蓝牙断开',
        connectingButton: '正在连接...',
        initButton: '初始化设备...',
        extractPixelsButton: '提取像素...',
        refreshButton: '刷新屏幕...',
        successButton: '刷写成功！',
        bwLayer: '黑白',
        redLayer: '红色',
        dataProgress: '数据',
        statusLabel: '状态：',
        feedbackTitle: '反馈区',
        clearLogButton: '清空日志',
        readyLog: '系统已就绪，可开始生成或刷写。',
        imageSaved: '图片已保存为: {filename}',
        qrGeneratingFailed: '二维码生成失败:',
        qrRecognizing: '二维码识别中...',
        qrStart: '开始识别二维码图片: {filename}',
        qrInputMissing: '未找到二维码数据输入框',
        qrDone: '二维码识别完成',
        qrSuccess: '二维码识别成功，已写入数据: {text}',
        qrFailed: '二维码识别失败',
        qrFailedWithMessage: '二维码识别失败: {message}',
        qrFailedAlert: '二维码识别失败：{message}',
        imageLoadFailed: '图片加载失败',
        qrLibMissing: '二维码识别库未加载，请检查网络后重试',
        qrCanvasFailed: '无法创建二维码识别画布',
        qrRetryBlur: '原图识别失败，尝试轻度点阵融合。',
        qrRetryMorph: '继续尝试形态学增强识别。',
        qrRetryGray: '继续尝试灰度高阈值提纯识别。',
        qrNoResult: '未能识别，可能是由于二维码变形严重、过于模糊或中心遮挡面积超出了容错率。',
        writeNoCharacteristic: '写入失败：未找到可用的特征值。',
        writeException: '写入异常: {message}',
        gattDisconnected: 'GATT 连接已断开。',
        bluetoothDisconnectedStatus: '蓝牙已断开',
        bluetoothUnsupportedAlert: '当前浏览器不支持 Web Bluetooth API，请使用 Chrome/Edge，并确保是 HTTPS 环境。',
        bluetoothUnsupportedLog: '当前浏览器不支持 Web Bluetooth API。',
        choosingDeviceStatus: '正在选择设备',
        chooseDeviceLog: '开始选择蓝牙设备。',
        deviceSelected: '设备已选择: {name}',
        unknownDevice: '未知设备',
        invalidDeviceAlert: '请连接 NRF 系列设备（设备名以 NRF 开头），当前设备不符合要求。',
        invalidDeviceLog: '设备名称校验失败，流程中止。',
        sessionParams: '会话参数: mtu={mtu}, interleavedCount={interleavedCount}',
        disconnectListenerWarn: '无法注册断连事件',
        connectingGattStatus: '正在连接 GATT',
        gattAttempt: '连接 GATT 尝试 {attempt}/4',
        gattConnected: 'GATT 连接成功。',
        gattConnectFailed: '无法连接到 GATT Server，请重试连接',
        epdServiceFound: '已发现 EPD Service。',
        characteristicFound: '已发现写入 Characteristic。',
        notificationsStarted: '通知已开启，开始监听 MTU。',
        mtuAdjusted: '设备反馈：MTU 自动调整为 {mtu}',
        notificationParseFailed: '通知解析失败: {message}',
        notificationEnableFailed: '无法启用通知: {message}',
        initStatus: '初始化设备',
        sendInit: '发送 INIT 指令 (0x01)。',
        imageDataStatus: '生成图像数据',
        canvasExtractStart: '开始提取 Canvas 像素并转换。',
        imageConvertDone: '图像转换完成：黑白层 {bw}B，红色层 {red}B',
        refreshStatus: '刷新屏幕中',
        sendRefresh: '数据发送完成，触发 REFRESH (0x05)。',
        sendDoneStatus: '发送完成',
        flashDone: '刷写流程完成。',
        flashFailed: '蓝牙刷写失败: {message}',
        failedStatus: '失败',
        flashFailedAlert: '蓝牙刷写中止或失败: {message}',
        sendLayerStart: '开始发送{layer}层，总大小 {size}B，分块 {chunkSize}B',
        chunkWriteInterrupted: '数据块写入中断: {message}',
        layerSendDone: '{layer}层发送完成，共 {totalChunks} 包'
    },
    en: {
        pageTitle: 'Luggage Tag Generator | BG7LDB Tool Hub',
        heading: '🧳 Tri-color E-paper Luggage Tag',
        languageButton: '中',
        languageButtonLabel: '切换到中文',
        ownerLabel: 'Owner ID',
        scanTextLabel: 'Scan prompt text',
        qrDataLabel: 'QR code data',
        scanButton: 'Scan QR image',
        advancedOptions: 'Advanced options',
        fontLabel: 'Font',
        fontNoticePrefix: 'Open-source font: ',
        fontZHHans: 'Simplified Chinese',
        fontZHHant: 'Traditional Chinese',
        fontLatin: 'English',
        fontJA: 'Japanese',
        fontKO: 'Korean',
        topThanksLabel: 'Top thank-you text',
        bottomThanksLabel: 'Bottom thank-you text',
        generateButton: 'Live preview',
        canvasLabel: 'Luggage tag preview',
        downloadButton: 'Save image',
        bleButton: 'Flash via Bluetooth',
        bleDisconnectedButton: 'Bluetooth disconnected',
        connectingButton: 'Connecting...',
        initButton: 'Initializing...',
        extractPixelsButton: 'Extracting pixels...',
        refreshButton: 'Refreshing screen...',
        successButton: 'Flash complete!',
        bwLayer: 'B/W',
        redLayer: 'red',
        dataProgress: ' data',
        statusLabel: 'Status: ',
        feedbackTitle: 'Feedback',
        clearLogButton: 'Clear log',
        readyLog: 'System ready. You can generate or flash now.',
        imageSaved: 'Image saved as: {filename}',
        qrGeneratingFailed: 'QR code generation failed:',
        qrRecognizing: 'Recognizing QR code...',
        qrStart: 'Reading QR image: {filename}',
        qrInputMissing: 'QR data input was not found',
        qrDone: 'QR code recognized',
        qrSuccess: 'QR code recognized and written to data: {text}',
        qrFailed: 'QR recognition failed',
        qrFailedWithMessage: 'QR recognition failed: {message}',
        qrFailedAlert: 'QR recognition failed: {message}',
        imageLoadFailed: 'Image failed to load',
        qrLibMissing: 'QR recognition library is not loaded. Check the network and try again.',
        qrCanvasFailed: 'Unable to create QR recognition canvas',
        qrRetryBlur: 'Original image failed. Trying light pixel blur.',
        qrRetryMorph: 'Trying enhanced morphology recognition.',
        qrRetryGray: 'Trying grayscale high-threshold cleanup.',
        qrNoResult: 'Unable to recognize the QR code. It may be badly distorted, too blurry, or blocked beyond the error-correction limit.',
        writeNoCharacteristic: 'Write failed: no available characteristic found.',
        writeException: 'Write error: {message}',
        gattDisconnected: 'GATT connection disconnected.',
        bluetoothDisconnectedStatus: 'Bluetooth disconnected',
        bluetoothUnsupportedAlert: 'This browser does not support Web Bluetooth. Use Chrome/Edge and make sure the page is served over HTTPS.',
        bluetoothUnsupportedLog: 'This browser does not support Web Bluetooth.',
        choosingDeviceStatus: 'Selecting device',
        chooseDeviceLog: 'Starting Bluetooth device selection.',
        deviceSelected: 'Device selected: {name}',
        unknownDevice: 'Unknown device',
        invalidDeviceAlert: 'Please connect an NRF-series device whose name starts with NRF.',
        invalidDeviceLog: 'Device name validation failed. Flow stopped.',
        sessionParams: 'Session params: mtu={mtu}, interleavedCount={interleavedCount}',
        disconnectListenerWarn: 'Unable to register disconnect listener',
        connectingGattStatus: 'Connecting GATT',
        gattAttempt: 'GATT connection attempt {attempt}/4',
        gattConnected: 'GATT connected.',
        gattConnectFailed: 'Unable to connect to GATT Server. Please try again.',
        epdServiceFound: 'EPD Service found.',
        characteristicFound: 'Write Characteristic found.',
        notificationsStarted: 'Notifications started. Listening for MTU.',
        mtuAdjusted: 'Device feedback: MTU automatically adjusted to {mtu}',
        notificationParseFailed: 'Notification parse failed: {message}',
        notificationEnableFailed: 'Unable to enable notifications: {message}',
        initStatus: 'Initializing device',
        sendInit: 'Sending INIT command (0x01).',
        imageDataStatus: 'Generating image data',
        canvasExtractStart: 'Extracting Canvas pixels and converting.',
        imageConvertDone: 'Image converted: B/W layer {bw}B, red layer {red}B',
        refreshStatus: 'Refreshing screen',
        sendRefresh: 'Data sent. Triggering REFRESH (0x05).',
        sendDoneStatus: 'Send complete',
        flashDone: 'Flash flow complete.',
        flashFailed: 'Bluetooth flash failed: {message}',
        failedStatus: 'Failed',
        flashFailedAlert: 'Bluetooth flash was interrupted or failed: {message}',
        sendLayerStart: 'Sending {layer} layer, total {size}B, chunk {chunkSize}B',
        chunkWriteInterrupted: 'Data chunk write interrupted: {message}',
        layerSendDone: '{layer} layer sent, {totalChunks} packets total'
    }
};

window.onload = async () => {
    applyLanguage();
    await ensureInitialFontReady();
    generateTag();
    addLog(t('readyLog'), 'OK', 'SYS');
};

// 更新 summary 的 aria-expanded 状态（便于无障碍设备识别）
document.addEventListener('DOMContentLoaded', () => {
    applyLanguage();

    document.querySelectorAll('.advanced-options').forEach(details => {
        const summary = details.querySelector('summary');
        if (!summary) return;
        // 初始化
        summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
        details.addEventListener('toggle', () => {
            summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
        });
    });
});

function getSavedLanguage() {
    try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (SUPPORTED_LANGUAGES.includes(saved)) return saved;
    } catch (error) {
        // localStorage can be unavailable in some embedded browser contexts.
    }
    return 'zh-CN';
}

function t(key, values = {}) {
    const dictionary = I18N[currentLanguage] || I18N['zh-CN'];
    let text = dictionary[key] || I18N['zh-CN'][key] || key;
    Object.entries(values).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, value);
    });
    return text;
}

function applyLanguage() {
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
        element.dataset.i18nAttr.split(';').forEach(binding => {
            const [attribute, key] = binding.split(':').map(part => part && part.trim());
            if (attribute && key) element.setAttribute(attribute, t(key));
        });
    });

    const toggle = document.getElementById('languageToggle');
    if (toggle) {
        toggle.textContent = t('languageButton');
        toggle.setAttribute('aria-label', t('languageButtonLabel'));
        toggle.title = t('languageButtonLabel');
    }

    const status = document.getElementById('status');
    if (status && status.dataset.statusKey) {
        status.textContent = t(status.dataset.statusKey);
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh-CN' ? 'en' : 'zh-CN';
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    } catch (error) {
        // Language switching still works for the current page load.
    }
    applyLanguage();
}

async function ensureInitialFontReady() {
    const fontChoice = document.getElementById('fontChoice');
    const preferredFont = 'PixelFontZHHans';
    if (fontChoice.value !== preferredFont) fontChoice.value = preferredFont;
    try {
        if (document.fonts && document.fonts.load) {
            await document.fonts.load(`12px "${preferredFont}"`);
            await document.fonts.ready;
        }
    } catch (error) {
        const fallbackFont = 'PixelFontLatin';
        fontChoice.value = fallbackFont;
        if (document.fonts && document.fonts.load) {
            await document.fonts.load(`12px "${fallbackFont}"`);
            await document.fonts.ready;
        }
    }
}

function generateTag() {
    const canvas = document.getElementById('tagCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const owner = document.getElementById('ownerId').value;
    const data = document.getElementById('qrData').value;
    const fontChoice = document.getElementById('fontChoice').value;
    const topThanksText = document.getElementById('topThanksText').value;
    const bottomThanksText = document.getElementById('bottomThanksText').value;
    const scanText = document.getElementById('scanText').value;

    const WIDTH = 250, HEIGHT = 122;
    const LEFT_WIDTH = 128, RIGHT_WIDTH = 122;

    // 1. 绘制底色块
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, LEFT_WIDTH, 24);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, HEIGHT - 24, LEFT_WIDTH, 24);

    const fontSizes = { PixelFontZHHans: { title: 12, owner: 24, scan: 12 }, PixelFontZHHant: { title: 12, owner: 24, scan: 12 }, PixelFontLatin: { title: 12, owner: 24, scan: 12 }, PixelFontJA: { title: 12, owner: 24, scan: 12 }, PixelFontKO: { title: 12, owner: 24, scan: 12 } };
    const selectedSizes = fontSizes[fontChoice] || fontSizes.PixelFontZHHans;
    const selectedFont = fontChoice || 'PixelFontZHHans';
    const fontStack = FONT_FALLBACKS[selectedFont] || FONT_FALLBACKS.PixelFontZHHans;

    const textCanvas = document.createElement('canvas');
    textCanvas.width = WIDTH;
    textCanvas.height = HEIGHT;
    const textCtx = textCanvas.getContext('2d', { willReadFrequently: true });
    textCtx.textAlign = 'left';
    textCtx.textBaseline = 'top';
    textCtx.imageSmoothingEnabled = false;

    function drawCrispText(text, centerX, y, size, color) {
        textCtx.font = `${size}px ${fontStack}`;
        textCtx.fillStyle = color;
        const textWidth = textCtx.measureText(text).width;
        const startX = Math.round(centerX - textWidth / 2);
        const startY = Math.round(y);
        textCtx.fillText(text, startX, startY);
    }

    drawCrispText(topThanksText, 64, 6, selectedSizes.title, '#FFFFFF');
    drawCrispText(bottomThanksText, 64, 104, selectedSizes.title, '#FFFFFF');
    drawCrispText(owner, 64, 38, selectedSizes.owner, '#000000');
    drawCrispText(scanText, 64, 72, selectedSizes.scan, '#FF0000');

    const imgData = textCtx.getImageData(0, 0, WIDTH, HEIGHT);
    const pixels = imgData.data;
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] > 180) {
            pixels[i + 3] = 255;
            const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
            if (r > 150) {
                if (g > 150) {
                    pixels[i] = 255; pixels[i + 1] = 255; pixels[i + 2] = 255;
                } else {
                    pixels[i] = 255; pixels[i + 1] = 0; pixels[i + 2] = 0;
                }
            } else {
                pixels[i] = 0; pixels[i + 1] = 0; pixels[i + 2] = 0;
            }
        } else {
            pixels[i + 3] = 0;
        }
    }
    textCtx.putImageData(imgData, 0, 0);

    ctx.drawImage(textCanvas, 0, 0);

    try {
        const qr = qrcode(0, 'L');
        qr.addData(data);
        qr.make();
        const moduleCount = qr.getModuleCount();
        const maxAreaSize = 118;

        let modulePixelSize = Math.floor(maxAreaSize / moduleCount);
        if (modulePixelSize < 2) modulePixelSize = 2;
        const finalQrSize = moduleCount * modulePixelSize;

        const startX = Math.round(LEFT_WIDTH + (RIGHT_WIDTH - finalQrSize) / 2);
        const startY = Math.round((HEIGHT - finalQrSize) / 2);

        ctx.fillStyle = '#000000';
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    const x = startX + (col * modulePixelSize);
                    const y = startY + (row * modulePixelSize);
                    ctx.fillRect(x, y, modulePixelSize, modulePixelSize);
                }
            }
        }
    } catch (err) {
        console.error(t('qrGeneratingFailed'), err);
    }
}

function downloadImage() {
    const canvas = document.getElementById('tagCanvas');
    const dataUrl = canvas.toDataURL('image/png');

    const ownerInput = document.getElementById('ownerId');
    const fallbackInput = document.getElementById('scanText');
    const importantText = ((ownerInput && ownerInput.value) || (fallbackInput && fallbackInput.value) || 'luggage_tag').trim();
    const safeImportantText = importantText
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, '_')
        .slice(0, 40) || 'luggage_tag';

    const now = new Date();
    const timestamp = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '_' +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');

    const link = document.createElement('a');
    link.download = `${safeImportantText}_${timestamp}.png`;
    link.href = dataUrl;
    link.click();

    addLog(t('imageSaved', { filename: link.download }), 'OK', 'FILE');
}

function openQrImagePicker() {
    const input = document.getElementById('qrImageInput');
    if (input) {
        input.value = '';
        input.click();
    }
}

async function handleQrImageSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setStatus('qrRecognizing');
    addLog(t('qrStart', { filename: file.name }), 'INFO', 'QR');

    try {
        const qrText = await decodeQrCodeFromFile(file);
        const qrDataInput = document.getElementById('qrData');
        if (!qrDataInput) {
            throw new Error(t('qrInputMissing'));
        }

        qrDataInput.value = qrText;
        generateTag();

        setStatus('qrDone');
        addLog(t('qrSuccess', { text: qrText }), 'OK', 'QR');
    } catch (error) {
        console.error(error);
        setStatus('qrFailed');
        addLog(t('qrFailedWithMessage', { message: error.message || error }), 'ERROR', 'QR');
        alert(t('qrFailedAlert', { message: error.message || error }));
    }
}

function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(t('imageLoadFailed')));
        };

        image.src = objectUrl;
    });
}

async function decodeQrCodeFromFile(file) {
    if (!window.jsQR) {
        throw new Error(t('qrLibMissing'));
    }

    const image = await loadImageFromFile(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
        throw new Error(t('qrCanvasFailed'));
    }

    canvas.width = image.width;
    canvas.height = image.height;

    const tryDecode = (filterStyle = 'none') => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = filterStyle;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
        });
    };

    let qrCode = tryDecode('none');

    if (!qrCode || !qrCode.data) {
        addLog(t('qrRetryBlur'), 'WARN', 'QR');
        qrCode = tryDecode('blur(4px)');
    }

    if (!qrCode || !qrCode.data) {
        addLog(t('qrRetryMorph'), 'WARN', 'QR');
        qrCode = tryDecode('blur(6px) contrast(200%)');
    }

    if (!qrCode || !qrCode.data) {
        addLog(t('qrRetryGray'), 'WARN', 'QR');
        qrCode = tryDecode('grayscale(100%) contrast(300%) blur(4px)');
    }

    if (!qrCode || !qrCode.data) {
        throw new Error(t('qrNoResult'));
    }

    return qrCode.data;
}

function setStatus(statusKeyOrText, values = {}) {
    const status = document.getElementById('status');
    if (status) {
        const hasTranslation = Boolean((I18N[currentLanguage] && I18N[currentLanguage][statusKeyOrText]) || I18N['zh-CN'][statusKeyOrText]);
        status.dataset.statusKey = hasTranslation ? statusKeyOrText : '';
        status.textContent = hasTranslation ? t(statusKeyOrText, values) : statusKeyOrText;
    }
}

function addLog(text, level = 'INFO', scope = 'SYS') {
    const log = document.getElementById('log');
    if (!log) return;

    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

    const normalizedLevel = String(level || 'INFO').toUpperCase();
    const normalizedScope = String(scope || 'SYS').toUpperCase();

    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = time;
    logEntry.appendChild(timeSpan);

    const levelSpan = document.createElement('span');
    levelSpan.className = `level level-${normalizedLevel.toLowerCase()}`;
    levelSpan.textContent = `[${normalizedLevel}]`;
    logEntry.appendChild(levelSpan);

    const scopeSpan = document.createElement('span');
    scopeSpan.className = 'scope';
    scopeSpan.textContent = `[${normalizedScope}]`;
    logEntry.appendChild(scopeSpan);

    const msgSpan = document.createElement('span');
    msgSpan.className = 'msg';
    msgSpan.textContent = text;
    logEntry.appendChild(msgSpan);

    log.appendChild(logEntry);
    log.scrollTop = log.scrollHeight;

    while (log.childNodes.length > 80) {
        log.removeChild(log.firstChild);
    }
}

function clearLog() {
    const log = document.getElementById('log');
    if (log) {
        log.innerHTML = '';
    }
}

const EpdCmd = {
    INIT: 0x01,
    REFRESH: 0x05,
    WRITE_IMG: 0x30
};

function bytes2hex(data) {
    return Array.from(data).map(b => (b & 0xFF).toString(16).padStart(2, '0')).join('');
}

function hex2bytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
}

async function write(cmd, data = null, withResponse = true) {
    if (!bleChar) {
        addLog(t('writeNoCharacteristic'), 'ERROR', 'BLE');
        throw new Error('Characteristic not available');
    }
    let payloadArr = [cmd];
    if (data) {
        if (data instanceof Uint8Array) payloadArr.push(...Array.from(data));
        else if (Array.isArray(data)) payloadArr.push(...data);
        else if (typeof data === 'string') payloadArr.push(...hex2bytes(data));
    }
    const payload = new Uint8Array(payloadArr);
    try {
        addLog(bytes2hex(payload), 'TX', 'BLE');
        if (withResponse) {
            await bleChar.writeValueWithResponse(payload);
        } else {
            await bleChar.writeValueWithoutResponse(payload);
        }
    } catch (e) {
        addLog(t('writeException', { message: e.message || e }), 'ERROR', 'BLE');
        throw e;
    }
    return true;
}

let bleChar = null;
let mtuSize = 20;
let interleavedCount = 50;
let bleDevice = null;

function handleGattDisconnected(event) {
    console.warn('GATT Server disconnected');
    addLog(t('gattDisconnected'), 'WARN', 'BLE');
    setStatus('bluetoothDisconnectedStatus');
    const btn = document.getElementById('btnBle');
    if (btn) {
        btn.innerHTML = t('bleDisconnectedButton');
        btn.disabled = false;
    }
    bleChar = null;
}

const textDecoder = new TextDecoder();

async function connectAndFlash() {
    const btn = document.getElementById('btnBle');

    if (!navigator.bluetooth) {
        alert(t('bluetoothUnsupportedAlert'));
        addLog(t('bluetoothUnsupportedLog'), 'ERROR', 'BLE');
        return;
    }

    btn.innerText = t('connectingButton');
    btn.disabled = true;
    setStatus('choosingDeviceStatus');
    addLog(t('chooseDeviceLog'), 'INFO', 'BLE');

    try {
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'NRF' }],
            optionalServices: ['62750001-d828-918d-fb46-b6c11c675aec']
        });
        addLog(t('deviceSelected', { name: bleDevice.name || t('unknownDevice') }), 'OK', 'BLE');

        if (!(bleDevice && bleDevice.name && bleDevice.name.startsWith('NRF'))) {
            alert(t('invalidDeviceAlert'));
            addLog(t('invalidDeviceLog'), 'WARN', 'BLE');
            btn.innerHTML = t('bleButton');
            btn.disabled = false;
            return;
        }

        addLog(t('sessionParams', { mtu: mtuSize, interleavedCount }), 'INFO', 'BLE');

        try {
            bleDevice.addEventListener('gattserverdisconnected', handleGattDisconnected);
        } catch (e) {
            console.warn(t('disconnectListenerWarn'), e);
        }

        setStatus('connectingGattStatus');
        let server = null;
        let connectError = null;
        for (let attempt = 0; attempt < 4; attempt++) {
            try {
                addLog(t('gattAttempt', { attempt: attempt + 1 }), 'INFO', 'BLE');
                server = await bleDevice.gatt.connect();
                if (server && server.connected) {
                    addLog(t('gattConnected'), 'OK', 'BLE');
                    connectError = null;
                    break;
                }
            } catch (e) {
                connectError = e;
            }
            await new Promise(r => setTimeout(r, 400));
        }
        if (!server || !server.connected) {
            throw new Error(connectError && connectError.message ? connectError.message : t('gattConnectFailed'));
        }

        const service = await server.getPrimaryService('62750001-d828-918d-fb46-b6c11c675aec');
        addLog(t('epdServiceFound'), 'OK', 'BLE');
        bleChar = await service.getCharacteristic('62750002-d828-918d-fb46-b6c11c675aec');
        addLog(t('characteristicFound'), 'OK', 'BLE');

        try {
            await bleChar.startNotifications();
            addLog(t('notificationsStarted'), 'OK', 'BLE');
            bleChar.addEventListener('characteristicvaluechanged', (event) => {
                try {
                    const msg = textDecoder.decode(event.target.value);
                    if (msg && msg.startsWith('mtu=')) {
                        const m = parseInt(msg.substring(4));
                        if (!isNaN(m) && m > 0) {
                            mtuSize = m;
                            addLog(t('mtuAdjusted', { mtu: mtuSize }), 'INFO', 'BLE');
                        }
                    }
                } catch (e) {
                    addLog(t('notificationParseFailed', { message: e.message || e }), 'WARN', 'BLE');
                }
            });
        } catch (e) {
            addLog(t('notificationEnableFailed', { message: e.message || e }), 'WARN', 'BLE');
        }

        btn.innerText = t('initButton');
        setStatus('initStatus');
        addLog(t('sendInit'), 'INFO', 'BLE');
        await write(EpdCmd.INIT);
        await new Promise(r => setTimeout(r, 200));

        btn.innerText = t('extractPixelsButton');
        setStatus('imageDataStatus');
        addLog(t('canvasExtractStart'), 'INFO', 'IMG');
        await new Promise(r => setTimeout(r, 50));

        const { bwData, redData } = processCanvasToEink();
        addLog(t('imageConvertDone', { bw: bwData.length, red: redData.length }), 'OK', 'IMG');

        await sendImageData(bwData, 'bw', btn);
        await sendImageData(redData, 'red', btn);

        btn.innerText = t('refreshButton');
        setStatus('refreshStatus');
        addLog(t('sendRefresh'), 'INFO', 'BLE');
        await write(EpdCmd.REFRESH);

        btn.innerText = t('successButton');
        setStatus('sendDoneStatus');
        addLog(t('flashDone'), 'OK', 'BLE');

        setTimeout(() => {
            btn.innerHTML = t('bleButton');
            btn.disabled = false;
        }, 4000);

    } catch (err) {
        console.error(err);
        addLog(t('flashFailed', { message: err.message }), 'ERROR', 'BLE');
        setStatus('failedStatus');
        alert(t('flashFailedAlert', { message: err.message }));
        btn.innerHTML = t('bleButton');
        btn.disabled = false;
    }
}

function processCanvasToEink() {
    const canvas = document.getElementById('tagCanvas');
    const ctx = canvas.getContext('2d');
    const W = 250, H = 122;

    const rW = 122, rH = 250;
    const bytesPerRow = Math.ceil(rW / 8);

    const bwData = new Uint8Array(bytesPerRow * rH);
    const redData = new Uint8Array(bytesPerRow * rH);

    bwData.fill(0xFF);
    redData.fill(0xFF);

    const imgData = ctx.getImageData(0, 0, W, H).data;

    for (let y = 0; y < rH; y++) {
        for (let x = 0; x < rW; x++) {
            const oldX = rH - 1 - y;
            const oldY = x;

            const idx = (oldY * W + oldX) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];

            const isBlack = r < 100 && g < 100 && b < 100 && a > 128;
            const isRed = r > 150 && g < 100 && b < 100 && a > 128;

            const byteIdx = y * bytesPerRow + Math.floor(x / 8);
            const bitIdx = 7 - (x % 8);

            if (isBlack) {
                bwData[byteIdx] &= ~(1 << bitIdx);
            }
            if (isRed) {
                redData[byteIdx] &= ~(1 << bitIdx);
            }
        }
    }
    return { bwData, redData };
}

async function sendImageData(data, type, btn) {
    const chunkSize = Math.max(2, mtuSize - 2);
    let chunkIdx = 0;
    let noReplyCount = interleavedCount;
    const totalChunks = Math.ceil(data.length / chunkSize);

    const layerName = type === 'bw' ? t('bwLayer') : t('redLayer');
    addLog(t('sendLayerStart', { layer: layerName, size: data.length, chunkSize }), 'INFO', 'TX');

    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);

        const headerBase = (type === 'bw') ? 0x0F : 0x00;
        const headerByte = headerBase | (i === 0 ? 0x00 : 0xF0);

        const payload = new Uint8Array(chunk.length + 1);
        payload[0] = headerByte;
        payload.set(chunk, 1);

        try {
            if (noReplyCount > 0) {
                await write(EpdCmd.WRITE_IMG, payload, false);
                noReplyCount--;
            } else {
                await write(EpdCmd.WRITE_IMG, payload, true);
                noReplyCount = interleavedCount;
            }
        } catch (e) {
            addLog(t('chunkWriteInterrupted', { message: e.message }), 'ERROR', 'TX');
            throw e;
        }

        if (chunkIdx % 20 === 0 || i + chunkSize >= data.length) {
            const percent = Math.min(100, Math.floor(((i + chunk.length) / data.length) * 100));
            btn.innerText = `${layerName}${t('dataProgress')} ${percent}%`;
        }

        chunkIdx++;
    }
    addLog(t('layerSendDone', { layer: layerName, totalChunks }), 'OK', 'TX');
}
