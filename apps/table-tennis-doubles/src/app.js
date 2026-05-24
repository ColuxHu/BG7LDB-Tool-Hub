const STORAGE_KEY = 'table-tennis-doubles-state-v2';

const PHASE = Object.freeze({
  SETUP_SERVER: 'SETUP_SERVER',
  SETUP_RECEIVER: 'SETUP_RECEIVER',
  PLAYING: 'PLAYING',
  GAME_POINT_CONFIRM: 'GAME_POINT_CONFIRM',
  MATCH_FINISHED: 'MATCH_FINISHED'
});

const PLAYERS = ['A1', 'A2', 'B1', 'B2'];
const DEFAULT_TEAM_NAMES = Object.freeze({ A: '甲队', B: '乙队' });
const SET_NAMES = ['零', '一', '二', '三', '四', '五', '六', '七'];
const SCORING_RULES = Object.freeze({
  11: { deuceScore: 10, serveBlockSize: 2, decidingEndsScore: 5, label: '11 分制' },
  21: { deuceScore: 20, serveBlockSize: 5, decidingEndsScore: 10, label: '旧 21 分制' }
});
const TEAM_COLOR_SCHEMES = Object.freeze({
  aurora: {
    label: { zh: '青色 vs 橙色', en: 'Cyan vs Orange' },
    A: { rgb: '34, 211, 238', soft: '8, 145, 178', text: '#A5F3FC', glow: '#22D3EE' },
    B: { rgb: '249, 115, 22', soft: '194, 65, 12', text: '#FED7AA', glow: '#FB923C' }
  },
  neon: {
    label: { zh: '黄色 vs 紫色', en: 'Yellow vs Purple' },
    A: { rgb: '250, 204, 21', soft: '202, 138, 4', text: '#FEF08A', glow: '#FACC15' },
    B: { rgb: '139, 92, 246', soft: '91, 33, 182', text: '#DDD6FE', glow: '#A78BFA' }
  },
  future: {
    label: { zh: '绿色 vs 粉色', en: 'Green vs Pink' },
    A: { rgb: '45, 212, 191', soft: '15, 118, 110', text: '#CCFBF1', glow: '#5EEAD4' },
    B: { rgb: '236, 72, 153', soft: '190, 24, 93', text: '#FBCFE8', glow: '#F472B6' }
  },
  clash: {
    label: { zh: '红色 vs 蓝色', en: 'Red vs Blue' },
    A: { rgb: '244, 63, 94', soft: '190, 18, 60', text: '#FFE4E6', glow: '#FB7185' },
    B: { rgb: '59, 130, 246', soft: '29, 78, 216', text: '#DBEAFE', glow: '#60A5FA' }
  },
  cobaltLime: {
    label: { zh: '蓝色 vs 绿色', en: 'Blue vs Green' },
    A: { rgb: '14, 165, 233', soft: '3, 105, 161', text: '#BAE6FD', glow: '#38BDF8' },
    B: { rgb: '132, 204, 22', soft: '77, 124, 15', text: '#D9F99D', glow: '#A3E635' }
  }
});
const DEFAULT_PREFERENCES = Object.freeze({
  colorScheme: 'aurora',
  serveHintMode: 'detailed',
  confirmSetEnabled: true,
  strictSafety: false,
  language: 'zh',
  teamNameCustomizedA: false,
  teamNameCustomizedB: false
});
const MAX_HISTORY_SIZE = 120;
const POST_SET_HISTORY_SIZE = 24;

const $ = id => document.getElementById(id);
const teamOf = id => id ? id[0] : null;
const partnerOf = id => id ? `${id[0]}${id[1] === '1' ? '2' : '1'}` : null;
const otherTeam = team => team === 'A' ? 'B' : 'A';

const LANG = Object.freeze({ ZH: 'zh', EN: 'en' });

const DEFAULT_TEAM_NAMES_BY_LANG = Object.freeze({
  zh: { A: '甲队', B: '乙队' },
  en: { A: 'Team A', B: 'Team B' }
});

function defaultTeamNames(lang) {
  return DEFAULT_TEAM_NAMES_BY_LANG[lang] || DEFAULT_TEAM_NAMES_BY_LANG[LANG.ZH];
}

function isDefaultTeamNameValue(team, name) {
  const normalized = String(name || '').trim();
  if (!normalized) return true;
  return normalized === DEFAULT_TEAM_NAMES_BY_LANG[LANG.ZH][team] || normalized === DEFAULT_TEAM_NAMES_BY_LANG[LANG.EN][team];
}

function normalizeDefaultTeamNamesForLanguage(draft) {
  const lang = draft.preferences?.language === LANG.EN ? LANG.EN : LANG.ZH;
  const defaults = defaultTeamNames(lang);
  ['A', 'B'].forEach(team => {
    const customizedKey = `teamNameCustomized${team}`;
    if (!draft.preferences?.[customizedKey] && isDefaultTeamNameValue(team, draft.teamNames?.[team])) {
      draft.teamNames[team] = defaults[team];
    }
  });
}

const I18N = Object.freeze({
  zh: {
    'app.title': '乒乓球双打辅助记分器',
    'label.bestOf': '{bestOf} 局 {wins} 胜',
    'label.targetScore': '{target} 分制',
    'label.pointsUnit': '分',

    'btn.help': '帮助',
    'btn.swap': '视觉换边',
    'btn.reset': '重置',
    'btn.quick': '快速设置',
    'btn.undo': '撤销',
    'btn.advanced': '高级设置',
    'btn.lock': '锁定',
    'btn.locked': '已锁定',

    'aria.bestOf': '切换局制',
    'aria.target': '切换 11 分制或旧 21 分制',
    'aria.help': '打开规则帮助',
    'aria.swap': '切换视觉场地',
    'aria.reset': '重置整场比赛',
    'aria.quick': '打开快速设置面板',
    'aria.undo': '撤销上一步操作',
    'aria.advanced': '打开高级设置',
    'aria.lock': '点击锁定',
    'aria.locked': '长按一点五秒解锁',
    'aria.addPoint': '{team} 得分，点击增加一分',
    'aria.addPointSr': '{team} 加一分',

    'status.setupServer': '请选择先发球员',
    'status.setupServerTeam': '请选择 {team} 的第一发球员',
    'status.setupReceiver': '请选择 {team} 的先接发球员',
    'status.gamePointConfirm': '本局结束，请确认结果',
    'status.matchFinished': '全场结束，{team} 获胜',
    'status.serving': '{server} 发球给 {receiver}',
    'status.servingDeuce': '{server} 发球给 {receiver}。平分追分，每分轮换',

    'setup.step1': '第 1 步：单击预选，双击确认先发球员',
    'setup.step1Team': '第 {set} 局：双击 {team} 第一发球员',
    'setup.step2': '第 2 步：单击预选，双击确认 {team} 接发球员',

    'tag.serve': '发球',
    'tag.serveCompact': '发',
    'tag.receive': '接发',
    'tag.receiveCompact': '接',
    'tag.selectedServer': '已选发',
    'tag.dblServe': '双击发球',
    'tag.dblReceive': '双击接发',
    'tag.dblConfirm': '再次双击确认',

    'history.ready': '历史记录就绪',
    'history.undoable': '可撤销 {n} 步',
    'lastPoint.scored': '{team} 刚刚得分',

    'modal.close': '关闭',
    'modal.cancel': '取消',
    'modal.save': '保存',
    'modal.ok': '确定',
    'modal.back': '返回',
    'modal.import': '导入',

    'help.title': '帮助',
    'help.howto': '程序使用方法',
    'help.rules': '权威规则引用',
    'help.close': '关闭',

    'quick.title': '快速设置',
    'quick.section.sets': '大比分设置',
    'quick.section.points': '小比分设置',
    'quick.section.serve': '发接发设置',
    'quick.label.sets': '大比分',
    'quick.label.points': '小比分',
    'quick.label.serverSide': '发球方',
    'quick.label.receiverSide': '接发方',
    'quick.label.currentServer': '当前发球员',
    'quick.label.currentReceiver': '当前接发员',

    'advanced.title': '高级设置',
    'advanced.section.basic': '基础设置',
    'advanced.section.prefs': '偏好设置',
    'advanced.teamNameA': '甲队队名',
    'advanced.teamNameB': '乙队队名',
    'advanced.playerName': '{id} 姓名',
    'advanced.colorScheme': '队伍颜色',
    'advanced.language': '语言',
    'advanced.export': '导出配置',
    'advanced.import': '导入配置',
    'advanced.reset': '重置配置',
    'advanced.clearCache': '清理本地缓存',
    'advanced.save': '保存',
    'advanced.cancel': '取消',

    'prefs.serveHint': '发接发提示',
    'prefs.serveHint.detailed': '详细',
    'prefs.serveHint.compact': '简洁',
    'prefs.confirmSet': '本局结束确认',
    'prefs.safety': '防误触强度',
    'prefs.safety.normal': '普通',
    'prefs.safety.strict': '严格',
    'prefs.tts': '语音播报',
    'prefs.keyboard': '键盘与外设映射',
    'toggle.on': '开启',
    'toggle.off': '关闭',
    'lang.zh': '中文',
    'lang.en': 'English',

    'alert.serverReceiverInvalid': '发球员和接发球员必须来自不同队伍。',
    'alert.importInvalid': '配置 JSON 无效，无法导入。',

    'confirm.resetMatch': '确认重置整场比赛？此操作会清除所有比赛进度，但会保留高级设置。',
    'confirm.resetMatchStrict': '严格防误触：再次确认重置整场比赛？',
    'confirm.clearCache1': '确认清理本地缓存并全部初始化应用？此操作会清除本地所有数据。',
    'confirm.clearCache2': '二次确认：此操作不可撤销，确定要继续吗？',
    'confirm.clearCacheStrict': '严格防误触：再次确认清理本地缓存并全部初始化？',
    'confirm.resetSettings': '确认重置队名、球员名和高级设置？',

    'announce.decidingSwap': '决胜局换边，请交换场地',
    'announce.setFinishedNeedConfirm': '本局结束，{team} 获胜，请确认',
    'announce.matchFinished': '全场结束，{team} 获胜',
    'announce.nextSetAutoStart': '已换边并自动开局。{server} 发球给 {receiver}',
    'announce.corrected': '已校正，比分回到 {a} 比 {b}',
    'announce.forcedServe': '已强制换发，{status}',
    'announce.quickApplied': '已应用快速设置，比分 {a} 比 {b}',
    'announce.undo': '已撤销，当前比分 {a} 比 {b}',

    'confirmSet.title': '本局结束',
    'confirmSet.desc': '{team} 获胜，当前小比分 {a} 比 {b}。',
    'confirmSet.undo': '撤销',
    'confirmSet.confirm': '确认',
    'import.title': '导入配置',
    'import.jsonLabel': '配置 JSON'
  },  en: {
    'app.title': 'Table Tennis Doubles Scoreboard',
    'label.bestOf': 'Best of {bestOf} ({wins} to win)',
    'label.targetScore': '{target}-point game',
    'label.pointsUnit': 'pts',

    'btn.help': 'Help',
    'btn.swap': 'Swap View',
    'btn.reset': 'Reset',
    'btn.quick': 'Quick Setup',
    'btn.undo': 'Undo',
    'btn.advanced': 'Advanced',
    'btn.lock': 'Lock',
    'btn.locked': 'Locked',

    'aria.bestOf': 'Change match format',
    'aria.target': 'Toggle 11-point / 21-point game',
    'aria.help': 'Open help',
    'aria.swap': 'Swap court view',
    'aria.reset': 'Reset match',
    'aria.quick': 'Open quick setup',
    'aria.undo': 'Undo last action',
    'aria.advanced': 'Open advanced settings',
    'aria.lock': 'Lock',
    'aria.locked': 'Hold 1.5s to unlock',
    'aria.addPoint': '{team} scores (+1)',
    'aria.addPointSr': 'Add one point for {team}',

    'status.setupServer': 'Select the first server',
    'status.setupServerTeam': 'Select {team}\'s first server',
    'status.setupReceiver': 'Select {team}\'s first receiver',
    'status.gamePointConfirm': 'Game finished. Please confirm.',
    'status.matchFinished': 'Match finished. {team} wins.',
    'status.serving': '{server} serves to {receiver}',
    'status.servingDeuce': '{server} serves to {receiver}. Deuce: rotate every point.',

    'setup.step1': 'Step 1: single tap to preview, double tap to confirm the first server',
    'setup.step1Team': 'Game {set}: double tap {team}\'s first server',
    'setup.step2': 'Step 2: single tap to preview, double tap to confirm {team} receiver',

    'tag.serve': 'Serve',
    'tag.serveCompact': 'S',
    'tag.receive': 'Receive',
    'tag.receiveCompact': 'R',
    'tag.selectedServer': 'Server selected',
    'tag.dblServe': 'Double tap to serve',
    'tag.dblReceive': 'Double tap to receive',
    'tag.dblConfirm': 'Double tap again to confirm',

    'history.ready': 'History ready',
    'history.undoable': '{n} undo available',
    'lastPoint.scored': '{team} scored just now',

    'modal.close': 'Close',
    'modal.cancel': 'Cancel',
    'modal.save': 'Save',
    'modal.ok': 'OK',
    'modal.back': 'Back',
    'modal.import': 'Import',

    'help.title': 'Help',
    'help.howto': 'How to use',
    'help.rules': 'Rules',
    'help.close': 'Close',

    'quick.title': 'Quick Setup',
    'quick.section.sets': 'Games won',
    'quick.section.points': 'Current game score',
    'quick.section.serve': 'Serve / receive',
    'quick.label.sets': 'Games',
    'quick.label.points': 'Points',
    'quick.label.serverSide': 'Server',
    'quick.label.receiverSide': 'Receiver',
    'quick.label.currentServer': 'Current server',
    'quick.label.currentReceiver': 'Current receiver',

    'advanced.title': 'Advanced Settings',
    'advanced.section.basic': 'Basics',
    'advanced.section.prefs': 'Preferences',
    'advanced.teamNameA': 'Team A name',
    'advanced.teamNameB': 'Team B name',
    'advanced.playerName': '{id} name',
    'advanced.colorScheme': 'Team colors',
    'advanced.language': 'Language',
    'advanced.export': 'Export',
    'advanced.import': 'Import',
    'advanced.reset': 'Reset',
    'advanced.clearCache': 'Clear local data',
    'advanced.save': 'Save',
    'advanced.cancel': 'Cancel',

    'prefs.serveHint': 'Serve hint',
    'prefs.serveHint.detailed': 'Detailed',
    'prefs.serveHint.compact': 'Compact',
    'prefs.confirmSet': 'Confirm game end',
    'prefs.safety': 'Safety',
    'prefs.safety.normal': 'Normal',
    'prefs.safety.strict': 'Strict',
    'prefs.tts': 'Voice announcements',
    'prefs.keyboard': 'Keyboard mapping',
    'toggle.on': 'On',
    'toggle.off': 'Off',
    'lang.zh': '中文',
    'lang.en': 'English',

    'alert.serverReceiverInvalid': 'Server and receiver must be on different teams.',
    'alert.importInvalid': 'Invalid JSON. Import failed.',

    'confirm.resetMatch': 'Reset the whole match? Progress will be cleared, while advanced settings are kept.',
    'confirm.resetMatchStrict': 'Strict safety: confirm reset again?',
    'confirm.clearCache1': 'Clear local data and fully reinitialize the app?',
    'confirm.clearCache2': 'Confirm again: this cannot be undone. Continue?',
    'confirm.clearCacheStrict': 'Strict safety: confirm clearing local data again?',
    'confirm.resetSettings': 'Reset names and advanced settings?',

    'announce.decidingSwap': 'Deciding game: please change ends.',
    'announce.setFinishedNeedConfirm': 'Game finished. {team} wins. Please confirm.',
    'announce.matchFinished': 'Match finished. {team} wins.',
    'announce.nextSetAutoStart': 'Ends changed and next game started. {server} serves to {receiver}',
    'announce.corrected': 'Corrected. Score back to {a} to {b}',
    'announce.forcedServe': 'Forced serve rotation. {status}',
    'announce.quickApplied': 'Quick setup applied. Score {a} to {b}',
    'announce.undo': 'Undone. Current score {a} to {b}',

    'confirmSet.title': 'Game finished',
    'confirmSet.desc': '{team} wins. Current game score {a} to {b}.',
    'confirmSet.undo': 'Undo',
    'confirmSet.confirm': 'Confirm',
    'import.title': 'Import settings',
    'import.jsonLabel': 'Settings JSON'
  }
});

function currentLanguage() {
  return state?.preferences?.language === LANG.EN ? LANG.EN : LANG.ZH;
}

function colorSchemeLabel(config, lang = currentLanguage()) {
  const label = config?.label;
  if (!label) return '';
  if (typeof label === 'string') return label;
  if (typeof label === 'object') return label?.[lang] || label?.[LANG.ZH] || Object.values(label)[0] || '';
  return String(label);
}

function t(key, vars = null) {
  const lang = currentLanguage();
  const raw = I18N?.[lang]?.[key] ?? I18N?.[LANG.ZH]?.[key] ?? key;
  if (!vars) return raw;
  return String(raw).replace(/\{(\w+)\}/g, (_, name) => {
    const value = vars[name];
    return value === undefined || value === null ? '' : String(value);
  });
}

function defaultState() {
  return {
    gamePhase: PHASE.SETUP_SERVER,
    isLocked: false,
    adminUnlockedUntil: null,
    targetScore: 11,
    bestOf: 5,
    currentSet: 1,
    scoreA: 0,
    scoreB: 0,
    setsA: 0,
    setsB: 0,
    teamNames: { ...DEFAULT_TEAM_NAMES },
    names: { A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2' },
    initialServerId: null,
    initialReceiverId: null,
    nextStartingServerTeam: null,
    forcedInitialReceiverId: null,
    serveState: {
      serverId: null,
      receiverId: null,
      serverTeam: null,
      receiverTeam: null,
      forcedServeOffset: 0
    },
    visualSwapped: false,
    decidingSideSwapped: false,
    history: [],
    lastPoint: null,
    lastPointAt: 0,
    accessibility: {
      ttsEnabled: false,
      keyboardControlEnabled: false
    },
    preferences: { ...DEFAULT_PREFERENCES }
  };
}

let state = loadState();
let modalType = null;
let previousFocus = null;
let armedPlayerId = null;
let lastPointTimer = null;
let adminTimer = null;
let lockTimer = null;
let lockStart = 0;
let suppressNextLockClick = false;
let unlockCompleted = false;
let layoutFrame = null;
let resizeObserver = null;

let pendingAutoReturnToken = 0;

let modalClickDelegationBound = false;

function normalizeState(input) {
  const base = defaultState();
  const merged = {
    ...base,
    ...input,
    teamNames: { ...base.teamNames, ...(input?.teamNames || {}) },
    names: { ...base.names, ...(input?.names || {}) },
    serveState: { ...base.serveState, ...(input?.serveState || {}) },
    accessibility: { ...base.accessibility, ...(input?.accessibility || {}) },
    preferences: { ...base.preferences, ...(input?.preferences || {}) },
    adminUnlockedUntil: null
  };

  if (!PLAYERS.includes(merged.initialServerId)) merged.initialServerId = null;
  if (!PLAYERS.includes(merged.initialReceiverId)) merged.initialReceiverId = null;
  if (!PLAYERS.includes(merged.forcedInitialReceiverId)) merged.forcedInitialReceiverId = null;
  if (!['A', 'B', null].includes(merged.nextStartingServerTeam)) merged.nextStartingServerTeam = null;
  if (![3, 5, 7].includes(merged.bestOf)) merged.bestOf = 5;
  if (!SCORING_RULES[merged.targetScore]) merged.targetScore = 11;
  if (!TEAM_COLOR_SCHEMES[merged.preferences.colorScheme]) merged.preferences.colorScheme = DEFAULT_PREFERENCES.colorScheme;
  if (!['compact', 'detailed'].includes(merged.preferences.serveHintMode)) merged.preferences.serveHintMode = DEFAULT_PREFERENCES.serveHintMode;
  if (!['zh', 'en'].includes(merged.preferences.language)) merged.preferences.language = DEFAULT_PREFERENCES.language;
  merged.preferences.teamNameCustomizedA = !isDefaultTeamNameValue('A', merged.teamNames?.A);
  merged.preferences.teamNameCustomizedB = !isDefaultTeamNameValue('B', merged.teamNames?.B);
  normalizeDefaultTeamNamesForLanguage(merged);
  merged.preferences.confirmSetEnabled = merged.preferences.confirmSetEnabled !== false;
  merged.preferences.strictSafety = merged.preferences.strictSafety === true;
  merged.currentSet = clampNumber(merged.currentSet, 1, merged.bestOf);
  merged.scoreA = Math.max(0, Number(merged.scoreA) || 0);
  merged.scoreB = Math.max(0, Number(merged.scoreB) || 0);
  merged.setsA = clampNumber(merged.setsA, 0, pointsToWinMatch(merged.bestOf));
  merged.setsB = clampNumber(merged.setsB, 0, pointsToWinMatch(merged.bestOf));
  merged.history = Array.isArray(merged.history) ? merged.history.slice(-MAX_HISTORY_SIZE) : [];
  migrateAutoStartState(merged);
  if (merged.gamePhase === PHASE.PLAYING && !merged.adminUnlockedUntil) {
    merged.isLocked = true;
  }
  return merged;
}

function migrateAutoStartState(draft) {
  const hasMatchProgress = draft.currentSet > 1 || draft.setsA > 0 || draft.setsB > 0;
  const hasForcedReceiver = PLAYERS.includes(draft.forcedInitialReceiverId);

  if (
    hasMatchProgress &&
    draft.gamePhase === PHASE.SETUP_SERVER &&
    ['A', 'B'].includes(draft.nextStartingServerTeam) &&
    hasForcedReceiver &&
    teamOf(draft.forcedInitialReceiverId) !== draft.nextStartingServerTeam
  ) {
    const nextServer = [
      draft.serveState?.serverId,
      draft.initialServerId,
      draft.initialReceiverId
    ].find(id => PLAYERS.includes(id) && teamOf(id) === draft.nextStartingServerTeam) || `${draft.nextStartingServerTeam}1`;

    draft.initialServerId = nextServer;
    draft.initialReceiverId = draft.forcedInitialReceiverId;
    draft.nextStartingServerTeam = null;
    draft.forcedInitialReceiverId = null;
    draft.gamePhase = PHASE.PLAYING;
    draft.serveState = {
      serverId: nextServer,
      receiverId: draft.initialReceiverId,
      serverTeam: teamOf(nextServer),
      receiverTeam: teamOf(draft.initialReceiverId),
      forcedServeOffset: 0
    };
  }

  if (
    draft.gamePhase === PHASE.PLAYING &&
    PLAYERS.includes(draft.initialServerId) &&
    PLAYERS.includes(draft.initialReceiverId) &&
    (!PLAYERS.includes(draft.serveState.serverId) || !PLAYERS.includes(draft.serveState.receiverId))
  ) {
    draft.serveState = {
      serverId: draft.initialServerId,
      receiverId: draft.initialReceiverId,
      serverTeam: teamOf(draft.initialServerId),
      receiverTeam: teamOf(draft.initialReceiverId),
      forcedServeOffset: Number(draft.serveState.forcedServeOffset) || 0
    };
  }
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || min));
}

function pointsToWinMatch(bestOf = state.bestOf) {
  return Math.ceil(bestOf / 2);
}

function scoringRule(targetScore = state.targetScore) {
  return SCORING_RULES[targetScore] || SCORING_RULES[11];
}

function selectedColorScheme() {
  return TEAM_COLOR_SCHEMES[state.preferences.colorScheme] || TEAM_COLOR_SCHEMES[DEFAULT_PREFERENCES.colorScheme];
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    // 淇濇姢锛氬巻鍙插揩鐓у湪鏃х増鏈腑鍙兘鑶ㄨ儉寰楅潪甯稿ぇ锛孞SON.parse 浼氶€犳垚鏄庢樉鍗￠】銆?
    // 姝ｅ父瀛樻。搴旇繙灏忎簬璇ラ槇鍊笺€?
    if (raw.length > 200_000) {
      localStorage.removeItem(STORAGE_KEY);
      return defaultState();
    }

    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return defaultState();
  }
}

function cloneSerializable(value) {
  return JSON.parse(JSON.stringify(value));
}

function snapshotForHistory() {
  // 鍏抽敭锛氬巻鍙插揩鐓т笉鑳藉寘鍚?history 鑷韩锛屽惁鍒欎細鍑虹幇浣撶Н閫掑锛堢敋鑷虫寚鏁板闀匡級锛?
  // 瀵艰嚧姣忔淇濆瓨/鎾ら攢閮藉嚭鐜版槑鏄惧崱椤裤€?
  return cloneSerializable({ ...state, history: [], adminUnlockedUntil: null });
}

function snapshotForStorage() {
  // 涓哄噺灏戣禌涓崱椤匡紝鎸佷箙鍖栨椂涓嶄繚瀛?history锛堟挙閿€鍘嗗彶浠呬繚鐣欏湪鍐呭瓨锛夈€?
  return cloneSerializable({ ...state, history: [], adminUnlockedUntil: null });
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshotForStorage()));
}

function pushHistory() {
  state.history.push(JSON.stringify(snapshotForHistory()));
  trimHistory(MAX_HISTORY_SIZE);
}

function trimHistory(limit = MAX_HISTORY_SIZE) {
  if (!Array.isArray(state.history)) state.history = [];
  if (state.history.length > limit) {
    state.history.splice(0, state.history.length - limit);
  }
}

function clearHistory() {
  state.history = [];
}

function lockLowFrequencyControls() {
  state.isLocked = true;
  state.adminUnlockedUntil = null;
}

function restoreFromHistory() {
  if (!state.history.length) return;
  const prev = JSON.parse(state.history.pop());
  const history = state.history;
  state = normalizeState({ ...prev, history });
  modalType && closeModal();
  saveState();
  render();
  speak(t('announce.undo', { a: state.scoreA, b: state.scoreB }));
}

function isAdminUnlocked() {
  return !state.isLocked || Boolean(state.adminUnlockedUntil && Date.now() < state.adminUnlockedUntil);
}

function isDeuce() {
  return state.scoreA >= scoringRule().deuceScore && state.scoreB >= scoringRule().deuceScore;
}

function serveBlockSize() {
  return isDeuce() ? 1 : scoringRule().serveBlockSize;
}

function setLabel() {
  if (currentLanguage() === LANG.EN) {
    const label = `Game ${state.currentSet}`;
    return isDeuce() ? `${label} · Deuce` : label;
  }
  const label = SET_NAMES[state.currentSet] ? `第${SET_NAMES[state.currentSet]}局` : `第${state.currentSet}局`;
  return isDeuce() ? `${label} · 平分` : label;
}

function displayName(id) {
  return id ? (state.names[id] || id) : '-';
}

function teamDisplayName(team) {
  const raw = state.teamNames?.[team];
  const normalized = String(raw || '').trim();
  if (normalized) return normalized;
  const fallback = defaultTeamNames(currentLanguage());
  return fallback?.[team] || DEFAULT_TEAM_NAMES[team] || (currentLanguage() === LANG.EN ? `Team ${team}` : `闃熶紞 ${team}`);
}

function canSelectPlayer(id) {
  if (!PLAYERS.includes(id)) return false;
  if (state.gamePhase === PHASE.SETUP_SERVER) {
    return !state.nextStartingServerTeam || teamOf(id) === state.nextStartingServerTeam;
  }
  if (state.gamePhase === PHASE.SETUP_RECEIVER) {
    return state.initialServerId && teamOf(id) !== teamOf(state.initialServerId);
  }
  return false;
}

function previewPlayer(id) {
  if (!canSelectPlayer(id)) return;
  armedPlayerId = id;
  render();
}

function selectPlayer(id) {
  if (!canSelectPlayer(id)) return;
  pushHistory();
  armedPlayerId = null;

  if (state.gamePhase === PHASE.SETUP_SERVER) {
    state.initialServerId = id;
    state.initialReceiverId = state.forcedInitialReceiverId;
    state.serveState = {
      ...state.serveState,
      serverId: id,
      receiverId: state.initialReceiverId,
      serverTeam: teamOf(id),
      receiverTeam: teamOf(state.initialReceiverId) || otherTeam(teamOf(id)),
      forcedServeOffset: 0
    };

    if (state.initialReceiverId) {
      state.nextStartingServerTeam = null;
      state.forcedInitialReceiverId = null;
      state.gamePhase = PHASE.PLAYING;
      lockLowFrequencyControls();
      updateServeState();
      speak(statusText());
    } else {
      state.gamePhase = PHASE.SETUP_RECEIVER;
    }
  } else if (state.gamePhase === PHASE.SETUP_RECEIVER) {
    state.initialReceiverId = id;
    state.nextStartingServerTeam = null;
    state.forcedInitialReceiverId = null;
    state.gamePhase = PHASE.PLAYING;
    lockLowFrequencyControls();
    updateServeState();
    speak(statusText());
  }

  saveState();
  render();
}

function serviceCycle() {
  const s = state.initialServerId;
  const r = state.initialReceiverId;
  if (!s || !r) return [];
  return [
    { serverId: s, receiverId: r },
    { serverId: r, receiverId: partnerOf(s) },
    { serverId: partnerOf(s), receiverId: partnerOf(r) },
    { serverId: partnerOf(r), receiverId: s }
  ];
}

function updateServeState() {
  const cycle = serviceCycle();
  if (!cycle.length) return;
  const total = state.scoreA + state.scoreB + Number(state.serveState.forcedServeOffset || 0);
  const normalizedTotal = Math.max(0, total);
  const rotation = Math.floor(normalizedTotal / serveBlockSize()) % 4;
  const pair = cycle[rotation];
  state.serveState = {
    ...state.serveState,
    serverId: pair.serverId,
    receiverId: pair.receiverId,
    serverTeam: teamOf(pair.serverId),
    receiverTeam: teamOf(pair.receiverId)
  };
}

function addScore(team) {
  if (state.gamePhase !== PHASE.PLAYING || modalType) return;
  pushHistory();
  const pointServer = state.serveState.serverId;
  const pointReceiver = state.serveState.receiverId;
  if (team === 'A') state.scoreA += 1;
  if (team === 'B') state.scoreB += 1;
  state.lastPoint = team;
  state.lastPointAt = Date.now();

  updateServeState();
  maybeApplyDecidingSideSwap(pointServer, pointReceiver);

  const winner = setWinner();
  if (winner) {
    state.gamePhase = PHASE.GAME_POINT_CONFIRM;
    if (!state.preferences.confirmSetEnabled) {
      confirmSet(winner, { recordHistory: false, closeDialog: false });
      return;
    }
    saveState();
    render();
    openGameConfirm(winner);
    speak(t('announce.setFinishedNeedConfirm', { team: teamDisplayName(winner) }));
    return;
  }

  saveState();
  render();
  speak(statusText());
}

function setWinner() {
  if (state.scoreA >= state.targetScore && state.scoreA - state.scoreB >= 2) return 'A';
  if (state.scoreB >= state.targetScore && state.scoreB - state.scoreA >= 2) return 'B';
  return null;
}

function maybeApplyDecidingSideSwap(pointServer = state.serveState.serverId, pointReceiver = state.serveState.receiverId) {
  const isFinalSet = state.currentSet === state.bestOf;
  const shouldSwap = isFinalSet && !state.decidingSideSwapped && Math.max(state.scoreA, state.scoreB) >= scoringRule().decidingEndsScore;
  if (!shouldSwap) return;

  const total = state.scoreA + state.scoreB;
  state.decidingSideSwapped = true;
  state.visualSwapped = !state.visualSwapped;

  if (pointServer && pointReceiver) {
    if (total % 2 === 1) {
      state.initialServerId = pointServer;
      state.initialReceiverId = partnerOf(pointReceiver);
    } else {
      state.initialServerId = pointReceiver;
      state.initialReceiverId = pointServer;
    }
    state.serveState.forcedServeOffset = -total;
    updateServeState();
  }

  speak(t('announce.decidingSwap'));
}

function prepareNextSetServeOrder(previousInitialServer, previousInitialReceiver) {
  const nextServer = PLAYERS.includes(previousInitialReceiver)
    ? previousInitialReceiver
    : `${otherTeam(teamOf(previousInitialServer) || 'B')}1`;
  const nextReceiver = PLAYERS.includes(previousInitialServer)
    ? previousInitialServer
    : `${otherTeam(teamOf(nextServer))}1`;

  state.nextStartingServerTeam = null;
  state.forcedInitialReceiverId = null;
  state.initialServerId = nextServer;
  state.initialReceiverId = nextReceiver;
  state.serveState = {
    serverId: nextServer,
    receiverId: nextReceiver,
    serverTeam: teamOf(nextServer),
    receiverTeam: teamOf(nextReceiver),
    forcedServeOffset: 0
  };
  updateServeState();
}

function confirmSet(winner, options = {}) {
  if (state.gamePhase !== PHASE.GAME_POINT_CONFIRM) return;
  const { recordHistory = true, closeDialog = true } = options;
  if (recordHistory) pushHistory();
  const previousInitialServer = state.initialServerId;
  const previousInitialReceiver = state.initialReceiverId;
  if (winner === 'A') state.setsA += 1;
  if (winner === 'B') state.setsB += 1;
  if (closeDialog) closeModal();

  if (state.setsA >= pointsToWinMatch() || state.setsB >= pointsToWinMatch()) {
    state.gamePhase = PHASE.MATCH_FINISHED;
    state.scoreA = 0;
    state.scoreB = 0;
    clearHistory();
    const token = ++pendingAutoReturnToken;
    const announcement = t('announce.matchFinished', { team: teamDisplayName(winner) });
    saveState();
    render();
    speak(announcement, {
      onEnd: () => {
        if (token !== pendingAutoReturnToken) return;
        if (state.gamePhase !== PHASE.MATCH_FINISHED) return;
        resetToOpeningSelection();
      }
    });
    return;
  } else {
    state.currentSet += 1;
    state.scoreA = 0;
    state.scoreB = 0;
    state.lastPoint = null;
    state.decidingSideSwapped = false;
    state.visualSwapped = !state.visualSwapped;
    prepareNextSetServeOrder(previousInitialServer, previousInitialReceiver);
    state.gamePhase = PHASE.PLAYING;
    lockLowFrequencyControls();
    trimHistory(POST_SET_HISTORY_SIZE);
    speak(t('announce.nextSetAutoStart', {
      server: displayName(state.serveState.serverId),
      receiver: displayName(state.serveState.receiverId)
    }));
  }

  saveState();
  render();
}

function resetToOpeningSelection() {
  const preserved = {
    teamNames: cloneSerializable(state.teamNames),
    names: cloneSerializable(state.names),
    accessibility: cloneSerializable(state.accessibility),
    preferences: cloneSerializable(state.preferences),
    bestOf: state.bestOf,
    targetScore: state.targetScore
  };

  state = defaultState();
  state.teamNames = preserved.teamNames;
  state.names = preserved.names;
  state.accessibility = preserved.accessibility;
  state.preferences = preserved.preferences;
  state.bestOf = preserved.bestOf;
  state.targetScore = preserved.targetScore;

  clearHistory();
  trimHistory(POST_SET_HISTORY_SIZE);
  saveState();
  render();
}

function cancelSetPoint() {
  closeModal();
  restoreFromHistory();
}

function cycleBestOf() {
  if (!isAdminUnlocked()) return;
  pushHistory();
  state.bestOf = state.bestOf === 3 ? 5 : state.bestOf === 5 ? 7 : 3;
  state.currentSet = Math.min(state.currentSet, state.bestOf);
  state.setsA = Math.min(state.setsA, pointsToWinMatch() - 1);
  state.setsB = Math.min(state.setsB, pointsToWinMatch() - 1);
  saveState();
  render();
}

function cycleTargetScore() {
  if (!isAdminUnlocked()) return;
  pushHistory();
  state.targetScore = state.targetScore === 11 ? 21 : 11;
  updateServeState();
  saveState();
  render();
}

function resetAll() {
  if (!isAdminUnlocked()) return;
  if (!window.confirm(t('confirm.resetMatch'))) return;
  if (state.preferences.strictSafety && !window.confirm(t('confirm.resetMatchStrict'))) return;
  // Preserve advanced settings
  const preserved = {
    teamNames: cloneSerializable(state.teamNames),
    names: cloneSerializable(state.names),
    accessibility: cloneSerializable(state.accessibility),
    preferences: cloneSerializable(state.preferences)
  };
  // Reset to defaults then restore advanced settings
  state = defaultState();
  state.teamNames = preserved.teamNames;
  state.names = preserved.names;
  state.accessibility = preserved.accessibility;
  state.preferences = preserved.preferences;
  clearHistory();
  trimHistory(POST_SET_HISTORY_SIZE);
  saveState();
  closeModal();
  render();
}

function quickAdjust(kind, delta) {
  pushHistory();
  if (kind === 'scoreA') state.scoreA = Math.max(0, state.scoreA + delta);
  if (kind === 'scoreB') state.scoreB = Math.max(0, state.scoreB + delta);
  if (kind === 'setsA') state.setsA = clampNumber(state.setsA + delta, 0, pointsToWinMatch() - 1);
  if (kind === 'setsB') state.setsB = clampNumber(state.setsB + delta, 0, pointsToWinMatch() - 1);
  if (state.gamePhase === PHASE.GAME_POINT_CONFIRM) state.gamePhase = PHASE.PLAYING;
  if (state.gamePhase === PHASE.MATCH_FINISHED) state.gamePhase = PHASE.PLAYING;
  updateServeState();
  saveState();
  render();
  speak(t('announce.corrected', { a: state.scoreA, b: state.scoreB }));
}

function applyQuickSet() {
  const scoreA = clampNumber($('quickScoreA')?.value, 0, 999);
  const scoreB = clampNumber($('quickScoreB')?.value, 0, 999);
  const setsA = clampNumber($('quickSetsA')?.value, 0, pointsToWinMatch());
  const setsB = clampNumber($('quickSetsB')?.value, 0, pointsToWinMatch());
  const server = $('quickServer')?.value;
  const receiver = $('quickReceiver')?.value;

  if (!PLAYERS.includes(server) || !PLAYERS.includes(receiver) || teamOf(server) === teamOf(receiver)) {
    window.alert?.(t('alert.serverReceiverInvalid'));
    return;
  }

  pushHistory();
  state.scoreA = scoreA;
  state.scoreB = scoreB;
  state.setsA = setsA;
  state.setsB = setsB;
  state.initialServerId = server;
  state.initialReceiverId = receiver;
  state.nextStartingServerTeam = null;
  state.forcedInitialReceiverId = null;
  state.decidingSideSwapped = false;
  state.lastPoint = null;
  state.serveState = {
    serverId: server,
    receiverId: receiver,
    serverTeam: teamOf(server),
    receiverTeam: teamOf(receiver),
    forcedServeOffset: -(scoreA + scoreB)
  };

  const winner = setWinner();
  if (state.setsA >= pointsToWinMatch() || state.setsB >= pointsToWinMatch()) {
    state.gamePhase = PHASE.MATCH_FINISHED;
  } else if (winner) {
    state.gamePhase = PHASE.GAME_POINT_CONFIRM;
  } else {
    state.gamePhase = PHASE.PLAYING;
    lockLowFrequencyControls();
    updateServeState();
  }

  saveState();
  closeModal();
  render();
  if (winner && state.gamePhase === PHASE.GAME_POINT_CONFIRM) openGameConfirm(winner);
  speak(t('announce.quickApplied', { a: state.scoreA, b: state.scoreB }));
}

function forceServe() {
  if (!state.initialServerId || !state.initialReceiverId) return;
  pushHistory();
  state.serveState.forcedServeOffset = Number(state.serveState.forcedServeOffset || 0) + serveBlockSize();
  updateServeState();
  saveState();
  render();
  speak(t('announce.forcedServe', { status: statusText() }));
}

function clearCache() {
  if (!window.confirm(t('confirm.clearCache1'))) return;
  if (!window.confirm(t('confirm.clearCache2'))) return;
  if (state.preferences.strictSafety && !window.confirm(t('confirm.clearCacheStrict'))) return;
  localStorage.removeItem(STORAGE_KEY);
  if ('caches' in window) caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
  state = defaultState();
  clearHistory();
  closeModal();
  render();
}

function statusText() {
  if (state.gamePhase === PHASE.SETUP_SERVER) {
    return state.nextStartingServerTeam
      ? t('status.setupServerTeam', { team: teamDisplayName(state.nextStartingServerTeam) })
      : t('status.setupServer');
  }
  if (state.gamePhase === PHASE.SETUP_RECEIVER) {
    return t('status.setupReceiver', { team: teamDisplayName(otherTeam(teamOf(state.initialServerId))) });
  }
  if (state.gamePhase === PHASE.GAME_POINT_CONFIRM) return t('status.gamePointConfirm');
  if (state.gamePhase === PHASE.MATCH_FINISHED) {
    return t('status.matchFinished', { team: teamDisplayName(state.setsA > state.setsB ? 'A' : 'B') });
  }
  const base = t('status.serving', {
    server: displayName(state.serveState.serverId),
    receiver: displayName(state.serveState.receiverId)
  });
  return isDeuce()
    ? t('status.servingDeuce', { server: displayName(state.serveState.serverId), receiver: displayName(state.serveState.receiverId) })
    : base;
}

function courtGeometry() {
  const court = $('court')?.getBoundingClientRect?.();
  const table = $('tableSurface')?.getBoundingClientRect?.();
  const fallback = {
    size: 64,
    positions: {
      top: { left: [36, 9], right: [64, 9] },
      bottom: { left: [36, 91], right: [64, 91] }
    }
  };
  if (!court || !table || !court.width || !court.height || !table.width || !table.height) return fallback;

  const tableLeft = table.left - court.left;
  const tableTop = table.top - court.top;
  const topGap = Math.max(0, tableTop);
  const bottomGap = Math.max(0, court.height - (tableTop + table.height));
  const playerSize = Math.max(40, Math.min(topGap, bottomGap) * 0.8);
  const leftX = (tableLeft / court.width) * 100;
  const rightX = ((tableLeft + table.width) / court.width) * 100;
  const topY = ((topGap / 2) / court.height) * 100;
  const bottomY = ((tableTop + table.height + bottomGap / 2) / court.height) * 100;

  return {
    size: playerSize,
    positions: {
      top: { left: [leftX, topY], right: [rightX, topY] },
      bottom: { left: [leftX, bottomY], right: [rightX, bottomY] }
    }
  };
}

function courtPositions(geometry = courtGeometry()) {
  const server = state.serveState.serverId || state.initialServerId || 'A1';
  const receiver = state.serveState.receiverId || (teamOf(server) === 'A' ? 'B1' : 'A1');
  const bottomTeam = state.visualSwapped ? 'B' : 'A';
  const topTeam = otherTeam(bottomTeam);
  const sideByTeam = {
    [bottomTeam]: {
      right: geometry.positions.bottom.right,
      left: geometry.positions.bottom.left
    },
    [topTeam]: {
      right: geometry.positions.top.left,
      left: geometry.positions.top.right
    }
  };
  const positions = {};

  ['A', 'B'].forEach(team => {
    positions[`${team}1`] = sideByTeam[team].right;
    positions[`${team}2`] = sideByTeam[team].left;
  });

  if (PLAYERS.includes(server) && sideByTeam[teamOf(server)]) {
    positions[server] = sideByTeam[teamOf(server)].right;
    positions[partnerOf(server)] = sideByTeam[teamOf(server)].left;
  }

  if (PLAYERS.includes(receiver) && sideByTeam[teamOf(receiver)] && teamOf(receiver) !== teamOf(server)) {
    positions[receiver] = sideByTeam[teamOf(receiver)].right;
    positions[partnerOf(receiver)] = sideByTeam[teamOf(receiver)].left;
  }

  return positions;
}

function render() {
  const adminOpen = isAdminUnlocked();
  const lang = currentLanguage();
  document.documentElement.lang = lang === LANG.EN ? 'en' : 'zh-CN';
  document.title = t('app.title');
  applyPreferences();
  $('setsA').textContent = state.setsA;
  $('setsB').textContent = state.setsB;
  $('setLabel').textContent = setLabel();
  $('setLabel').classList.toggle('deuce', isDeuce());
  $('scoreA').textContent = state.scoreA;
  $('scoreB').textContent = state.scoreB;
  $('teamNameA').textContent = teamDisplayName('A');
  $('teamNameB').textContent = teamDisplayName('B');
  $('statusBanner').textContent = statusText();
  $('bestOfBtn').textContent = t('label.bestOf', { bestOf: state.bestOf, wins: pointsToWinMatch() });
  $('targetBtn').textContent = t('label.targetScore', { target: state.targetScore });
  $('bestOfBtn').setAttribute('aria-label', t('aria.bestOf'));
  $('targetBtn').setAttribute('aria-label', t('aria.target'));
  $('helpBtn').textContent = t('btn.help');
  $('swapBtn').textContent = t('btn.swap');
  $('resetBtn').textContent = t('btn.reset');
  $('quickBtn').textContent = t('btn.quick');
  $('undoBtn').textContent = t('btn.undo');
  $('advancedBtn').textContent = t('btn.advanced');
  $('helpBtn').setAttribute('aria-label', t('aria.help'));
  $('swapBtn').setAttribute('aria-label', t('aria.swap'));
  $('resetBtn').setAttribute('aria-label', t('aria.reset'));
  $('quickBtn').setAttribute('aria-label', t('aria.quick'));
  $('undoBtn').setAttribute('aria-label', t('aria.undo'));
  $('advancedBtn').setAttribute('aria-label', t('aria.advanced'));
  $('undoBtn').disabled = !state.history.length;
  $('addA').disabled = state.gamePhase !== PHASE.PLAYING || Boolean(modalType);
  $('addB').disabled = state.gamePhase !== PHASE.PLAYING || Boolean(modalType);
  $('addA').setAttribute('aria-label', t('aria.addPoint', { team: teamDisplayName('A') }));
  $('addB').setAttribute('aria-label', t('aria.addPoint', { team: teamDisplayName('B') }));
  $('addA')?.querySelector?.('.sr-only') && ($('addA').querySelector('.sr-only').textContent = t('aria.addPointSr', { team: teamDisplayName('A') }));
  $('addB')?.querySelector?.('.sr-only') && ($('addB').querySelector('.sr-only').textContent = t('aria.addPointSr', { team: teamDisplayName('B') }));
  if ($('pointsUnitA')) $('pointsUnitA').textContent = t('label.pointsUnit');
  if ($('pointsUnitB')) $('pointsUnitB').textContent = t('label.pointsUnit');
  $('quickBtn').disabled = state.gamePhase === PHASE.MATCH_FINISHED && !adminOpen;
  $('resetBtn').disabled = !adminOpen;
  $('advancedBtn').disabled = !adminOpen;
  $('bestOfBtn').disabled = !adminOpen;
  $('targetBtn').disabled = !adminOpen;
  $('lockBtn').textContent = state.isLocked ? t('btn.locked') : t('btn.lock');
  $('lockBtn').classList.toggle('locked', state.isLocked);
  $('lockBtn').setAttribute('aria-label', state.isLocked ? t('aria.locked') : t('aria.lock'));
  $('lockProgress').parentElement.classList.toggle('show', state.isLocked);
  if (!state.isLocked) $('lockProgress').style.width = '0%';
  $('protectedTopLeft').classList.toggle('protected', state.isLocked && !adminOpen);
  $('protectedBottomLeft').classList.toggle('protected', state.isLocked && !adminOpen);
  $('historyHint').textContent = state.history.length
    ? t('history.undoable', { n: state.history.length })
    : t('history.ready');
  renderLastPoint();
  renderSetupGuide();
  renderPlayers();
  updateServeLine();
  scheduleAdminExpiry();
}

function applyPreferences() {
  const scheme = selectedColorScheme();
  const root = document.documentElement;
  ['A', 'B'].forEach(team => {
    const color = scheme[team];
    root.style.setProperty(`--team-${team.toLowerCase()}-rgb`, color.rgb);
    root.style.setProperty(`--team-${team.toLowerCase()}-soft-rgb`, color.soft);
    root.style.setProperty(`--team-${team.toLowerCase()}-text`, color.text);
    root.style.setProperty(`--team-${team.toLowerCase()}-glow`, color.glow);
  });
}

function renderSetupGuide() {
  const chip = $('setupChip');
  const show = state.gamePhase === PHASE.SETUP_SERVER || state.gamePhase === PHASE.SETUP_RECEIVER;
  chip.classList.toggle('show', show);
  if (!show) return;
  chip.textContent = state.gamePhase === PHASE.SETUP_SERVER
    ? (state.nextStartingServerTeam
      ? t('setup.step1Team', { set: state.currentSet, team: teamDisplayName(state.nextStartingServerTeam) })
      : t('setup.step1'))
    : t('setup.step2', { team: teamDisplayName(otherTeam(teamOf(state.initialServerId))) });
}

function renderPlayers() {
  const geometry = courtGeometry();
  const positions = courtPositions(geometry);
  $('court').style.setProperty('--player-size', `${geometry.size}px`);
  PLAYERS.forEach(id => {
    const el = $(`p${id}`);
    const pos = positions[id] || [50, 50];
    const tag = el.querySelector('small');
    el.style.left = `${pos[0]}%`;
    el.style.top = `${pos[1]}%`;
    el.querySelector('span').textContent = displayName(id);
    el.classList.remove('team-a', 'team-b', 'server', 'receiver', 'dim', 'selectable', 'pending-server', 'armed');
    el.classList.add(teamOf(id) === 'A' ? 'team-a' : 'team-b');

    const selectable = canSelectPlayer(id);
    if (id === state.serveState.serverId) {
      el.classList.add('server');
      tag.textContent = state.preferences.serveHintMode === 'compact' ? t('tag.serveCompact') : t('tag.serve');
    } else if (id === state.serveState.receiverId) {
      el.classList.add('receiver');
      tag.textContent = state.preferences.serveHintMode === 'compact' ? t('tag.receiveCompact') : t('tag.receive');
    } else {
      el.classList.add('dim');
      tag.textContent = teamDisplayName(teamOf(id));
    }

    if (state.gamePhase === PHASE.SETUP_RECEIVER && id === state.initialServerId) {
      el.classList.add('pending-server');
      tag.textContent = t('tag.selectedServer');
    } else if (selectable) {
      el.classList.add('selectable');
      tag.textContent = state.gamePhase === PHASE.SETUP_SERVER ? t('tag.dblServe') : t('tag.dblReceive');
    }
    if (selectable && id === armedPlayerId) {
      el.classList.add('armed');
      tag.textContent = t('tag.dblConfirm');
    }

    el.disabled = !selectable;
    el.setAttribute('aria-label', `${displayName(id)} ${tag.textContent}`);
  });
}

function updateServeLine() {
  const line = $('serveLine');
  if (state.gamePhase !== PHASE.PLAYING || !state.serveState.serverId || !state.serveState.receiverId) {
    line.setAttribute('opacity', '0');
    return;
  }
  const court = $('court').getBoundingClientRect();
  const from = $(`p${state.serveState.serverId}`).getBoundingClientRect();
  const to = $(`p${state.serveState.receiverId}`).getBoundingClientRect();
  line.setAttribute('x1', from.left + from.width / 2 - court.left);
  line.setAttribute('y1', from.top + from.height / 2 - court.top);
  line.setAttribute('x2', to.left + to.width / 2 - court.left);
  line.setAttribute('y2', to.top + to.height / 2 - court.top);
  line.setAttribute('opacity', '.95');
}

function renderLastPoint() {
  ['A', 'B'].forEach(team => {
    const el = $(`last${team}`);
    const show = state.lastPoint === team && Date.now() - state.lastPointAt < 3000;
    el.textContent = t('lastPoint.scored', { team: teamDisplayName(team) });
    el.classList.toggle('show', show);
  });
  clearTimeout(lastPointTimer);
  if (state.lastPoint && Date.now() - state.lastPointAt < 3000) {
    lastPointTimer = setTimeout(render, 3100 - (Date.now() - state.lastPointAt));
  }
}

function openModal(type, html) {
  modalType = type;
  previousFocus = document.activeElement;
  $('modal').innerHTML = html;
  $('modal').setAttribute('data-modal-type', String(type || ''));
  $('modalBackdrop').classList.add('open');
  render();
  bindModalActionDelegation();
  requestAnimationFrame(() => {
    const first = $('modal').querySelector('button, input, select, [tabindex]:not([tabindex="-1"])');
    if (first) first.focus();
  });
}

function closeModal() {
  modalType = null;
  $('modalBackdrop').classList.remove('open');
  $('modal').innerHTML = '';
  $('modal').removeAttribute('data-modal-type');
  if (previousFocus && previousFocus.focus) previousFocus.focus();
  render();
}

function bindModalActionDelegation() {
  if (modalClickDelegationBound) return;
  modalClickDelegationBound = true;
  $('modal').addEventListener('click', event => {
    const target = event.target?.closest?.('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (!action) return;
    event.preventDefault();
    handleModalAction(action, target);
  });
}

function handleModalAction(action, element) {
  if (action === 'closeModal') {
    closeModal();
    return;
  }
  if (action === 'openAdvanced') {
    openAdvanced();
    return;
  }
  if (action === 'forceServe') {
    forceServe();
    return;
  }
  if (action === 'applyQuickSet') {
    applyQuickSet();
    return;
  }
  if (action === 'clearCache') {
    clearCache();
    return;
  }
  if (action === 'exportSettings') {
    exportSettings();
    return;
  }
  if (action === 'openImportSettings') {
    openImportSettings();
    return;
  }
  if (action === 'applyImportSettings') {
    applyImportSettings();
    return;
  }
  if (action === 'resetSettings') {
    resetSettings();
    return;
  }
  if (action === 'saveAdvanced') {
    saveAdvanced();
    return;
  }
  if (action === 'cancelSetPoint') {
    cancelSetPoint();
    return;
  }
  if (action === 'confirmSet') {
    const winner = element.dataset.winner;
    if (winner === 'A' || winner === 'B') confirmSet(winner);
    return;
  }
  if (action === 'quickAdjust') {
    const kind = element.dataset.kind;
    const delta = Number(element.dataset.delta);
    if (!kind || !Number.isFinite(delta)) return;
    quickAdjust(kind, delta);
    return;
  }
  if (action === 'quickFieldStep') {
    const target = element.dataset.target;
    const delta = Number(element.dataset.delta);
    if (!target || !Number.isFinite(delta)) return;
    adjustQuickField(target, delta);
    return;
  }
  if (action === 'switchHelpPage') {
    openHelp(element.dataset.page === 'rules' ? 'rules' : 'usage');
    return;
  }
}

function adjustQuickField(target, delta) {
  const input = $(target);
  if (!input) return;
  const min = Number(input.min || 0);
  const max = Number(input.max || 999);
  input.value = String(clampNumber(Number(input.value || 0) + delta, min, max));
}

function openHelp(page = 'usage') {
  const isEn = currentLanguage() === LANG.EN;
  const activePage = page === 'rules' ? 'rules' : 'usage';
  const tabUsage = isEn ? 'How to use' : '用法说明';
  const tabRules = isEn ? 'Rules' : '规则条款';
  const helpText = item => escapeHtml(isEn ? item.en : item.zh);

  const usage = [
    {
      zh: '整场比赛只在第一局开局时需要选人：单击球员可预选，双击确认第一发球员，随后双击确认对方第一接发球员。',
      en: 'At the start of the first game, single tap to preview a player, double tap to confirm the first server, then double tap to confirm the first receiver.'
    },
    {
      zh: '比赛中点击两侧 +1 记录得分，程序会自动计算当前发球员、接发员、换发、局间发接发顺序和决胜局换边。',
      en: 'During play, tap +1 on either side to score. The app automatically calculates the server, receiver, service rotation, between-game order, and the deciding-game change of ends.'
    },
    {
      zh: '本局达到胜局条件后会弹出确认框；确认后下一局会自动开局，无需再次选择球员。',
      en: 'When a game reaches its winning condition, a confirmation dialog appears. After confirmation, the next game starts automatically without selecting players again.'
    },
    {
      zh: '“快速设置”用于赛中校正大小比分和当前发接发；“撤销”可回退上一步；“视觉换边”只切换显示视角，不改变真实赛况。',
      en: 'Quick Setup corrects games won, current game score, and current serve/receive order. Undo reverts one step. Swap View only changes the visual perspective.'
    },
    {
      zh: '局制与分制默认不在赛中修改；确需调整时，可长按“锁定”临时解锁后操作。',
      en: 'Match format and target score are locked during play by default. Hold Lock to temporarily unlock them when adjustment is necessary.'
    },
    {
      zh: '“高级设置”用于低频配置：队名、球员名、颜色方案、提示强度、本局结束确认、防误触、辅助功能和配置导入导出。',
      en: 'Advanced Settings contains low-frequency options: team/player names, color scheme, hint style, game-end confirmation, safety, accessibility, and import/export.'
    }
  ];

  const rules = [
    {
      no: '2.11.1',
      zh: '一局应由先得 11 分的运动员或组合获胜；但双方均得 10 分时，应由随后先领先 2 分的一方获胜。',
      en: 'A game shall be won by the player or pair first scoring 11 points unless both players or pairs score 10 points, when the game shall be won by the first player or pair subsequently gaining a lead of 2 points.'
    },
    {
      no: '2.12.1',
      zh: '一场比赛应采用任意奇数局的赛制。',
      en: 'A match shall consist of the best of any odd number of games.'
    },
    {
      no: '2.13.3',
      zh: '每得 2 分后，接发球方成为发球方，依此类推至本局结束；但双方均得 10 分或实行轮换发球法时，发接发顺序不变，每名运动员每次只发 1 分。',
      en: 'After each 2 points have been scored the receiving player or pair shall become the serving player or pair and so on until the end of the game, unless both players or pairs score 10 points or the expedite system is in operation, when the sequences of serving and receiving shall be the same but each player shall serve for only 1 point in turn.'
    },
    {
      no: '2.13.4',
      zh: '双打每局中，有权首先发球的一方应选择由谁发球；在一场比赛的第一局中，接发球方应决定由谁首先接发球；在后续各局中，第一发球员选定后，第一接发员应为上一局向其发球的运动员。',
      en: 'In each game of a doubles match, the pair having the right to serve first shall choose which of them will do so and in the first game of a match the receiving pair shall decide which of them will receive first; in subsequent games of the match, the first server having been chosen, the first receiver shall be the player who served to him or her in the preceding game.'
    },
    {
      no: '2.13.5',
      zh: '双打中，每次换发时，上一接发员成为发球员，上一发球员的搭档成为接发员。',
      en: 'In doubles, at each change of service the previous receiver shall become the server and the partner of the previous server shall become the receiver.'
    },
    {
      no: '2.13.6',
      zh: '某局首先发球的运动员或组合，应在下一局首先接发球；在双打比赛的决胜局中，当一方先得 5 分时，下一次应接发球的一方应改变其接发顺序。',
      en: 'The player or pair serving first in a game shall receive first in the next game of the match and in the last possible game of a doubles match the pair due to receive next shall change their order of receiving when first one pair scores 5 points.'
    },
    {
      no: '2.13.7',
      zh: '某局从一端开始的运动员或组合，应在下一局从另一端开始；在一场比赛的决胜局中，当一方先得 5 分时，双方应交换方位。',
      en: 'The player or pair starting at one end in a game shall start at the other end in the next game of the match and in the last possible game of a match the players or pairs shall change ends when first one player or pair scores 5 points.'
    },
    {
      no: '2.14.1',
      zh: '若运动员发球或接发球次序错误，裁判员一经发现应中断比赛，并按比赛开始时确立的顺序，以及双打中该局有权首先发球一方选择的发球顺序，在已到达的比分下由应发球和应接发球的运动员继续比赛。',
      en: 'If a player serves or receives out of turn, play shall be interrupted by the umpire as soon as the error is discovered and shall resume with those players serving and receiving who should be server and receiver respectively at the score that has been reached, according to the sequence established at the beginning of the match and, in doubles, to the order of serving chosen by the pair having the right to serve first in the game during which the error is discovered.'
    },
    {
      no: '2.14.2',
      zh: '若运动员应换方位而未换，裁判员一经发现应中断比赛，并按比赛开始时确立的顺序，在已到达的比分下让运动员处于其应处的方位继续比赛。',
      en: 'If the players have not changed ends when they should have done so, play shall be interrupted by the umpire as soon as the error is discovered and shall resume with the players at the ends at which they should be at the score that has been reached, according to the sequence established at the beginning of the match.'
    },
    {
      no: '2.14.3',
      zh: '任何情况下，发现错误之前已得的所有分数均应计算。',
      en: 'In any circumstances, all points scored before the discovery of an error shall be reckoned.'
    }
  ];

  const body = activePage === 'rules'
    ? `<div class="help-rule-list">${rules.map(item => `<article class="help-rule"><h3>ITTF Statutes 2026 ${item.no}</h3><p>${helpText(item)}</p></article>`).join('')}</div>`
    : `<div class="help-usage-list">${usage.map(item => `<article class="help-usage"><p>${helpText(item)}</p></article>`).join('')}</div>`;

  openModal('help', `
    <h2 id="modalTitle">${t('help.title')}</h2>
    <div class="help-tabs" role="tablist" aria-label="${escapeHtml(t('help.title'))}">
      <button class="${activePage === 'usage' ? 'active' : ''}" role="tab" aria-selected="${activePage === 'usage'}" data-action="switchHelpPage" data-page="usage">${tabUsage}</button>
      <button class="${activePage === 'rules' ? 'active' : ''}" role="tab" aria-selected="${activePage === 'rules'}" data-action="switchHelpPage" data-page="rules">${tabRules}</button>
    </div>
    <div class="help-page">${body}</div>
    <div class="button-row"><button class="primary-btn" data-action="closeModal">${t('help.close')}</button></div>
  `);
}

function openQuick() {
  const quickServer = state.serveState.serverId || state.initialServerId || 'A1';
  const quickReceiver = state.serveState.receiverId || state.initialReceiverId || (teamOf(quickServer) === 'A' ? 'B1' : 'A1');
  openModal('quick', `
    <h2 id="modalTitle" class="quick-title">${t('quick.title')}</h2>
    <div class="quick-panel">
      <section class="quick-section" aria-label="${t('quick.section.sets')}">
        <div class="quick-score-label">
          <span>${escapeHtml(teamDisplayName('A'))}</span>
          <strong>${t('quick.label.sets')}</strong>
          <span>${escapeHtml(teamDisplayName('B'))}</span>
        </div>
        <div class="quick-score-row">
          <button data-action="quickFieldStep" data-target="quickSetsA" data-delta="-1" aria-label="${escapeHtml(teamDisplayName('A'))} ${t('quick.label.sets')} -1">-</button>
          <input id="quickSetsA" type="number" min="0" max="${pointsToWinMatch()}" value="${state.setsA}" aria-label="${escapeHtml(teamDisplayName('A'))} ${t('quick.label.sets')}">
          <button data-action="quickFieldStep" data-target="quickSetsA" data-delta="1" aria-label="${escapeHtml(teamDisplayName('A'))} ${t('quick.label.sets')} +1">+</button>
          <b>:</b>
          <button data-action="quickFieldStep" data-target="quickSetsB" data-delta="-1" aria-label="${escapeHtml(teamDisplayName('B'))} ${t('quick.label.sets')} -1">-</button>
          <input id="quickSetsB" type="number" min="0" max="${pointsToWinMatch()}" value="${state.setsB}" aria-label="${escapeHtml(teamDisplayName('B'))} ${t('quick.label.sets')}">
          <button data-action="quickFieldStep" data-target="quickSetsB" data-delta="1" aria-label="${escapeHtml(teamDisplayName('B'))} ${t('quick.label.sets')} +1">+</button>
        </div>
      </section>
      <section class="quick-section" aria-label="${t('quick.section.points')}">
        <div class="quick-score-label">
          <span>${escapeHtml(teamDisplayName('A'))}</span>
          <strong>${t('quick.label.points')}</strong>
          <span>${escapeHtml(teamDisplayName('B'))}</span>
        </div>
        <div class="quick-score-row">
          <button data-action="quickFieldStep" data-target="quickScoreA" data-delta="-1" aria-label="${escapeHtml(teamDisplayName('A'))} ${t('quick.label.points')} -1">-</button>
          <input id="quickScoreA" type="number" min="0" max="999" value="${state.scoreA}" aria-label="${escapeHtml(teamDisplayName('A'))} ${t('quick.label.points')}">
          <button data-action="quickFieldStep" data-target="quickScoreA" data-delta="1" aria-label="${escapeHtml(teamDisplayName('A'))} ${t('quick.label.points')} +1">+</button>
          <b>:</b>
          <button data-action="quickFieldStep" data-target="quickScoreB" data-delta="-1" aria-label="${escapeHtml(teamDisplayName('B'))} ${t('quick.label.points')} -1">-</button>
          <input id="quickScoreB" type="number" min="0" max="999" value="${state.scoreB}" aria-label="${escapeHtml(teamDisplayName('B'))} ${t('quick.label.points')}">
          <button data-action="quickFieldStep" data-target="quickScoreB" data-delta="1" aria-label="${escapeHtml(teamDisplayName('B'))} ${t('quick.label.points')} +1">+</button>
        </div>
      </section>
      <section class="quick-section quick-serve-section" aria-label="${t('quick.section.serve')}">
        <div class="quick-serve-label">
          <span>${t('quick.label.serverSide')}</span>
          <b>-></b>
          <span>${t('quick.label.receiverSide')}</span>
        </div>
        <div class="quick-serve-row">
          <select id="quickServer" aria-label="${t('quick.label.currentServer')}">${PLAYERS.map(id => `<option value="${id}" ${id === quickServer ? 'selected' : ''}>${displayName(id)}</option>`).join('')}</select>
          <b>-></b>
          <select id="quickReceiver" aria-label="${t('quick.label.currentReceiver')}">${PLAYERS.map(id => `<option value="${id}" ${id === quickReceiver ? 'selected' : ''}>${displayName(id)}</option>`).join('')}</select>
        </div>
      </section>
    </div>
    <div class="quick-actions">
      <button data-action="closeModal">${t('modal.cancel')}</button>
      <button class="primary-btn" data-action="applyQuickSet">${t('modal.ok')}</button>
    </div>
  `);
}

function openAdvanced() {
  if (!isAdminUnlocked()) return;
  const colorOptions = Object.entries(TEAM_COLOR_SCHEMES)
    .map(([value, config]) => `<option value="${value}" ${value === state.preferences.colorScheme ? 'selected' : ''}>${escapeHtml(colorSchemeLabel(config))}</option>`)
    .join('');
  const languageOptions = [
    { value: LANG.ZH, label: t('lang.zh') },
    { value: LANG.EN, label: t('lang.en') }
  ].map(opt => `<option value="${opt.value}" ${opt.value === currentLanguage() ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`).join('');
  openModal('advanced', `
    <h2 id="modalTitle" class="quick-title">${t('advanced.title')}</h2>
    <div class="quick-panel">
      <section class="quick-section" aria-label="${t('advanced.section.basic')}">
        <div class="adv-row">
          <label class="field">${t('advanced.teamNameA')}<input id="teamNameInputA" value="${escapeHtml(teamDisplayName('A'))}" maxlength="14"></label>
          <label class="field">${t('advanced.teamNameB')}<input id="teamNameInputB" value="${escapeHtml(teamDisplayName('B'))}" maxlength="14"></label>
        </div>
        <div class="adv-row">
          ${PLAYERS.filter(id => id.startsWith('A')).map(id => `<label class="field">${escapeHtml(t('advanced.playerName', { id }))}<input id="name${id}" value="${escapeHtml(displayName(id))}" maxlength="12"></label>`).join('')}
        </div>
        <div class="adv-row">
          ${PLAYERS.filter(id => id.startsWith('B')).map(id => `<label class="field">${escapeHtml(t('advanced.playerName', { id }))}<input id="name${id}" value="${escapeHtml(displayName(id))}" maxlength="12"></label>`).join('')}
        </div>
        <label class="field">${t('advanced.colorScheme')}<select id="colorSchemeSelect">${colorOptions}</select></label>
      </section>
      <section class="quick-section" aria-label="${t('advanced.section.prefs')}">
        <label class="field">${t('advanced.language')}<select id="languageSelect">${languageOptions}</select></label>
        <label class="field">${t('prefs.serveHint')}<select id="serveHintSelect"><option value="detailed" ${state.preferences.serveHintMode === 'detailed' ? 'selected' : ''}>${t('prefs.serveHint.detailed')}</option><option value="compact" ${state.preferences.serveHintMode === 'compact' ? 'selected' : ''}>${t('prefs.serveHint.compact')}</option></select></label>
        <label class="field">${t('prefs.confirmSet')}<select id="confirmSetSelect"><option value="true" ${state.preferences.confirmSetEnabled ? 'selected' : ''}>${t('toggle.on')}</option><option value="false" ${!state.preferences.confirmSetEnabled ? 'selected' : ''}>${t('toggle.off')}</option></select></label>
        <label class="field">${t('prefs.safety')}<select id="strictSafetySelect"><option value="false" ${!state.preferences.strictSafety ? 'selected' : ''}>${t('prefs.safety.normal')}</option><option value="true" ${state.preferences.strictSafety ? 'selected' : ''}>${t('prefs.safety.strict')}</option></select></label>
        <label class="field">${t('prefs.tts')}<select id="ttsSelect"><option value="false">${t('toggle.off')}</option><option value="true" ${state.accessibility.ttsEnabled ? 'selected' : ''}>${t('toggle.on')}</option></select></label>
        <label class="field">${t('prefs.keyboard')}<select id="keyboardSelect"><option value="false">${t('toggle.off')}</option><option value="true" ${state.accessibility.keyboardControlEnabled ? 'selected' : ''}>${t('toggle.on')}</option></select></label>
      </section>
    </div>
    <div class="button-rows">
      <div class="button-row">
        <button data-action="exportSettings">${t('advanced.export')}</button>
        <button data-action="openImportSettings">${t('advanced.import')}</button>
        <button data-action="resetSettings">${t('advanced.reset')}</button>
      </div>
      <div class="button-row">
        <button class="danger-btn" data-action="clearCache">${t('advanced.clearCache')}</button>
        <button data-action="closeModal">${t('advanced.cancel')}</button>
        <button class="primary-btn" data-action="saveAdvanced">${t('advanced.save')}</button>
      </div>
    </div>
  `);
}

function saveAdvanced() {
  pushHistory();

  const prevLanguage = currentLanguage();
  const nextLanguage = $('languageSelect')?.value === LANG.EN ? LANG.EN : LANG.ZH;
  const nextDefaults = defaultTeamNames(nextLanguage);
  const prevTeamNames = { ...state.teamNames };

  let nextTeamNameA = $('teamNameInputA')?.value.trim() || '';
  let nextTeamNameB = $('teamNameInputB')?.value.trim() || '';

  const userChangedA = nextTeamNameA !== String(prevTeamNames.A || '');
  const userChangedB = nextTeamNameB !== String(prevTeamNames.B || '');
  const wasCustomizedA = state.preferences.teamNameCustomizedA === true;
  const wasCustomizedB = state.preferences.teamNameCustomizedB === true;

  if (nextLanguage !== prevLanguage) {
    if (!wasCustomizedA && !userChangedA) nextTeamNameA = nextDefaults.A;
    if (!wasCustomizedB && !userChangedB) nextTeamNameB = nextDefaults.B;
  }

  if (!nextTeamNameA) nextTeamNameA = nextDefaults.A;
  if (!nextTeamNameB) nextTeamNameB = nextDefaults.B;

  state.teamNames = { A: nextTeamNameA, B: nextTeamNameB };
  PLAYERS.forEach(id => {
    const input = $(`name${id}`);
    state.names[id] = input?.value.trim() || id;
  });
  state.preferences.colorScheme = TEAM_COLOR_SCHEMES[$('colorSchemeSelect')?.value]
    ? $('colorSchemeSelect').value
    : DEFAULT_PREFERENCES.colorScheme;
  state.preferences.language = nextLanguage;
  state.preferences.teamNameCustomizedA = String(state.teamNames.A) !== nextDefaults.A;
  state.preferences.teamNameCustomizedB = String(state.teamNames.B) !== nextDefaults.B;
  state.preferences.serveHintMode = $('serveHintSelect')?.value === 'compact' ? 'compact' : 'detailed';
  state.preferences.confirmSetEnabled = $('confirmSetSelect')?.value !== 'false';
  state.preferences.strictSafety = $('strictSafetySelect')?.value === 'true';
  state.accessibility.ttsEnabled = $('ttsSelect')?.value === 'true';
  state.accessibility.keyboardControlEnabled = $('keyboardSelect')?.value === 'true';
  trimHistory(POST_SET_HISTORY_SIZE);
  saveState();
  closeModal();
}

function settingsPayload() {
  return {
    teamNames: cloneSerializable(state.teamNames),
    names: cloneSerializable(state.names),
    accessibility: cloneSerializable(state.accessibility),
    preferences: cloneSerializable(state.preferences)
  };
}

function applySettingsPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  const next = normalizeState({
    ...state,
    teamNames: payload.teamNames || state.teamNames,
    names: payload.names || state.names,
    accessibility: payload.accessibility || state.accessibility,
    preferences: payload.preferences || state.preferences
  });
  state.teamNames = next.teamNames;
  state.names = next.names;
  state.accessibility = next.accessibility;
  state.preferences = next.preferences;
  return true;
}

function exportSettings() {
  const data = JSON.stringify(settingsPayload(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'table-tennis-doubles-settings.json';
  link.click();
  URL.revokeObjectURL(url);
}

function openImportSettings() {
  openModal('import', `
    <h2 id="modalTitle">${t('import.title')}</h2>
    <label class="field">${t('import.jsonLabel')}<textarea id="settingsImportText" rows="9" spellcheck="false"></textarea></label>
    <div class="button-row">
      <button data-action="openAdvanced">${t('modal.back')}</button>
      <button class="primary-btn" data-action="applyImportSettings">${t('modal.import')}</button>
    </div>
  `);
}

function applyImportSettings() {
  try {
    const payload = JSON.parse($('settingsImportText')?.value || '');
    if (!applySettingsPayload(payload)) throw new Error('invalid payload');
    trimHistory(POST_SET_HISTORY_SIZE);
    saveState();
    closeModal();
    render();
  } catch {
    window.alert?.(t('alert.importInvalid'));
  }
}

function resetSettings() {
  if (!window.confirm(t('confirm.resetSettings'))) return;
  pushHistory();
  const base = defaultState();
  state.teamNames = base.teamNames;
  state.names = base.names;
  state.accessibility = base.accessibility;
  state.preferences = base.preferences;
  trimHistory(POST_SET_HISTORY_SIZE);
  saveState();
  closeModal();
  render();
}

function openGameConfirm(winner) {
  openModal('confirm', `
    <h2 id="modalTitle">${t('confirmSet.title')}</h2>
    <p>${escapeHtml(t('confirmSet.desc', { team: teamDisplayName(winner), a: state.scoreA, b: state.scoreB }))}</p>
    <div class="button-row">
      <button data-action="cancelSetPoint">${t('confirmSet.undo')}</button>
      <button class="primary-btn" data-action="confirmSet" data-winner="${winner}">${t('confirmSet.confirm')}</button>
    </div>
  `);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function lockTap(event) {
  event?.preventDefault?.();
  if (suppressNextLockClick) {
    suppressNextLockClick = false;
    return;
  }
  if (!state.isLocked) {
    state.isLocked = true;
    state.adminUnlockedUntil = null;
    saveState();
    render();
  }
}

function startUnlock(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  if (!state.isLocked) return;
  unlockCompleted = false;
  lockStart = Date.now();
  $('lockBtn')?.setPointerCapture?.(event?.pointerId);
  clearInterval(lockTimer);
  lockTimer = setInterval(() => {
    const pct = Math.min(100, ((Date.now() - lockStart) / 1500) * 100);
    $('lockProgress').style.width = `${pct}%`;
    if (pct >= 100) finishUnlock();
  }, 50);
}

function stopUnlock(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  clearInterval(lockTimer);
  if (event?.pointerId !== undefined) {
    $('lockBtn')?.releasePointerCapture?.(event.pointerId);
  }
  $('lockProgress').style.width = '0%';
}

function finishUnlock() {
  if (unlockCompleted) return;
  unlockCompleted = true;
  clearInterval(lockTimer);
  $('lockProgress').style.width = '0%';
  suppressNextLockClick = true;
  state.isLocked = false;
  state.adminUnlockedUntil = Date.now() + 15000;
  saveState();
  render();
}

function scheduleAdminExpiry() {
  clearTimeout(adminTimer);
  if (!state.adminUnlockedUntil || Date.now() >= state.adminUnlockedUntil) return;
  adminTimer = setTimeout(() => {
    state.adminUnlockedUntil = null;
    state.isLocked = true;
    saveState();
    render();
  }, state.adminUnlockedUntil - Date.now());
}

function speak(text, options = {}) {
  const onEnd = typeof options?.onEnd === 'function' ? options.onEnd : null;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    try {
      onEnd?.();
    } catch {
      // ignore
    }
  };

  if (!state.accessibility.ttsEnabled || modalType) {
    finish();
    return;
  }
  if (!('speechSynthesis' in window)) {
    finish();
    return;
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = currentLanguage() === LANG.EN ? 'en-US' : 'zh-CN';
  utter.onend = finish;
  utter.onerror = finish;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function handleKeys(event) {
  if (!state.accessibility.keyboardControlEnabled || modalType) return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
  if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') {
    event.preventDefault();
    addScore('A');
  }
  if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') {
    event.preventDefault();
    addScore('B');
  }
  if (event.code === 'Space') {
    event.preventDefault();
    restoreFromHistory();
  }
  if (event.key === 'l' || event.key === 'L') {
    event.preventDefault();
    lockTap();
  }
}

function trapFocus(event) {
  if (event.key !== 'Tab' || !modalType) return;
  const focusables = [...$('modal').querySelectorAll('button, input, select, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setViewportHeight() {
  const height = window.visualViewport?.height || window.innerHeight;
  if (height) document.documentElement.style.setProperty('--app-vh', `${height}px`);
}

function scheduleLayoutRender() {
  if (layoutFrame) cancelAnimationFrame(layoutFrame);
  setViewportHeight();
  layoutFrame = requestAnimationFrame(() => {
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = null;
      render();
    });
  });
}

function syncDisplayMode() {
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches
    || window.matchMedia?.('(display-mode: fullscreen)').matches
    || window.navigator?.standalone === true;
  document.body.classList.toggle('is-standalone', Boolean(standalone));
}

function observeLayoutTargets() {
  if (!('ResizeObserver' in window)) return;
  resizeObserver?.disconnect();
  resizeObserver = new ResizeObserver(scheduleLayoutRender);
  ['app', 'court', 'tableSurface'].forEach(id => {
    const target = $(id);
    if (target) resizeObserver.observe(target);
  });
}

function bindEvents() {
  $('addA').addEventListener('click', () => addScore('A'));
  $('addB').addEventListener('click', () => addScore('B'));
  $('undoBtn').addEventListener('click', restoreFromHistory);
  $('resetBtn').addEventListener('click', resetAll);
  $('quickBtn').addEventListener('click', openQuick);
  $('advancedBtn').addEventListener('click', openAdvanced);
  $('helpBtn').addEventListener('click', openHelp);
  $('swapBtn').addEventListener('click', () => {
    state.visualSwapped = !state.visualSwapped;
    saveState();
    render();
  });
  $('bestOfBtn').addEventListener('click', cycleBestOf);
  $('targetBtn').addEventListener('click', cycleTargetScore);
  $('lockBtn').addEventListener('click', lockTap);
  $('lockBtn').addEventListener('pointerdown', startUnlock, { passive: false });
  $('lockBtn').addEventListener('pointerup', stopUnlock, { passive: false });
  $('lockBtn').addEventListener('pointercancel', stopUnlock, { passive: false });
  $('lockBtn').addEventListener('pointerleave', stopUnlock, { passive: false });
  $('lockBtn').addEventListener('contextmenu', event => event.preventDefault());
  $('lockBtn').addEventListener('selectstart', event => event.preventDefault());
  $('lockBtn').addEventListener('dragstart', event => event.preventDefault());
  PLAYERS.forEach(id => {
    $(`p${id}`).addEventListener('click', () => previewPlayer(id));
    $(`p${id}`).addEventListener('dblclick', event => {
      event.preventDefault();
      selectPlayer(id);
    });
  });
  $('modalBackdrop').addEventListener('click', event => {
    if (event.target === $('modalBackdrop') && modalType !== 'confirm') closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalType && modalType !== 'confirm') closeModal();
    trapFocus(event);
    handleKeys(event);
  });
  window.addEventListener('resize', scheduleLayoutRender);
  window.addEventListener('orientationchange', scheduleLayoutRender);
  window.visualViewport?.addEventListener('resize', scheduleLayoutRender);
  window.visualViewport?.addEventListener('scroll', scheduleLayoutRender);
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', syncDisplayMode);
  window.matchMedia?.('(display-mode: fullscreen)').addEventListener?.('change', syncDisplayMode);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

setViewportHeight();
syncDisplayMode();
bindEvents();
observeLayoutTargets();
updateServeState();
saveState();
render();




