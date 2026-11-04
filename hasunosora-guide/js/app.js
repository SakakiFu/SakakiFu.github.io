/* 蓮ノ空 聖地巡禮指南：共用引擎
 * 使用方式（各頁 HTML）：initPage({ active: 'plus', data: sehasuPlusData })
 * 載入順序：資料檔 → app.js → YouTube iframe_api（app.js 必須先定義回呼）
 *
 * 播放設計：全頁只有「一個」固定在畫面底部的播放器（dock），
 * 點任何一集的時間碼都由它播放，所以邊滑動、邊切換集數都不會中斷。
 */

const NAV_ITEMS = [
  { key: 'plus',      href: 'index.html',     icon: 'fa-compass',          label: 'せーはす Plus 外景篇', short: 'Plus 外景' },
  { key: 'prayer',    href: 'prayer.html',    icon: 'fa-cake-candles',     label: '劇場版祈願 蓮ノ三連華篇', short: '祈願三連華' },
  { key: 'sehasu104', href: 'sehasu104.html', icon: 'fa-torii-gate',      label: 'せーはす 104 外景聖地篇', short: '104 外景' },
  { key: 'sehasu105', href: 'sehasu105.html', icon: 'fa-map-location-dot', label: 'せーはす 105 外景聖地篇', short: '105 外景' }
];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// "12:25" 或 "1:02:03" → 秒數（資料沒寫 sec 時自動換算）
const toSec = t => String(t).split(':').map(Number).reduce((a, n) => a * 60 + n, 0);
const secOf = t => t.sec ?? toSec(t.time);

/* ---------- 固定播放器（dock） ---------- */
const EPISODES = {};                 // id -> 集數資料
let dock = null;
let current = null;                  // { ep }：目前載入的集數
let ytPlayer = null, ytReady = false, pending = null, initial = null;
let fallbackIframe = null, pollTimer = null, lastMark = null;
let apiReady = !!(window.YT && window.YT.Player);
const apiQueue = [];

// 只定義一次：API 載入完成時，建立排隊中的播放器
window.onYouTubeIframeAPIReady = () => {
  apiReady = true;
  apiQueue.splice(0).forEach(fn => fn());
};

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

  // 依播放器實際高度替頁面底部留白，避免內容被遮住
  if (window.ResizeObserver) {
    new ResizeObserver(() => {
      const h = dock.classList.contains('is-open') ? dock.offsetHeight : 0;
      document.documentElement.style.setProperty('--dock-h', h + 'px');
    }).observe(dock);
  }
  return dock;
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

function seekTo(epId, sec) {
  const ep = EPISODES[epId];
  if (!ep) return;
  buildDock();
  dock.classList.add('is-open');
  document.getElementById('dockTitle').textContent = `${ep.epNum}｜${ep.title}`;

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

// 事件委派：所有 [data-seek] 元素（時間碼按鈕、從頭播放）
document.addEventListener('click', e => {
  const el = e.target.closest('[data-seek]');
  if (el) seekTo(el.dataset.ep, Number(el.dataset.sec));
});

/* ---------- 渲染 ---------- */
function renderEpisode(ep) {
  // 地點：新格式 locations: [...]，舊格式 location: {...} 仍相容
  const locs = ep.locations || (ep.location ? [ep.location] : []);
  const noVideo = !ep.videoId;
  const seekAttrs = sec => noVideo ? 'disabled' : `data-seek data-ep="${esc(ep.id)}" data-sec="${sec}"`;
  const hasEating = ep.timeline.some(t => t.isEating);
  const foods = ep.foods || [];

  const locRows = locs.map(l => {
    const map = l.mapQuery
      ? `<a class="loc-link-btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.mapQuery)}" target="_blank" rel="noopener"><i class="fa-solid fa-map-location-dot"></i> Google Maps</a>`
      : `<span class="loc-unconfirmed"><i class="fa-solid fa-circle-question"></i> 地點未公開，暫無地圖</span>`;
    return `<div class="loc-row"><span class="loc-name">${esc(l.name)}</span><span class="loc-links">${map}</span></div>`;
  }).join('');

  const timeline = ep.timeline.map(t => {
    const sec = secOf(t);
    const btn = `<button type="button" class="tl-btn" ${seekAttrs(sec)} title="跳轉至 ${esc(t.time)}"><i class="fa-solid fa-play"></i> ${esc(t.time)}</button>`;
    const yt = noVideo ? '' : `<a class="tl-yt" href="https://www.youtube.com/watch?v=${esc(ep.videoId)}&t=${sec}s" target="_blank" rel="noopener" aria-label="在 YouTube 開啟 ${esc(t.time)}" title="在 YouTube 開啟"><i class="fa-brands fa-youtube"></i></a>`;
    const low = t.confidence && t.confidence !== 'high'
      ? `<span class="tl-tag tl-low" title="可信度較低，建議對照影片確認">待確認</span>` : '';
    if (t.isEating) {
      return `<div class="timeline-item is-eating"><div class="tl-left">${btn}${yt}
        <span class="tl-tag"><i class="fa-solid fa-utensils"></i> 開吃前5秒</span>${low}
        <div class="tl-body"><span class="tl-eating-food">[${esc(t.foodTitle)}]</span> <span class="tl-text">${esc(t.text)}</span></div></div></div>`;
    }
    return `<div class="timeline-item"><div class="tl-left">${btn}${yt}${low}<span class="tl-text tl-body">${esc(t.text)}</span></div></div>`;
  }).join('');

  const watch = noVideo
    ? `<div class="no-video-note"><i class="fa-solid fa-triangle-exclamation"></i> 這集尚未填入影片 ID，暫時無法播放（請填在資料檔的 videoId）</div>`
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

  return `
  <article class="episode-card" id="${esc(ep.id)}" data-has-eating="${hasEating ? 1 : 0}">
    <div class="card-header">
      <div class="ep-meta">
        <span class="ep-number">${esc(ep.epNum)}</span>
        <h2 class="ep-title">${esc(ep.title)}</h2>
      </div>
      <div class="cast-tag"><i class="fa-solid fa-user-group"></i> ${esc(ep.cast)}</div>
    </div>
    <div class="card-body">
      <div class="info-pane">
        ${watch}
        <div class="location-box">
          <div class="loc-label"><i class="fa-solid fa-location-dot"></i> 外景拍攝地點</div>
          ${locRows}
        </div>${foodBlock}
        <div class="timeline-section">
          <div class="section-title"><i class="fa-regular fa-clock ic-pink"></i> 時間軸（點時間碼跳轉；<i class="fa-brands fa-youtube"></i> 在 YouTube 開啟）</div>
          <div class="timeline-list">${timeline}</div>
        </div>
      </div>
    </div>
  </article>`;
}

function renderToolbar(data) {
  return `
    <nav class="ep-toc" aria-label="集數目錄">
      ${data.map(ep => `<a class="toc-chip" href="#${esc(ep.id)}">${esc(ep.epNum)}</a>`).join('')}
    </nav>
    <label class="food-toggle">
      <input type="checkbox" id="foodOnly">
      <i class="fa-solid fa-utensils ic-orange"></i> 只看美食片段
    </label>`;
}

function initPage({ active, data }) {
  const nav = document.getElementById('siteNav');
  if (nav) {
    nav.innerHTML = NAV_ITEMS.map(n =>
      `<a class="nav-btn" href="${n.href}"${n.key === active ? ' aria-current="page"' : ''}><i class="fa-solid ${n.icon}"></i> <span class="nav-full">${n.label}</span><span class="nav-short">${n.short}</span></a>`
    ).join('');
  }

  // 回顧速覽：手機預設折疊，桌面預設展開
  const wide = window.matchMedia('(min-width: 901px)').matches;
  document.querySelectorAll('details.summary-box').forEach(d => { d.open = wide; });

  const container = document.getElementById('episodesContainer');
  if (!container || !Array.isArray(data)) return;
  data.forEach(ep => { EPISODES[ep.id] = ep; });
  container.innerHTML = data.map(renderEpisode).join('');

  const toolbar = document.getElementById('toolbar');
  if (toolbar) {
    toolbar.innerHTML = renderToolbar(data);
    document.getElementById('foodOnly').addEventListener('change', e =>
      document.body.classList.toggle('foods-only', e.target.checked));
  }

  // 內容是動態產生的，需自行處理網址 #錨點（例如 #ep39）
  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView();
  }
}

if (typeof module !== 'undefined') module.exports = { renderEpisode, toSec, esc, idxAt };
