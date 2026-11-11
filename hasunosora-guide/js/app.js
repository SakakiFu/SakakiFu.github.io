/* 蓮ノ空 聖地巡禮指南：共用引擎
 * 使用方式（各頁 HTML）：initPage({ active: 'plus', data: sehasuPlusData })
 * 載入順序：資料檔 → app.js → YouTube iframe_api（app.js 必須先定義回呼）
 *
 * 播放設計：全頁只有「一個」固定在畫面底部的播放器（dock），
 * 點任何一集的時間碼都由它播放，所以邊滑動、邊切換集數都不會中斷。
 */

const NAV_ITEMS = [
  { key: 'plus',      href: 'index.html',     icon: 'fa-compass',          label: 'せーはす Plus 外景篇', short: 'Plus',  series: 'せーはす Plus',  script: 'js/data-sehasu-plus.js',  getData: () => typeof sehasuPlusData !== 'undefined' ? sehasuPlusData : null },
  { key: 'prayer',    href: 'prayer.html',    icon: 'fa-cake-candles',     label: '劇場版祈願 蓮ノ三連華篇', short: '三連華', series: '劇場版大賣祈願', script: 'js/data-movie-prayer.js', getData: () => typeof moviePrayerData !== 'undefined' ? moviePrayerData : null },
  { key: 'sehasu103', href: 'sehasu103.html', icon: 'fa-torii-gate',       label: 'せーはす 103 外景聖地篇', short: '103',   series: 'せーはす 103',   script: 'js/data-sehasu-103.js',   getData: () => typeof sehasu103Data !== 'undefined' ? sehasu103Data : null },
  { key: 'sehasu104', href: 'sehasu104.html', icon: 'fa-torii-gate',       label: 'せーはす 104 外景聖地篇', short: '104',   series: 'せーはす 104',   script: 'js/data-sehasu-104.js',   getData: () => typeof sehasu104Data !== 'undefined' ? sehasu104Data : null },
  { key: 'sehasu105', href: 'sehasu105.html', icon: 'fa-map-location-dot', label: 'せーはす 105 外景聖地篇', short: '105',   series: 'せーはす 105',   script: 'js/data-sehasu-105.js',   getData: () => typeof sehasu105Data !== 'undefined' ? sehasu105Data : null },
  { key: 'map',       href: 'map.html',       icon: 'fa-map',              label: '聖地美食巡禮地圖',       short: '地圖' }
];

const SERIES_META = NAV_ITEMS.filter(item => item.script);

const UNIT_FILTERS = [
  { id: 'all',         label: '全部 Unit / 成員', short: '全部', keywords: [] },
  { id: 'cerise',      label: 'スリーズブーケ',   short: 'スリーズブーケ', keywords: ['スリーズブーケ', '花束組', '楡井希実', '花宮初奈', '櫻井陽菜'] },
  { id: 'dollchestra', label: 'DOLLCHESTRA',      short: 'DOLLCHESTRA',    keywords: ['DOLLCHESTRA', '手風琴組', '野中ここな', '佐佐木琴子', '佐々木琴子', '葉山風花'] },
  { id: 'miracra',     label: 'みらくらぱーく！', short: 'みらくらぱーく！', keywords: ['みらくらぱーく', 'Mira-Cra Park', '公園組', '菅叶和', '月音こな', '来栖りん'] },
  { id: 'edelnote',    label: 'Edel Note',        short: 'Edel Note',      keywords: ['Edel Note', '三宅美羽', '進藤天音', '進藤あまね'] },
  { id: 'sanrenka',    label: '蓮ノ三連華',       short: '蓮ノ三連華',     keywords: ['三連華', '2年生'] }
];

const CAST_MEMBERS = [
  '楡井希実', '野中ここな', '花宮初奈', '佐佐木琴子', '菅叶和', '月音こな',
  '櫻井陽菜', '葉山風花', '来栖りん', '三宅美羽', '進藤天音'
];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const normalizeLocKey = value => String(value ?? '').trim().replace(/\s+/g, ' ');
const locKeyOf = loc => normalizeLocKey(loc?.mapQuery || loc?.name || '');

// "12:25" 或 "1:02:03" → 秒數（資料沒寫 sec 時自動換算）
const toSec = t => {
  if (typeof t === 'number' && !Number.isNaN(t)) return Math.max(0, Math.floor(t));
  const raw = String(t ?? '').trim().replace(/s$/i, '');
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) return Number(raw);
  return raw.split(':').map(Number).reduce((a, n) => a * 60 + (Number.isNaN(n) ? 0 : n), 0);
};
const secOf = t => t.sec ?? toSec(t.time);

/* ---------- Toast 通知 ---------- */
let toastEl = null, toastTimer = null;
function showToast(message) {
  if (typeof document === 'undefined') return;
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast-notice';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
}

/* ---------- 剪貼簿與 Deep Link 分享 ---------- */
function buildEpisodeShareUrl(ep, sec = null) {
  if (typeof location === 'undefined') return '';
  const seriesKey = ep?._seriesKey || currentPageKey || 'plus';
  const navItem = NAV_ITEMS.find(n => n.key === seriesKey);
  const targetPage = navItem && navItem.href !== 'map.html' ? navItem.href : location.pathname.split('/').pop() || 'index.html';
  const rawEpId = ep?._rawId || ep?.id || '';
  const url = new URL(targetPage, location.href);
  url.search = '';
  url.hash = '';
  if (rawEpId) url.searchParams.set('ep', rawEpId);
  if (sec !== null && sec !== undefined && Number(sec) > 0) {
    url.searchParams.set('t', String(Math.floor(Number(sec))));
  }
  return url.toString();
}

function buildMapShareUrl(locKey) {
  if (typeof location === 'undefined') return '';
  const url = new URL('map.html', location.href);
  url.search = '';
  url.hash = '';
  if (locKey) url.searchParams.set('loc', normalizeLocKey(locKey));
  return url.toString();
}

async function copyTextToClipboard(text, successMsg = '已複製連結！') {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    showToast(successMsg);
  } catch {
    showToast('複製失敗，請手動複製網址列');
  }
}

/* ---------- 巡禮清單 / 打卡紀錄 (localStorage + KML/GeoJSON 匯出) ---------- */
const PILGRIMAGE_STORAGE_KEY = 'hasunosora_pilgrimage_v1';

function readPilgrimageStamps() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(PILGRIMAGE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePilgrimageStamps(stamps) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PILGRIMAGE_STORAGE_KEY, JSON.stringify(stamps));
    }
  } catch {
    /* ignore storage quota / private mode errors */
  }
}

function getStamp(locKey) {
  const key = normalizeLocKey(locKey);
  if (!key) return null;
  const stamps = readPilgrimageStamps();
  return stamps[key] || null;
}

function getStampCounts(locationKeys = null) {
  const stamps = readPilgrimageStamps();
  const keys = locationKeys ? [...new Set(locationKeys.map(normalizeLocKey).filter(Boolean))] : Object.keys(stamps);
  let wish = 0, visited = 0;
  keys.forEach(k => {
    if (stamps[k] === 'wish') wish++;
    else if (stamps[k] === 'visited') visited++;
  });
  return { wish, visited, totalMarked: wish + visited };
}

function setStamp(locKey, targetStatus, locName = '') {
  const key = normalizeLocKey(locKey);
  if (!key) return null;
  const stamps = readPilgrimageStamps();
  const prev = stamps[key] || null;
  const next = prev === targetStatus ? null : targetStatus;
  if (next) stamps[key] = next;
  else delete stamps[key];
  writePilgrimageStamps(stamps);

  syncStampButtonsInDom(key, next);
  updatePilgrimageSummaryUI();
  if (typeof applyPageFilters === 'function' && currentPageData.length) {
    applyPageFilters({ updateUrl: false });
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pilgrimage:change', { detail: { key, status: next, name: locName } }));
  }

  const label = locName || key;
  if (next === 'wish') showToast(`⭐ 已加入「想去清單」：${label}`);
  else if (next === 'visited') showToast(`✅ 已打卡「已踩點」：${label}`);
  else showToast(`已取消標記：${label}`);
  return next;
}

function syncStampButtonsInDom(locKey, status) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-stamp-toggle]').forEach(btn => {
    if (normalizeLocKey(btn.dataset.locKey) !== locKey) return;
    const type = btn.dataset.stampToggle;
    const active = status === type;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  // 同步更新卡片上的 data-has-wish / data-has-visited
  document.querySelectorAll('.episode-card').forEach(card => {
    const ep = EPISODES[card.id];
    if (!ep) return;
    const locs = ep.locations || (ep.location ? [ep.location] : []);
    const hasWish = locs.some(l => getStamp(locKeyOf(l)) === 'wish');
    const hasVisited = locs.some(l => getStamp(locKeyOf(l)) === 'visited');
    card.dataset.hasWish = hasWish ? '1' : '0';
    card.dataset.hasVisited = hasVisited ? '1' : '0';
  });
}

function renderStampButtonsHtml(locKey, locName) {
  const key = normalizeLocKey(locKey);
  if (!key) return '';
  const currentStamp = getStamp(key);
  const wishActive = currentStamp === 'wish';
  const visitedActive = currentStamp === 'visited';
  return `
    <span class="stamp-group" role="group" aria-label="巡禮打卡標記">
      <button type="button" class="stamp-btn stamp-btn--wish${wishActive ? ' is-active' : ''}" data-stamp-toggle="wish" data-loc-key="${esc(key)}" data-loc-name="${esc(locName || key)}" aria-pressed="${wishActive}" title="標記為想去">
        <i class="fa-solid fa-star"></i> 想去
      </button>
      <button type="button" class="stamp-btn stamp-btn--visited${visitedActive ? ' is-active' : ''}" data-stamp-toggle="visited" data-loc-key="${esc(key)}" data-loc-name="${esc(locName || key)}" aria-pressed="${visitedActive}" title="標記為已踩點">
        <i class="fa-solid fa-check"></i> 已踩點
      </button>
    </span>`;
}

/* ---------- 動態載入全部系列與座標（供跨全系列搜尋與 KML/GeoJSON 匯出使用） ---------- */
const scriptPromises = {};
function loadScriptOnce(src) {
  if (scriptPromises[src]) return scriptPromises[src];
  scriptPromises[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
  return scriptPromises[src];
}

async function ensureAllDataLoaded() {
  const tasks = [];
  if (typeof mapLocationCoordinates === 'undefined') {
    tasks.push(loadScriptOnce('js/map-location-coordinates.js'));
  }
  SERIES_META.forEach(meta => {
    if (!meta.getData()) tasks.push(loadScriptOnce(meta.script));
  });
  if (tasks.length) await Promise.all(tasks);
  return SERIES_META.map(meta => ({
    key: meta.key,
    series: meta.series,
    href: meta.href,
    data: meta.getData() || []
  }));
}

function collectAllGeocodedLocations(seriesSets) {
  const coordList = typeof mapLocationCoordinates !== 'undefined' ? mapLocationCoordinates : [];
  const coordinates = new Map(coordList.map(entry => [normalizeLocKey(entry.key), entry]));
  const locations = new Map();

  seriesSets.forEach(({ key: seriesKey, series, href, data }) => {
    data.forEach(ep => {
      const epLocs = ep.locations || (ep.location ? [ep.location] : []);
      epLocs.forEach(location => {
        const key = locKeyOf(location);
        if (!key) return;
        const meta = coordinates.get(key);
        if (!meta) return;
        let entry = locations.get(key);
        if (!entry) {
          entry = {
            key,
            name: location.name,
            lat: meta.lat,
            lng: meta.lng,
            region: meta.region || 'other',
            approximate: !!meta.approximate,
            mapQuery: location.mapQuery || key,
            isRestaurant: !!meta.food,
            stamp: getStamp(key),
            episodes: []
          };
          locations.set(key, entry);
        } else {
          entry.stamp = getStamp(key);
        }
        if (ep.isRestaurant) entry.isRestaurant = true;
        if (!entry.episodes.some(item => item.seriesKey === seriesKey && item.ep.id === ep.id)) {
          entry.episodes.push({ ep, series, seriesKey, href, isRestaurant: !!ep.isRestaurant });
        }
      });
    });
  });

  return [...locations.values()];
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportPilgrimageData(format = 'kml', scope = 'saved') {
  try {
    const seriesSets = await ensureAllDataLoaded();
    const allLocations = collectAllGeocodedLocations(seriesSets);
    let targetLocations = scope === 'saved'
      ? allLocations.filter(loc => loc.stamp === 'wish' || loc.stamp === 'visited')
      : allLocations;

    let fallbackUsed = false;
    if (!targetLocations.length) {
      targetLocations = allLocations;
      fallbackUsed = true;
    }

    if (format === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        name: '蓮ノ空聖地巡禮與外景美食清單',
        features: targetLocations.map(loc => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [loc.lng, loc.lat]
          },
          properties: {
            key: loc.key,
            name: loc.name,
            status: loc.stamp || 'unmarked',
            statusLabel: loc.stamp === 'visited' ? '已踩點' : loc.stamp === 'wish' ? '想去' : '未標記',
            category: loc.isRestaurant ? 'food' : 'spot',
            region: loc.region,
            approximate: loc.approximate,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapQuery || loc.name)}`,
            episodes: loc.episodes.map(({ series, ep }) => ({
              series,
              epNum: ep.epNum,
              title: ep.title,
              cast: ep.cast || '',
              foods: ep.foods || [],
              youtubeUrl: ep.videoId ? `https://www.youtube.com/watch?v=${ep.videoId}` : null
            }))
          }
        }))
      };
      const suffix = fallbackUsed || scope === 'all' ? 'all' : 'mylist';
      downloadBlob(JSON.stringify(geojson, null, 2), `hasunosora-pilgrimage-${suffix}.geojson`, 'application/geo+json;charset=utf-8');
      showToast(fallbackUsed ? '尚未勾選地點，已為您匯出全部聖地 GeoJSON！' : `已匯出 ${targetLocations.length} 個聖地 GeoJSON！`);
      return;
    }

    // KML 2.2（可直接匯入 Google My Maps「我的地圖」）
    const buildPlacemark = loc => {
      const statusBadge = loc.stamp === 'visited' ? '✅ 已踩點' : loc.stamp === 'wish' ? '⭐ 想去清單' : '🌸 聖地巡禮點';
      const typeBadge = loc.isRestaurant ? '🍴 同款美食餐廳' : '📍 外景拍攝地';
      const styleId = loc.stamp === 'visited' ? 'styleVisited' : loc.stamp === 'wish' ? 'styleWish' : loc.isRestaurant ? 'styleFood' : 'styleSpot';
      const epLines = loc.episodes.map(({ series, ep }) => {
        const foods = (ep.foods || []).length ? `<br/>🍴 品項：${esc(ep.foods.join('、'))}` : '';
        const yt = ep.videoId ? ` (<a href="https://www.youtube.com/watch?v=${esc(ep.videoId)}">YouTube</a>)` : '';
        return `• <b>[${esc(series)} ${esc(ep.epNum)}]</b> ${esc(ep.title)}${yt}<br/>👥 出演：${esc(ep.cast || '')}${foods}`;
      }).join('<br/><br/>');
      const gmap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapQuery || loc.name)}`;
      const desc = `<![CDATA[
        <div><b>${statusBadge} ｜ ${typeBadge}</b>${loc.approximate ? '（約略位置）' : ''}</div>
        <div style="margin:6px 0;"><a href="${gmap}">在 Google Maps 搜尋此地點</a></div>
        <hr/>
        <div>${epLines}</div>
      ]]>`;
      return `
      <Placemark>
        <name>${esc(loc.name)}</name>
        <styleUrl>#${styleId}</styleUrl>
        <description>${desc}</description>
        <Point><coordinates>${loc.lng},${loc.lat},0</coordinates></Point>
      </Placemark>`;
    };

    const visitedLocs = targetLocations.filter(l => l.stamp === 'visited');
    const wishLocs = targetLocations.filter(l => l.stamp === 'wish');
    const otherLocs = targetLocations.filter(l => !l.stamp);

    const folders = [
      visitedLocs.length ? `<Folder><name>✅ 已踩點聖地 (${visitedLocs.length})</name>${visitedLocs.map(buildPlacemark).join('')}</Folder>` : '',
      wishLocs.length ? `<Folder><name>⭐ 想去清單 (${wishLocs.length})</name>${wishLocs.map(buildPlacemark).join('')}</Folder>` : '',
      otherLocs.length ? `<Folder><name>🌸 外景與美食聖地 (${otherLocs.length})</name>${otherLocs.map(buildPlacemark).join('')}</Folder>` : ''
    ].filter(Boolean).join('\n');

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>蓮ノ空聖地巡禮與外景美食指南</name>
    <description>由「蓮ノ空聖地巡禮與外景美食指南」匯出，可直接匯入 Google My Maps（我的地圖）。</description>
    <Style id="styleVisited">
      <IconStyle><color>ff34c759</color><scale>1.1</scale><Icon><href>https://maps.google.com/mapfiles/kml/paddle/grn-stars.png</href></Icon></IconStyle>
    </Style>
    <Style id="styleWish">
      <IconStyle><color>ff00b4ff</color><scale>1.1</scale><Icon><href>https://maps.google.com/mapfiles/kml/paddle/ylw-stars.png</href></Icon></IconStyle>
    </Style>
    <Style id="styleFood">
      <IconStyle><color>ff0098ff</color><scale>1.05</scale><Icon><href>https://maps.google.com/mapfiles/kml/paddle/orange-circle.png</href></Icon></IconStyle>
    </Style>
    <Style id="styleSpot">
      <IconStyle><color>ff8140ff</color><scale>1.05</scale><Icon><href>https://maps.google.com/mapfiles/kml/paddle/pink-circle.png</href></Icon></IconStyle>
    </Style>
    ${folders}
  </Document>
</kml>`;

    const suffix = fallbackUsed || scope === 'all' ? 'all' : 'mylist';
    downloadBlob(kml, `hasunosora-pilgrimage-${suffix}.kml`, 'application/vnd.google-earth.kml+xml;charset=utf-8');
    showToast(fallbackUsed ? '尚未勾選地點，已為您匯出全部聖地 KML（可匯入 Google 我的地圖）！' : `已匯出 ${targetLocations.length} 個聖地 KML（可匯入 Google 我的地圖）！`);
  } catch (err) {
    console.error(err);
    showToast('匯出失敗，請確認網路連線後重試');
  }
}

/* ---------- 跨集數搜尋與 Unit / 成員篩選邏輯 ---------- */
function episodeSearchText(ep) {
  const locs = ep.locations || (ep.location ? [ep.location] : []);
  const locText = locs.map(l => `${l.name || ''} ${l.mapQuery || ''}`).join(' ');
  const foodText = (ep.foods || []).join(' ');
  const tlText = (ep.timeline || []).map(t => `${t.time || ''} ${t.foodTitle || ''} ${t.text || ''}`).join(' ');
  return `${ep.series || ''} ${ep._seriesLabel || ''} ${ep.epNum || ''} ${ep.title || ''} ${ep.cast || ''} ${locText} ${foodText} ${tlText}`;
}

function episodeMatchesUnit(ep, unitId) {
  if (!unitId || unitId === 'all') return true;
  const unit = UNIT_FILTERS.find(u => u.id === unitId);
  if (!unit) return true;
  const hay = episodeSearchText(ep);
  if (unitId === 'sanrenka') {
    if (hay.includes('三連華') || hay.includes('2年生')) return true;
    const cast = String(ep.cast || '');
    return cast.includes('楡井希実') && cast.includes('野中ここな') && cast.includes('菅叶和') && !cast.includes('全員');
  }
  return unit.keywords.some(kw => hay.includes(kw));
}

function episodeMatchesQuery(ep, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return true;
  const hay = episodeSearchText(ep).toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every(token => hay.includes(token));
}

function episodeMatchesStamp(ep, stampFilter) {
  if (!stampFilter || stampFilter === 'all') return true;
  const locs = ep.locations || (ep.location ? [ep.location] : []);
  return locs.some(l => getStamp(locKeyOf(l)) === stampFilter);
}

/* ---------- 固定播放器（dock） ---------- */
const EPISODES = {};                 // id -> 集數資料
let dock = null;
let current = null;                  // { ep }：目前載入的集數
let ytPlayer = null, ytReady = false, pending = null, initial = null;
let fallbackIframe = null, pollTimer = null, lastMark = null;
let apiReady = !!(typeof window !== 'undefined' && window.YT && window.YT.Player);
const apiQueue = [];

if (typeof window !== 'undefined') {
  // 只定義一次：API 載入完成時，建立排隊中的播放器
  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    apiQueue.splice(0).forEach(fn => fn());
  };
}

const embedSrc = (videoId, sec) =>
  `https://www.youtube.com/embed/${videoId}?start=${Math.floor(sec)}&autoplay=1&rel=0&playsinline=1`;

function buildDock() {
  if (dock) return dock;
  dock = document.createElement('section');
  dock.className = 'dock';
  dock.setAttribute('aria-label', '影片播放器');
  dock.innerHTML = `
    <div class="dock-video"><div id="dock-player"></div></div>
    <div class="dock-bar">
      <div class="dock-title" id="dockTitle"></div>
      <div class="dock-actions">
        <button type="button" class="dock-btn" id="dockShare" aria-label="複製目前播放時間點連結" title="分享目前播放時間點"><i class="fa-solid fa-share-nodes"></i></button>
        <button type="button" class="dock-btn" id="dockLocate" aria-label="定位到目前播放的時間軸" title="定位目前播放位置"><i class="fa-solid fa-location-crosshairs"></i></button>
        <button type="button" class="dock-btn" id="dockToggle" aria-label="縮小播放器" title="縮小 / 放大"><i class="fa-solid fa-compress"></i></button>
        <button type="button" class="dock-btn" id="dockClose" aria-label="關閉播放器" title="關閉"><i class="fa-solid fa-xmark"></i></button>
      </div>
    </div>`;
  document.body.appendChild(dock);

  dock.querySelector('#dockToggle').addEventListener('click', e => {
    const mini = dock.classList.toggle('is-mini');
    const btn = e.currentTarget;
    btn.setAttribute('aria-label', mini ? '放大播放器' : '縮小播放器');
    btn.innerHTML = `<i class="fa-solid ${mini ? 'fa-expand' : 'fa-compress'}"></i>`;
  });
  dock.querySelector('#dockClose').addEventListener('click', closeDock);
  dock.querySelector('#dockLocate').addEventListener('click', () => {
    const el = document.querySelector('.timeline-item.is-playing') ||
               (current && document.getElementById(current.ep.id));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  dock.querySelector('#dockShare').addEventListener('click', () => {
    if (!current || !current.ep) return;
    const nowSec = (ytReady && ytPlayer && typeof ytPlayer.getCurrentTime === 'function')
      ? Math.floor(ytPlayer.getCurrentTime())
      : (pending?.sec || 0);
    const shareUrl = buildEpisodeShareUrl(current.ep, nowSec);
    copyTextToClipboard(shareUrl, `🔗 已複製 ${current.ep.epNum} (${formatSec(nowSec)}) 分享連結！`);
  });

  // 依播放器實際高度替頁面底部留白，避免內容被遮住
  if (window.ResizeObserver) {
    new ResizeObserver(() => {
      const h = dock.classList.contains('is-open') ? dock.offsetHeight : 0;
      document.documentElement.style.setProperty('--dock-h', h + 'px');
    }).observe(dock);
  }
  return dock;
}

function formatSec(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, '0');
  return `${String(m).padStart(2, '0')}:${r}`;
}

function closeDock() {
  if (ytPlayer && ytReady) ytPlayer.pauseVideo();
  if (fallbackIframe) fallbackIframe.src = 'about:blank';
  dock.classList.remove('is-open');
  document.documentElement.style.setProperty('--dock-h', '0px');
  clearInterval(pollTimer); pollTimer = null;
  setPlaying(null, -1);
  current = null;
}

function seekTo(epId, sec, { updateUrl = true } = {}) {
  const ep = EPISODES[epId];
  if (!ep) return;
  buildDock();
  dock.classList.add('is-open');
  const seriesPrefix = ep._seriesLabel ? `[${ep._seriesLabel}] ` : '';
  document.getElementById('dockTitle').textContent = `${seriesPrefix}${ep.epNum}｜${ep.title}`;

  if (updateUrl && typeof history !== 'undefined' && history.replaceState) {
    const url = new URL(location.href);
    url.searchParams.set('ep', ep._rawId || ep.id);
    if (sec > 0) url.searchParams.set('t', String(Math.floor(sec)));
    else url.searchParams.delete('t');
    history.replaceState(null, '', url.toString());
  }

  const sameVideo = !!current && current.ep.videoId === ep.videoId;
  current = { ep };
  setPlaying(ep.id, idxAt(ep, sec));
  if (!pollTimer) pollTimer = setInterval(updatePlaying, 1000);

  if (fallbackIframe) { fallbackIframe.src = embedSrc(ep.videoId, sec); return; }

  if (ytPlayer && ytReady) {
    if (sameVideo) { ytPlayer.seekTo(sec, true); ytPlayer.playVideo(); }
    else ytPlayer.loadVideoById({ videoId: ep.videoId, startSeconds: sec });
    return;
  }

  pending = { videoId: ep.videoId, sec };
  if (ytPlayer) return;              // 已建立、尚未 ready：onReady 會處理 pending

  let created = false;
  const create = () => {
    if (created) return;
    created = true;
    initial = { ...pending };
    ytPlayer = new YT.Player('dock-player', {
      videoId: initial.videoId,
      playerVars: { start: Math.floor(initial.sec), autoplay: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: e => {
          ytReady = true;
          // 載入期間若又點了別處，補跳過去
          if (pending && (pending.videoId !== initial.videoId || pending.sec !== initial.sec)) {
            e.target.loadVideoById({ videoId: pending.videoId, startSeconds: pending.sec });
          }
          pending = null;
        }
      }
    });
  };

  if (apiReady) {
    create();                        // 在點擊事件內同步建立，行動裝置才允許自動播放
  } else {
    apiQueue.push(create);
    // 5 秒後 API 仍未載入（被擋或網路問題）：改用一般嵌入
    setTimeout(() => {
      if (created) return;
      created = true;
      const holder = dock.querySelector('.dock-video');
      holder.innerHTML = `<iframe src="${embedSrc(pending.videoId, pending.sec)}" title="YouTube 影片" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      fallbackIframe = holder.querySelector('iframe');
    }, 5000);
  }
}

// 目前播放位置 → 對應的時間軸項目（取「開始時間 ≤ 現在」中最後一筆）
function idxAt(ep, t) {
  let idx = -1, best = -1;
  ep.timeline.forEach((x, i) => { const s = secOf(x); if (s <= t + 0.5 && s >= best) { best = s; idx = i; } });
  return idx;
}

function updatePlaying() {
  if (!current || !ytReady || !ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
  setPlaying(current.ep.id, idxAt(current.ep, ytPlayer.getCurrentTime()));
}

function setPlaying(epId, idx) {
  const key = `${epId}:${idx}`;
  if (key === lastMark) return;
  lastMark = key;
  document.querySelectorAll('.timeline-item.is-playing').forEach(el => el.classList.remove('is-playing'));
  if (idx < 0 || !epId) return;
  const items = document.querySelectorAll(`#${CSS.escape(epId)} .timeline-item`);
  if (items[idx]) items[idx].classList.add('is-playing');
}

// 全域事件委派：時間碼播放、打卡按鈕、分享連結按鈕、匯出按鈕
if (typeof document !== 'undefined') {
  document.addEventListener('click', e => {
    const seekEl = e.target.closest('[data-seek]');
    if (seekEl) {
      seekTo(seekEl.dataset.ep, Number(seekEl.dataset.sec));
      return;
    }

    const stampEl = e.target.closest('[data-stamp-toggle]');
    if (stampEl) {
      setStamp(stampEl.dataset.locKey, stampEl.dataset.stampToggle, stampEl.dataset.locName);
      return;
    }

    const shareEl = e.target.closest('[data-share-ep]');
    if (shareEl) {
      const ep = EPISODES[shareEl.dataset.shareEp];
      if (!ep) return;
      const hasSec = shareEl.dataset.shareSec !== undefined && shareEl.dataset.shareSec !== '';
      const sec = hasSec ? Number(shareEl.dataset.shareSec) : null;
      const url = buildEpisodeShareUrl(ep, sec);
      const timeLabel = shareEl.dataset.shareTime ? ` (${shareEl.dataset.shareTime})` : '';
      copyTextToClipboard(url, `🔗 已複製 ${ep.epNum}${timeLabel} 分享連結！`);
      return;
    }

    const shareLocEl = e.target.closest('[data-share-loc]');
    if (shareLocEl) {
      const locKey = shareLocEl.dataset.shareLoc;
      const locName = shareLocEl.dataset.shareLocName || locKey;
      const url = buildMapShareUrl(locKey);
      copyTextToClipboard(url, `🔗 已複製「${locName}」地圖點位分享連結！`);
      return;
    }

    const exportEl = e.target.closest('[data-export-pilgrimage]');
    if (exportEl) {
      const fmt = exportEl.dataset.exportPilgrimage;
      const scope = exportEl.dataset.exportScope || 'saved';
      exportPilgrimageData(fmt, scope);
    }
  });
}

/* ---------- 渲染 ---------- */
function renderEpisode(ep) {
  // 地點：新格式 locations: [...]，舊格式 location: {...} 仍相容
  const locs = ep.locations || (ep.location ? [ep.location] : []);
  const noVideo = !ep.videoId;
  const seekAttrs = sec => noVideo ? 'disabled' : `data-seek data-ep="${esc(ep.id)}" data-sec="${sec}"`;
  const hasEating = ep.timeline.some(t => t.isEating);
  const foods = ep.foods || [];
  const hasWish = locs.some(l => getStamp(locKeyOf(l)) === 'wish');
  const hasVisited = locs.some(l => getStamp(locKeyOf(l)) === 'visited');

  const locRows = locs.map(l => {
    const key = locKeyOf(l);
    const map = l.mapQuery
      ? `<a class="loc-link-btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.mapQuery)}" target="_blank" rel="noopener"><i class="fa-solid fa-map-location-dot"></i> Google Maps</a>
         <a class="loc-link-btn loc-map-btn" href="map.html?loc=${encodeURIComponent(key)}" title="在聖地巡禮地圖定位此地點"><i class="fa-solid fa-location-crosshairs"></i> 巡禮地圖定位</a>`
      : `<span class="loc-unconfirmed"><i class="fa-solid fa-circle-question"></i> 地點未公開，暫無地圖</span>`;
    const stamps = l.mapQuery ? renderStampButtonsHtml(key, l.name) : '';
    return `<div class="loc-row" data-loc-row="${esc(key)}">
      <span class="loc-name">${esc(l.name)}</span>
      <span class="loc-links">${map}${stamps}</span>
    </div>`;
  }).join('');

  const timeline = ep.timeline.map(t => {
    const sec = secOf(t);
    const btn = `<button type="button" class="tl-btn" ${seekAttrs(sec)} title="跳轉至 ${esc(t.time)}"><i class="fa-solid fa-play"></i> ${esc(t.time)}</button>`;
    const yt = noVideo ? '' : `<a class="tl-yt" href="https://www.youtube.com/watch?v=${esc(ep.videoId)}&t=${sec}s" target="_blank" rel="noopener" aria-label="在 YouTube 開啟 ${esc(t.time)}" title="在 YouTube 開啟"><i class="fa-brands fa-youtube"></i></a>`;
    const shareBtn = `<button type="button" class="tl-share" data-share-ep="${esc(ep.id)}" data-share-sec="${sec}" data-share-time="${esc(t.time)}" aria-label="複製 ${esc(t.time)} 分享連結" title="複製此時間點分享連結"><i class="fa-solid fa-link"></i></button>`;
    const low = t.confidence && t.confidence !== 'high'
      ? `<span class="tl-tag tl-low" title="可信度較低，建議對照影片確認">待確認</span>` : '';
    if (t.isEating) {
      return `<div class="timeline-item is-eating" data-tl-sec="${sec}"><div class="tl-left">${btn}${yt}${shareBtn}
        <span class="tl-tag"><i class="fa-solid fa-utensils"></i> 開吃前5秒</span>${low}
        <div class="tl-body"><span class="tl-eating-food">[${esc(t.foodTitle)}]</span> <span class="tl-text">${esc(t.text)}</span></div></div></div>`;
    }
    return `<div class="timeline-item" data-tl-sec="${sec}"><div class="tl-left">${btn}${yt}${shareBtn}${low}<span class="tl-text tl-body">${esc(t.text)}</span></div></div>`;
  }).join('');

  const watch = noVideo
    ? `<div class="no-video-note"><i class="fa-solid fa-triangle-exclamation"></i> ${ep.placeholder ? '這集的影片連結與時間軸整理中' : '這集尚未填入影片 ID，暫時無法播放（請填在資料檔的 videoId）'}</div>`
    : `<button type="button" class="watch-btn" ${seekAttrs(0)} aria-label="從頭播放：${esc(ep.title)}">
          <span class="watch-thumb">
            <img src="https://img.youtube.com/vi/${esc(ep.videoId)}/hqdefault.jpg" alt="" loading="lazy">
            <span class="watch-play"><i class="fa-solid fa-play"></i></span>
          </span>
          <span class="watch-text"><strong>從頭播放</strong><small>影片固定在畫面下方，邊滑邊看</small></span>
        </button>`;

  const foodBlock = foods.length ? `
        <div>
          <div class="section-title"><i class="fa-solid fa-utensils ic-orange"></i> ${ep.isRestaurant ? '同款外食美饌品項' : '現場料理與食材品項'}</div>
          <div class="food-chips">${foods.map(f => `<span class="food-chip"><i class="fa-solid fa-check"></i> ${esc(f)}</span>`).join('')}</div>
        </div>` : '';

  const seriesBadge = ep._seriesLabel
    ? `<a class="ep-series-badge" href="${esc(ep._seriesHref || '#')}" title="前往 ${esc(ep._seriesLabel)} 專頁">${esc(ep._seriesLabel)}</a>`
    : '';

  return `
  <article class="episode-card" id="${esc(ep.id)}" data-has-eating="${hasEating ? 1 : 0}" data-has-wish="${hasWish ? 1 : 0}" data-has-visited="${hasVisited ? 1 : 0}">
    <div class="card-header">
      <div class="ep-meta">
        ${seriesBadge}
        <span class="ep-number">${esc(ep.epNum)}</span>
        ${ep.placeholder ? '<span class="ph-badge">資料整理中</span>' : ''}
        <h2 class="ep-title">${esc(ep.title)}</h2>
      </div>
      <div class="card-header-right">
        <div class="cast-tag"><i class="fa-solid fa-user-group"></i> ${esc(ep.cast)}</div>
        <button type="button" class="ep-share-btn" data-share-ep="${esc(ep.id)}" title="複製本集分享連結" aria-label="複製 ${esc(ep.epNum)} 分享連結"><i class="fa-solid fa-share-nodes"></i> 分享</button>
      </div>
    </div>
    <div class="card-body">
      <div class="info-pane">
        ${watch}
        <div class="location-box">
          <div class="loc-label"><i class="fa-solid fa-location-dot"></i> 外景拍攝地點</div>
          ${locRows || '<div class="loc-row"><span class="loc-unconfirmed"><i class="fa-solid fa-circle-question"></i> 地點整理中</span></div>'}
        </div>${foodBlock}
        <div class="timeline-section">
          <div class="section-title"><i class="fa-regular fa-clock ic-pink"></i> 時間軸（點時間碼跳轉；<i class="fa-brands fa-youtube"></i> 在 YouTube 開啟；<i class="fa-solid fa-link"></i> 複製時間點連結）</div>
          <div class="timeline-list">${timeline || '<p class="timeline-empty">時間軸整理中…</p>'}</div>
        </div>
      </div>
    </div>
  </article>`;
}

function renderPilgrimageBarHtml() {
  const { wish, visited } = getStampCounts();
  return `
    <div class="pilgrimage-bar" id="pilgrimageBar">
      <div class="pilgrimage-stats" id="pilgrimageStats">
        <span class="pilgrimage-stat"><i class="fa-solid fa-route ic-pink"></i> 我的巡禮紀錄：</span>
        <span class="pilgrimage-badge pilgrimage-badge--wish"><i class="fa-solid fa-star"></i> 想去 <strong id="wishCount">${wish}</strong></span>
        <span class="pilgrimage-badge pilgrimage-badge--visited"><i class="fa-solid fa-check"></i> 已踩點 <strong id="visitedCount">${visited}</strong></span>
      </div>
      <div class="pilgrimage-actions">
        <button type="button" class="pilgrimage-export-btn" data-export-pilgrimage="kml" data-export-scope="saved" title="匯出已勾選的「想去 / 已踩點」地點為 KML（可直接匯入 Google 我的地圖）">
          <i class="fa-solid fa-file-arrow-down"></i> 匯出清單 KML (Google 地圖)
        </button>
        <button type="button" class="pilgrimage-export-btn is-secondary" data-export-pilgrimage="geojson" data-export-scope="saved" title="匯出為 GeoJSON 格式">
          <i class="fa-solid fa-code"></i> 匯出 GeoJSON
        </button>
        <button type="button" class="pilgrimage-export-btn is-ghost" data-export-pilgrimage="kml" data-export-scope="all" title="匯出全站所有聖地 KML">
          <i class="fa-solid fa-earth-asia"></i> 全站 KML
        </button>
      </div>
    </div>`;
}

function updatePilgrimageSummaryUI() {
  if (typeof document === 'undefined') return;
  const { wish, visited } = getStampCounts();
  const wishEl = document.getElementById('wishCount');
  const visitedEl = document.getElementById('visitedCount');
  if (wishEl) wishEl.textContent = String(wish);
  if (visitedEl) visitedEl.textContent = String(visited);
}

function renderToolbar(data) {
  const unitButtons = UNIT_FILTERS.map((u, idx) =>
    `<button type="button" class="filter-chip${idx === 0 ? ' is-active' : ''}" data-unit-filter="${u.id}" aria-pressed="${idx === 0}">${esc(u.short)}</button>`
  ).join('');

  return `
    ${renderPilgrimageBarHtml()}
    <div class="filter-panel">
      <div class="search-row">
        <div class="search-input-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="search" id="searchInput" class="search-input" placeholder="搜尋店名、同款美食、景點、聲優、時間軸關鍵字…" aria-label="搜尋集數與聖地內容" autocomplete="off">
          <button type="button" id="searchClear" class="search-clear" hidden aria-label="清除搜尋"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <label class="global-search-toggle" title="勾選後可一次搜尋 Plus、三連華、103、104、105 全部 5 個系列">
          <input type="checkbox" id="globalSearch">
          <i class="fa-solid fa-globe ic-pink"></i> 跨全站 5 系列搜尋
        </label>
        <label class="food-toggle">
          <input type="checkbox" id="foodOnly">
          <i class="fa-solid fa-utensils ic-orange"></i> 只看美食片段
        </label>
      </div>
      <div class="filter-row">
        <div class="unit-filter-group" id="unitFilterGroup" role="group" aria-label="Unit 與成員篩選">
          ${unitButtons}
        </div>
        <div class="stamp-filter-group" id="stampFilterGroup" role="group" aria-label="巡禮打卡狀態篩選">
          <button type="button" class="filter-chip is-active" data-stamp-filter="all" aria-pressed="true">全部地點</button>
          <button type="button" class="filter-chip filter-chip--wish" data-stamp-filter="wish" aria-pressed="false"><i class="fa-solid fa-star"></i> 只看想去</button>
          <button type="button" class="filter-chip filter-chip--visited" data-stamp-filter="visited" aria-pressed="false"><i class="fa-solid fa-check"></i> 只看已踩點</button>
        </div>
      </div>
      <div class="filter-status" id="filterStatus" role="status" aria-live="polite" hidden></div>
    </div>
    <nav class="ep-toc" id="epToc" aria-label="集數目錄">
      ${data.map(ep => `<a class="toc-chip" data-toc-ep="${esc(ep.id)}" href="#${esc(ep.id)}">${esc(ep.epNum)}</a>`).join('')}
    </nav>`;
}

// 依 EP 編號排序；「SP 4DX」這類特別編沒有數字，排在最後並維持資料檔裡的原順序
function sortByEpisode(data) {
  const order = ep => { const m = String(ep.epNum).match(/^EP\s*(\d+)/i); return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER; };
  return [...data].sort((a, b) => order(a) - order(b));
}

function renderSiteNav(active) {
  const nav = document.getElementById('siteNav');
  if (nav) {
    nav.innerHTML = NAV_ITEMS.map(n =>
      `<a class="nav-btn" href="${n.href}"${n.key === active ? ' aria-current="page"' : ''}><i class="fa-solid ${n.icon}"></i> <span class="nav-full">${n.label}</span><span class="nav-short">${n.short}</span></a>`
    ).join('');
  }
}

/* ---------- 頁面狀態與篩選控制 ---------- */
let currentPageKey = '';
let currentPageData = [];
let globalSeriesData = null;
const filterState = {
  query: '',
  unit: 'all',
  stamp: 'all',
  foodOnly: false,
  global: false
};

async function enableGlobalDataset() {
  if (globalSeriesData) return globalSeriesData;
  const sets = await ensureAllDataLoaded();
  const merged = [];
  sets.forEach(({ key, series, href, data }) => {
    sortByEpisode(data).forEach(ep => {
      const id = key === currentPageKey ? ep.id : `${key}-${ep.id}`;
      const enriched = {
        ...ep,
        id,
        _rawId: ep.id,
        _seriesKey: key,
        _seriesLabel: series,
        _seriesHref: `${href}?ep=${encodeURIComponent(ep.id)}`
      };
      EPISODES[id] = enriched;
      merged.push(enriched);
    });
  });
  globalSeriesData = merged;
  return globalSeriesData;
}

async function applyPageFilters({ updateUrl = true } = {}) {
  const container = document.getElementById('episodesContainer');
  const statusEl = document.getElementById('filterStatus');
  const tocEl = document.getElementById('epToc');
  if (!container) return;

  let dataset = currentPageData;
  if (filterState.global) {
    dataset = await enableGlobalDataset();
  }

  // 當切換本頁 / 跨全站資料集時重新渲染容器
  const modeKey = filterState.global ? 'global' : 'local';
  if (container.dataset.renderMode !== modeKey) {
    container.dataset.renderMode = modeKey;
    container.innerHTML = dataset.map(renderEpisode).join('');
  }

  document.body.classList.toggle('foods-only', filterState.foodOnly);

  let visibleCount = 0;
  const visibleIds = new Set();

  dataset.forEach(ep => {
    const card = document.getElementById(ep.id);
    if (!card) return;
    const matchQuery = episodeMatchesQuery(ep, filterState.query);
    const matchUnit = episodeMatchesUnit(ep, filterState.unit);
    const matchStamp = episodeMatchesStamp(ep, filterState.stamp);
    const matchFood = !filterState.foodOnly || ep.timeline.some(t => t.isEating) || (ep.foods && ep.foods.length > 0);
    const show = matchQuery && matchUnit && matchStamp && matchFood;
    card.hidden = !show;
    if (show) {
      visibleCount++;
      visibleIds.add(ep.id);
    }
  });

  if (tocEl) {
    tocEl.hidden = filterState.global;
    tocEl.querySelectorAll('[data-toc-ep]').forEach(chip => {
      chip.classList.toggle('is-filtered-out', !visibleIds.has(chip.dataset.tocEp));
    });
  }

  const isFiltering = !!(filterState.query || filterState.unit !== 'all' || filterState.stamp !== 'all' || filterState.foodOnly || filterState.global);
  if (statusEl) {
    if (!isFiltering) {
      statusEl.hidden = true;
    } else {
      statusEl.hidden = false;
      const scopeLabel = filterState.global ? '全站 5 系列' : '本頁';
      const emptyAction = (visibleCount === 0 && !filterState.global)
        ? ` <button type="button" class="inline-action-btn" id="tryGlobalSearchBtn"><i class="fa-solid fa-globe"></i> 改用跨全站 5 系列搜尋</button>`
        : '';
      statusEl.innerHTML = `
        <span><i class="fa-solid fa-filter ic-pink"></i> ${scopeLabel}篩選結果：共顯示 <strong>${visibleCount}</strong> / ${dataset.length} 集${emptyAction}</span>
        <button type="button" class="inline-reset-btn" id="resetFiltersBtn"><i class="fa-solid fa-rotate-left"></i> 重設篩選</button>`;
      const tryGlobalBtn = document.getElementById('tryGlobalSearchBtn');
      if (tryGlobalBtn) {
        tryGlobalBtn.addEventListener('click', () => {
          const globalCheckbox = document.getElementById('globalSearch');
          if (globalCheckbox) globalCheckbox.checked = true;
          filterState.global = true;
          applyPageFilters();
        });
      }
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          filterState.query = '';
          filterState.unit = 'all';
          filterState.stamp = 'all';
          filterState.foodOnly = false;
          filterState.global = false;
          syncFilterControlsFromState();
          applyPageFilters();
        });
      }
    }
  }

  if (updateUrl && typeof history !== 'undefined' && history.replaceState) {
    const url = new URL(location.href);
    if (filterState.query) url.searchParams.set('q', filterState.query);
    else url.searchParams.delete('q');
    if (filterState.unit !== 'all') url.searchParams.set('unit', filterState.unit);
    else url.searchParams.delete('unit');
    if (filterState.stamp !== 'all') url.searchParams.set('stamp', filterState.stamp);
    else url.searchParams.delete('stamp');
    if (filterState.foodOnly) url.searchParams.set('food', '1');
    else url.searchParams.delete('food');
    if (filterState.global) url.searchParams.set('global', '1');
    else url.searchParams.delete('global');
    history.replaceState(null, '', url.toString());
  }
}

function syncFilterControlsFromState() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const foodOnly = document.getElementById('foodOnly');
  const globalSearch = document.getElementById('globalSearch');
  if (searchInput) searchInput.value = filterState.query;
  if (searchClear) searchClear.hidden = !filterState.query;
  if (foodOnly) foodOnly.checked = filterState.foodOnly;
  if (globalSearch) globalSearch.checked = filterState.global;

  document.querySelectorAll('[data-unit-filter]').forEach(btn => {
    const active = btn.dataset.unitFilter === filterState.unit;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-stamp-filter]').forEach(btn => {
    const active = btn.dataset.stampFilter === filterState.stamp;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function initPage({ active, data }) {
  currentPageKey = active;
  renderSiteNav(active);
  if (Array.isArray(data)) data = sortByEpisode(data);

  // 回顧速覽：手機預設折疊，桌面預設展開
  const wide = window.matchMedia('(min-width: 901px)').matches;
  document.querySelectorAll('details.summary-box').forEach(d => { d.open = wide; });

  const container = document.getElementById('episodesContainer');
  if (!container || !Array.isArray(data)) return;

  currentPageData = data.map(ep => ({ ...ep, _rawId: ep.id, _seriesKey: active }));
  currentPageData.forEach(ep => { EPISODES[ep.id] = ep; });
  container.dataset.renderMode = 'local';
  container.innerHTML = currentPageData.map(renderEpisode).join('');

  const toolbar = document.getElementById('toolbar');
  if (toolbar) {
    toolbar.innerHTML = renderToolbar(currentPageData);
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const foodOnly = document.getElementById('foodOnly');
    const globalSearch = document.getElementById('globalSearch');

    searchInput.addEventListener('input', e => {
      filterState.query = e.target.value;
      searchClear.hidden = !filterState.query;
      applyPageFilters();
    });
    searchClear.addEventListener('click', () => {
      filterState.query = '';
      searchInput.value = '';
      searchClear.hidden = true;
      searchInput.focus();
      applyPageFilters();
    });
    foodOnly.addEventListener('change', e => {
      filterState.foodOnly = e.target.checked;
      applyPageFilters();
    });
    globalSearch.addEventListener('change', e => {
      filterState.global = e.target.checked;
      applyPageFilters();
    });

    document.getElementById('unitFilterGroup').addEventListener('click', e => {
      const btn = e.target.closest('[data-unit-filter]');
      if (!btn) return;
      filterState.unit = btn.dataset.unitFilter;
      syncFilterControlsFromState();
      applyPageFilters();
    });

    document.getElementById('stampFilterGroup').addEventListener('click', e => {
      const btn = e.target.closest('[data-stamp-filter]');
      if (!btn) return;
      filterState.stamp = btn.dataset.stampFilter;
      syncFilterControlsFromState();
      applyPageFilters();
    });
  }

  // 解析網址 Deep Link (?ep=ep27&t=1077、?loc=...、?q=...、?unit=...、#ep27)
  handlePageDeepLink();
}

async function handlePageDeepLink() {
  if (typeof location === 'undefined') return;
  const params = new URLSearchParams(location.search);
  const hashRaw = decodeURIComponent(location.hash.slice(1));
  const hashParams = new URLSearchParams(hashRaw.includes('=') ? hashRaw : '');

  const q = params.get('q');
  const unit = params.get('unit');
  const stamp = params.get('stamp');
  const food = params.get('food');
  const global = params.get('global');
  const locParam = params.get('loc');

  if (q) filterState.query = q;
  if (unit && UNIT_FILTERS.some(u => u.id === unit)) filterState.unit = unit;
  if (stamp && ['all', 'wish', 'visited'].includes(stamp)) filterState.stamp = stamp;
  if (food === '1' || food === 'true') filterState.foodOnly = true;
  if (global === '1' || global === 'true') filterState.global = true;

  if (q || unit || stamp || food || global) {
    syncFilterControlsFromState();
    await applyPageFilters({ updateUrl: false });
  }

  if (locParam) {
    const normLoc = normalizeLocKey(locParam);
    const row = [...document.querySelectorAll('[data-loc-row]')].find(el => normalizeLocKey(el.dataset.locRow) === normLoc);
    if (row) {
      row.classList.add('is-highlighted');
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  }

  const epParam = params.get('ep') || hashParams.get('ep') || (!hashRaw.includes('=') ? hashRaw : '');
  const tParam = params.get('t') ?? hashParams.get('t');

  if (epParam) {
    const targetCard = document.getElementById(epParam);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (tParam !== null && tParam !== undefined && tParam !== '') {
      const sec = toSec(tParam);
      const ep = EPISODES[epParam];
      if (ep) {
        const idx = idxAt(ep, sec);
        setPlaying(ep.id, idx);
        const items = document.querySelectorAll(`#${CSS.escape(ep.id)} .timeline-item`);
        if (items[idx]) {
          items[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (ep.videoId) {
          seekTo(ep.id, sec, { updateUrl: false });
        }
      }
    }
  }
}

function initMapPage(dataSets) {
  currentPageKey = 'map';
  renderSiteNav('map');
  return dataSets.map(({ key, series, data }) => {
    const navMeta = NAV_ITEMS.find(n => n.key === key);
    const href = navMeta ? navMeta.href : 'index.html';
    return {
      key,
      series,
      href,
      data: data.map(ep => {
        const mapEpisode = {
          ...ep,
          id: `${key}-${ep.id}`,
          _rawId: ep.id,
          _seriesKey: key,
          _seriesLabel: series,
          _seriesHref: `${href}?ep=${encodeURIComponent(ep.id)}`,
          series
        };
        EPISODES[mapEpisode.id] = mapEpisode;
        return mapEpisode;
      })
    };
  });
}

if (typeof window !== 'undefined') {
  window.initMapPage = initMapPage;
  window.playMapEpisode = (epId, sec = 0) => {
    const ep = EPISODES[epId];
    if (ep && ep.videoId) seekTo(epId, sec, { updateUrl: false });
  };
  window.HasuApp = {
    UNIT_FILTERS,
    CAST_MEMBERS,
    normalizeLocKey,
    locKeyOf,
    toSec,
    getStamp,
    setStamp,
    getStampCounts,
    renderStampButtonsHtml,
    renderPilgrimageBarHtml,
    updatePilgrimageSummaryUI,
    exportPilgrimageData,
    episodeMatchesUnit,
    episodeMatchesQuery,
    episodeMatchesStamp,
    buildEpisodeShareUrl,
    buildMapShareUrl,
    copyTextToClipboard,
    showToast
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    renderEpisode,
    toSec,
    esc,
    idxAt,
    episodeMatchesUnit,
    episodeMatchesQuery,
    normalizeLocKey
  };
}
