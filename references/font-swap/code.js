// Tiger FontSwap — 本机 Figma 桌面版执行。把延展帧文字切到 苹方 / MiSans。
// 关键：不硬编码字体名，运行时从本机可用字体表里【解析出真实 family 名】再加载。
// 金属标题 "iPhone 17 Pro Max*"(Roboto Condensed) 不动。

const NS = 'fontswap';

const FRAME_LANG = {
  '延展-活动中心-1035x368': 'SC',
  '延展-弹窗-900x1200': 'SC',
  '延展-活动中心-1035x368-繁': 'HK',
  '延展-弹窗-900x1200-繁': 'HK',
  '延展-活动中心-1035x368-EN': 'EN',
  '延展-弹窗-900x1200-EN': 'EN',
};

// 金属标题保护：family 是 "Roboto"、"Condensed" 在 style 里，所以要查 style
const KEEP = (fn) => /condensed/i.test(fn.style || '') || /condensed/i.test(fn.family || '');

// 逻辑字体 → 在本机字体表里模糊解析真实 family 名
function resolveFamily(logical, fams) {
  if (fams.indexOf(logical) >= 0) return logical;          // 完全匹配优先
  const RE = {
    'MiSans': [/^misans$/i, /^misans\b/i, /misans/i],
    'PingFang SC': [/^pingfang sc$/i, /pingfang\s*sc/i, /苹方[\s-]*简/],
    'PingFang HK': [/^pingfang hk$/i, /pingfang\s*hk/i, /苹方[\s-]*港/],
    'PingFang TC': [/^pingfang tc$/i, /pingfang\s*tc/i],
    'Roboto': [/^roboto$/i],
  }[logical] || [];
  for (const re of RE) { const hit = fams.find(f => re.test(f)); if (hit) return hit; }
  return null;
}

function familyForLogical(lang, mode) {
  if (mode === 'MiSans') return 'MiSans';
  if (lang === 'EN') return 'Roboto';
  return lang === 'HK' ? 'PingFang HK' : 'PingFang SC';
}

function weightOf(style) {
  const s = (style || '').toLowerCase();
  if (/semib|demib|bold|black|heavy/.test(s)) return 'heavy';
  if (/medium/.test(s)) return 'medium';
  return 'regular';
}
function pickStyle(avail, want) {
  const order = {
    heavy: ['Semibold', 'SemiBold', 'Semi Bold', 'Demibold', 'DemiBold', 'Bold', 'Heavy', 'Black', 'Medium', 'Regular', 'Normal'],
    medium: ['Medium', 'Semibold', 'SemiBold', 'Regular', 'Normal', 'Bold'],
    regular: ['Regular', 'Normal', 'Medium', 'Light'],
  }[want] || ['Regular'];
  for (const s of order) if (avail.indexOf(s) >= 0) return s;
  return avail[0];
}

async function getFontIndex() {
  const all = await figma.listAvailableFontsAsync();
  const fams = [];
  const byFam = {};
  for (const f of all) {
    const fam = f.fontName.family;
    if (!byFam[fam]) { byFam[fam] = []; fams.push(fam); }
    byFam[fam].push(f.fontName.style);
  }
  return { fams, stylesOf: (fam) => byFam[fam] || [] };
}

async function diagnose() {
  const { fams } = await getFontIndex();
  const hits = fams.filter(f => /misans|pingfang|苹方/i.test(f));
  return { ok: true, msg: '本机匹配字体(' + hits.length + '): ' + (hits.join(' | ') || '无 MiSans/苹方') + '　｜总族数' + fams.length };
}

async function applyMode(mode) {
  try {
    if (figma.loadAllPagesAsync) { try { await figma.loadAllPagesAsync(); } catch (e) {} }
    const idx = await getFontIndex();

    // 解析本次需要的真实 family
    const needLogical = mode === 'MiSans' ? ['MiSans'] : ['PingFang SC', 'PingFang HK', 'Roboto'];
    const resolved = {};
    const missing = [];
    for (const lg of needLogical) {
      const real = resolveFamily(lg, idx.fams);
      if (real) resolved[lg] = real; else missing.push(lg);
    }
    if (missing.length) {
      const hint = idx.fams.filter(f => /misans|pingfang|苹方/i.test(f)).join(' | ') || '（一个都没枚举到）';
      return { ok: false, msg: '本机找不到: ' + missing.join(', ') + '。已枚举到的相关字体: ' + hint };
    }

    let changed = 0, frames = 0;
    for (const page of figma.root.children) {
      const hitsF = page.children.filter(n => FRAME_LANG[n.name]);
      if (!hitsF.length) continue;
      for (const frame of hitsF) {
        frames++;
        const lang = FRAME_LANG[frame.name];
        const logical = familyForLogical(lang, mode);
        const realFam = resolved[logical] || resolveFamily(logical, idx.fams);
        const avail = idx.stylesOf(realFam);
        for (const t of frame.findAll(n => n.type === 'TEXT')) {
          if (/iphone/i.test(t.name)) continue; // 金属产品名 "iPhone 17 Pro Max*" 整体不动
          for (const seg of t.getStyledTextSegments(['fontName'])) {
            if (KEEP(seg.fontName)) continue;
            const target = { family: realFam, style: pickStyle(avail, weightOf(seg.fontName.style)) };
            if (seg.fontName.family === target.family && seg.fontName.style === target.style) continue;
            try { await figma.loadFontAsync(seg.fontName); } catch (e) {}
            await figma.loadFontAsync(target);
            t.setRangeFontName(seg.start, seg.end, target);
            changed++;
          }
        }
      }
    }
    figma.root.setSharedPluginData(NS, 'applied', mode);
    const used = Object.keys(resolved).map(k => k + '→' + resolved[k]).join(', ');
    return { ok: true, msg: '✅ ' + mode + '：' + frames + ' 帧 / ' + changed + ' 段（' + used + '）' };
  } catch (e) {
    return { ok: false, msg: '出错: ' + (e && e.message ? e.message : String(e)) };
  }
}

// 启动
let requested = 'PingFang', applied = '(未应用)';
try {
  requested = figma.root.getSharedPluginData(NS, 'mode') || 'PingFang';
  applied = figma.root.getSharedPluginData(NS, 'applied') || '(未应用)';
} catch (e) {}

figma.showUI(__html__, { width: 340, height: 280 });
figma.ui.postMessage({ type: 'init', requested: requested, applied: applied });

// 自动执行：Claude 直接把模式写在这个常量里（dev 插件每次运行都读最新磁盘代码，
// 不依赖云端同步）。设为 'MiSans' / 'PingFang' 则启动即执行；设为 '' 则只显示 UI 等手动。
const AUTORUN_MODE = 'MiSans';
(async () => {
  try { figma.root.setSharedPluginData(NS, 'lastlog', 'STARTED v3 mode=' + AUTORUN_MODE); } catch (e) {}
  if (AUTORUN_MODE) {
    const res = await applyMode(AUTORUN_MODE);
    try { figma.root.setSharedPluginData(NS, 'lastlog', (res.ok ? 'OK ' : 'ERR ') + res.msg); } catch (e) {}
    figma.ui.postMessage({ type: 'done', ok: res.ok, msg: res.msg });
    if (res.ok) { figma.notify(res.msg); setTimeout(() => figma.closePlugin(), 1500); }
    else figma.notify(res.msg, { error: true, timeout: 6000 });
  }
})();

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'diagnose') {
    const res = await diagnose();
    figma.ui.postMessage({ type: 'done', ok: res.ok, msg: res.msg });
    return;
  }
  if (msg.type === 'apply') {
    const res = await applyMode(msg.mode);
    figma.ui.postMessage({ type: 'done', ok: res.ok, msg: res.msg });
    if (res.ok) { figma.notify(res.msg); setTimeout(() => figma.closePlugin(), 1000); }
    else figma.notify(res.msg, { error: true, timeout: 6000 });
  }
};
