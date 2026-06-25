// Tiger FontSwap（通用版）— 本机 Figma 桌面版运行，把"延展帧"文字一键切到 苹方 / MiSans。
// 自动按帧名匹配延展帧（含"活动中心-1035x368"或"弹窗-900x1200"），按后缀判语言：-繁→HK、-EN→EN、否则简。
// 金属产品字（Roboto Condensed）永远不动。不硬编码字体名，运行时从本机/账号可用字体里解析真实 family。

const NS = 'fontswap';

// 是否为延展帧 + 语言判定
function laneOf(name) {
  if (!/(活动中心-1035x368|弹窗-900x1200)/.test(name)) return null;
  if (/-繁$/.test(name)) return 'HK';
  if (/-EN$/i.test(name)) return 'EN';
  return 'SC';
}

const KEEP = (fn) => /condensed/i.test(fn.style || '') || /condensed/i.test(fn.family || '');

function resolveFamily(logical, fams) {
  if (fams.indexOf(logical) >= 0) return logical;
  const RE = {
    'MiSans': [/^misans$/i, /^misans\b/i, /misans/i],
    'MiSans TC': [/^misans tc$/i, /misans\s*tc/i],
    'PingFang SC': [/^pingfang sc$/i, /pingfang\s*sc/i, /苹方[\s-]*简/],
    'PingFang HK': [/^pingfang hk$/i, /pingfang\s*hk/i, /苹方[\s-]*港/],
    'Roboto': [/^roboto$/i],
  }[logical] || [];
  for (const re of RE) { const hit = fams.find(f => re.test(f)); if (hit) return hit; }
  return null;
}

function familyForLogical(lang, mode) {
  if (lang === 'EN') return 'Roboto';                       // 英文恒 Roboto
  if (mode === 'MiSans') return lang === 'HK' ? 'MiSans TC' : 'MiSans';
  return lang === 'HK' ? 'PingFang HK' : 'PingFang SC';      // 苹方模式
}

function weightOf(style) {
  const s = (style || '').toLowerCase();
  if (/semib|demib|bold|black|heavy/.test(s)) return 'heavy';
  if (/medium/.test(s)) return 'medium';
  return 'regular';
}
function pickStyle(avail, want) {
  const order = {
    heavy: ['Semibold', 'SemiBold', 'Demibold', 'DemiBold', 'Bold', 'Heavy', 'Black', 'Medium', 'Regular', 'Normal'],
    medium: ['Medium', 'Semibold', 'SemiBold', 'Regular', 'Normal', 'Bold'],
    regular: ['Regular', 'Normal', 'Medium', 'Light'],
  }[want] || ['Regular'];
  for (const s of order) if (avail.indexOf(s) >= 0) return s;
  return avail[0];
}

async function getFontIndex() {
  const all = await figma.listAvailableFontsAsync();
  const fams = [], byFam = {};
  for (const f of all) { const fam = f.fontName.family; if (!byFam[fam]) { byFam[fam] = []; fams.push(fam); } byFam[fam].push(f.fontName.style); }
  return { fams, stylesOf: (fam) => byFam[fam] || [] };
}

async function diagnose() {
  const { fams } = await getFontIndex();
  const hits = fams.filter(f => /misans|pingfang|苹方/i.test(f));
  return { ok: true, msg: '可用相关字体: ' + (hits.join(' | ') || '无') + '　｜总族数' + fams.length };
}

async function applyMode(mode) {
  try {
    if (figma.loadAllPagesAsync) { try { await figma.loadAllPagesAsync(); } catch (e) {} }
    const idx = await getFontIndex();
    const need = mode === 'MiSans' ? ['MiSans', 'MiSans TC'] : ['PingFang SC', 'PingFang HK', 'Roboto'];
    const resolved = {}, missing = [];
    for (const lg of need) { const r = resolveFamily(lg, idx.fams); if (r) resolved[lg] = r; else missing.push(lg); }
    if (missing.length) return { ok: false, msg: '缺字体: ' + missing.join(', ') + '。请本机安装或在 Figma 设置上传后重试。' };

    let changed = 0, frames = 0;
    for (const page of figma.root.children) {
      const hits = page.findAll(n => (n.type === 'FRAME' || n.type === 'COMPONENT') && laneOf(n.name));
      for (const frame of hits) {
        frames++;
        const lang = laneOf(frame.name);
        const fam = resolveFamily(familyForLogical(lang, mode), idx.fams);
        const avail = idx.stylesOf(fam);
        for (const t of frame.findAll(n => n.type === 'TEXT')) {
          for (const seg of t.getStyledTextSegments(['fontName'])) {
            if (KEEP(seg.fontName)) continue;
            const target = { family: fam, style: pickStyle(avail, weightOf(seg.fontName.style)) };
            if (seg.fontName.family === target.family && seg.fontName.style === target.style) continue;
            try { await figma.loadFontAsync(seg.fontName); } catch (e) {}
            await figma.loadFontAsync(target);
            t.setRangeFontName(seg.start, seg.end, target);
            changed++;
          }
        }
      }
    }
    try { figma.root.setSharedPluginData(NS, 'applied', mode); } catch (e) {}
    return { ok: true, msg: '✅ ' + mode + '：' + frames + ' 帧 / ' + changed + ' 段' };
  } catch (e) { return { ok: false, msg: '出错: ' + (e && e.message ? e.message : String(e)) }; }
}

figma.showUI(__html__, { width: 340, height: 260 });
let applied = '(未应用)'; try { applied = figma.root.getSharedPluginData(NS, 'applied') || '(未应用)'; } catch (e) {}
figma.ui.postMessage({ type: 'init', applied: applied });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'diagnose') { const r = await diagnose(); figma.ui.postMessage({ type: 'done', ok: r.ok, msg: r.msg }); return; }
  if (msg.type === 'apply') {
    const r = await applyMode(msg.mode);
    figma.ui.postMessage({ type: 'done', ok: r.ok, msg: r.msg });
    if (r.ok) { figma.notify(r.msg); setTimeout(() => figma.closePlugin(), 1200); }
    else figma.notify(r.msg, { error: true, timeout: 6000 });
  }
};
