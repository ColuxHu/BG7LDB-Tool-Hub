const FONT_FALLBACKS = {
    PixelFontZHHans: '"PixelFontZHHans", "PixelFontZHHant", "PixelFontLatin", sans-serif',
    PixelFontZHHant: '"PixelFontZHHant", "PixelFontZHHans", "PixelFontLatin", sans-serif',
    PixelFontLatin: '"PixelFontLatin", sans-serif',
    PixelFontJA: '"PixelFontJA", "PixelFontZHHans", "PixelFontLatin", sans-serif',
    PixelFontKO: '"PixelFontKO", "PixelFontZHHans", "PixelFontLatin", sans-serif'
};

window.onload = async () => {
    await ensureInitialFontReady();
    generateTag();
    addLog('系统已就绪，可开始生成或刷写。', 'OK', 'SYS');
};

// 更新 summary 的 aria-expanded 状态（便于无障碍设备识别）
document.addEventListener('DOMContentLoaded', () => {
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
        console.error("二维码生成失败:", err);
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

    addLog(`图片已保存为: ${link.download}`, 'OK', 'FILE');
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

    setStatus('二维码识别中...');
    addLog(`开始识别二维码图片: ${file.name}`, 'INFO', 'QR');

    try {
        const qrText = await decodeQrCodeFromFile(file);
        const qrDataInput = document.getElementById('qrData');
        if (!qrDataInput) {
            throw new Error('未找到二维码数据输入框');
        }

        qrDataInput.value = qrText;
        generateTag();

        setStatus('二维码识别完成');
        addLog(`二维码识别成功，已写入数据: ${qrText}`, 'OK', 'QR');
    } catch (error) {
        console.error(error);
        setStatus('二维码识别失败');
        addLog(`二维码识别失败: ${error.message || error}`, 'ERROR', 'QR');
        alert('二维码识别失败：' + (error.message || error));
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
            reject(new Error('图片加载失败'));
        };

        image.src = objectUrl;
    });
}

async function decodeQrCodeFromFile(file) {
    if (!window.jsQR) {
        throw new Error('二维码识别库未加载，请检查网络后重试');
    }

    const image = await loadImageFromFile(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
        throw new Error('无法创建二维码识别画布');
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
        addLog('原图识别失败，尝试轻度点阵融合。', 'WARN', 'QR');
        qrCode = tryDecode('blur(4px)');
    }

    if (!qrCode || !qrCode.data) {
        addLog('继续尝试形态学增强识别。', 'WARN', 'QR');
        qrCode = tryDecode('blur(6px) contrast(200%)');
    }

    if (!qrCode || !qrCode.data) {
        addLog('继续尝试灰度高阈值提纯识别。', 'WARN', 'QR');
        qrCode = tryDecode('grayscale(100%) contrast(300%) blur(4px)');
    }

    if (!qrCode || !qrCode.data) {
        throw new Error('未能识别，可能是由于二维码变形严重、过于模糊或中心遮挡面积超出了容错率。');
    }

    return qrCode.data;
}

function setStatus(text) {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = text;
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
        addLog('写入失败：未找到可用的特征值。', 'ERROR', 'BLE');
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
        addLog('写入异常: ' + (e.message || e), 'ERROR', 'BLE');
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
    addLog('GATT 连接已断开。', 'WARN', 'BLE');
    setStatus('蓝牙已断开');
    const btn = document.getElementById('btnBle');
    if (btn) {
        btn.innerHTML = '蓝牙断开';
        btn.disabled = false;
    }
    bleChar = null;
}

const textDecoder = new TextDecoder();

async function connectAndFlash() {
    const btn = document.getElementById('btnBle');

    if (!navigator.bluetooth) {
        alert("当前浏览器不支持 Web Bluetooth API，请使用 Chrome/Edge，并确保是 HTTPS 环境。");
        addLog('当前浏览器不支持 Web Bluetooth API。', 'ERROR', 'BLE');
        return;
    }

    btn.innerText = '正在连接...';
    btn.disabled = true;
    setStatus('正在选择设备');
    addLog('开始选择蓝牙设备。', 'INFO', 'BLE');

    try {
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'NRF' }],
            optionalServices: ['62750001-d828-918d-fb46-b6c11c675aec']
        });
        addLog(`设备已选择: ${bleDevice.name || '未知设备'}`, 'OK', 'BLE');

        if (!(bleDevice && bleDevice.name && bleDevice.name.startsWith('NRF'))) {
            alert('请连接 NRF 系列设备（设备名以 NRF 开头），当前设备不符合要求。');
            addLog('设备名称校验失败，流程中止。', 'WARN', 'BLE');
            btn.innerHTML = '蓝牙直刷';
            btn.disabled = false;
            return;
        }

        addLog(`会话参数: mtu=${mtuSize}, interleavedCount=${interleavedCount}`, 'INFO', 'BLE');

        try {
            bleDevice.addEventListener('gattserverdisconnected', handleGattDisconnected);
        } catch (e) {
            console.warn('无法注册断连事件', e);
        }

        setStatus('正在连接 GATT');
        let server = null;
        let connectError = null;
        for (let attempt = 0; attempt < 4; attempt++) {
            try {
                addLog(`连接 GATT 尝试 ${attempt + 1}/4`, 'INFO', 'BLE');
                server = await bleDevice.gatt.connect();
                if (server && server.connected) {
                    addLog('GATT 连接成功。', 'OK', 'BLE');
                    connectError = null;
                    break;
                }
            } catch (e) {
                connectError = e;
            }
            await new Promise(r => setTimeout(r, 400));
        }
        if (!server || !server.connected) {
            throw new Error(connectError && connectError.message ? connectError.message : '无法连接到 GATT Server，请重试连接');
        }

        const service = await server.getPrimaryService('62750001-d828-918d-fb46-b6c11c675aec');
        addLog('已发现 EPD Service。', 'OK', 'BLE');
        bleChar = await service.getCharacteristic('62750002-d828-918d-fb46-b6c11c675aec');
        addLog('已发现写入 Characteristic。', 'OK', 'BLE');

        try {
            await bleChar.startNotifications();
            addLog('通知已开启，开始监听 MTU。', 'OK', 'BLE');
            bleChar.addEventListener('characteristicvaluechanged', (event) => {
                try {
                    const msg = textDecoder.decode(event.target.value);
                    if (msg && msg.startsWith('mtu=')) {
                        const m = parseInt(msg.substring(4));
                        if (!isNaN(m) && m > 0) {
                            mtuSize = m;
                            addLog(`设备反馈：MTU 自动调整为 ${mtuSize}`, 'INFO', 'BLE');
                        }
                    }
                } catch (e) {
                    addLog(`通知解析失败: ${e.message || e}`, 'WARN', 'BLE');
                }
            });
        } catch (e) {
            addLog(`无法启用通知: ${e.message || e}`, 'WARN', 'BLE');
        }

        btn.innerText = '初始化设备...';
        setStatus('初始化设备');
        addLog('发送 INIT 指令 (0x01)。', 'INFO', 'BLE');
        await write(EpdCmd.INIT);
        await new Promise(r => setTimeout(r, 200));

        btn.innerText = '提取像素...';
        setStatus('生成图像数据');
        addLog('开始提取 Canvas 像素并转换。', 'INFO', 'IMG');
        await new Promise(r => setTimeout(r, 50));

        const { bwData, redData } = processCanvasToEink();
        addLog(`图像转换完成：黑白层 ${bwData.length}B，红色层 ${redData.length}B`, 'OK', 'IMG');

        await sendImageData(bwData, 'bw', btn);
        await sendImageData(redData, 'red', btn);

        btn.innerText = '刷新屏幕...';
        setStatus('刷新屏幕中');
        addLog('数据发送完成，触发 REFRESH (0x05)。', 'INFO', 'BLE');
        await write(EpdCmd.REFRESH);

        btn.innerText = '刷写成功！';
        setStatus('发送完成');
        addLog('刷写流程完成。', 'OK', 'BLE');

        setTimeout(() => {
            btn.innerHTML = '蓝牙直刷';
            btn.disabled = false;
        }, 4000);

    } catch (err) {
        console.error(err);
        addLog(`蓝牙刷写失败: ${err.message}`, 'ERROR', 'BLE');
        setStatus('失败');
        alert('蓝牙刷写中止或失败: ' + err.message);
        btn.innerHTML = '蓝牙直刷';
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

    addLog(`开始发送${type === 'bw' ? '黑白' : '红色'}层，总大小 ${data.length}B，分块 ${chunkSize}B`, 'INFO', 'TX');

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
            addLog(`数据块写入中断: ${e.message}`, 'ERROR', 'TX');
            throw e;
        }

        if (chunkIdx % 20 === 0 || i + chunkSize >= data.length) {
            const percent = Math.min(100, Math.floor(((i + chunk.length) / data.length) * 100));
            btn.innerText = `${type === 'bw' ? '黑白' : '红色'}数据 ${percent}%`;
        }

        chunkIdx++;
    }
    addLog(`${type === 'bw' ? '黑白' : '红色'}层发送完成，共 ${totalChunks} 包`, 'OK', 'TX');
}
