/* 蓮ノ空 聖地巡禮指南：共用播放控制與渲染引擎
 * 使用方式（各頁 HTML）：initPage({ active: 'plus', data: sehasuPlusData })
 * 載入順序：資料檔 → app.js → YouTube iframe_api（app.js 必須先定義回呼）
 */

const NAV_ITEMS = [
  { key: 'plus',      href: 'index.html',     icon: 'fa-compass',          label: 'せーはす Plus 外景篇' },
  { key: 'prayer',    href: 'prayer.html',    icon: 'fa-cake-candles',     label: '劇場版祈願 蓮ノ三連華篇' },
  { key: 'sehasu105', href: 'sehasu105.html', icon: 'fa-map-location-dot', label: 'せーはす 105 外景聖地篇' }
];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// "12:25" 或 "1:02:03" → 秒數（資料若沒寫 sec 就自動換算）
const toSec = t => String(t).split(':').map(Number).reduce((a, n) => a * 60 + n, 0);

/* ---------- 播放器 ---------- */
const players = {};              // epId -> { ready, pendingSec, player, fallback }
const apiQueue = [];
let apiReady = !!(window.YT && window.YT.Player);

// 只定義一次：API 載入完成時，依序建立所有排隊中的播放器
window.onYouTubeIframeAPIReady = () => {
  apiReady = true;
  apiQueue.splice(0).forEach(fn => fn());
};

const embedSrc = (videoId, sec) =>
  `https://www.youtube.com/embed/${videoId}?start=${sec}&autoplay=1&rel=0&playsinline=1`;

function pauseOthers(currentId) {
  Object.keys(players).forEach(id => {
    const st = players[id];
    if (id !== currentId && st.ready && st.player && typeof st.player.pauseVideo === 'function') {
      st.player.pauseVideo();
    }
  });
}

function seekTo(epId, videoId, sec) {
  const viewport = document.getElementById(`viewport-${epId}`);
  if (!viewport) return;
  pauseOthers(epId);

  const st = players[epId];
  if (st) {
    if (st.fallback) {
      viewport.querySelector('iframe').src = embedSrc(videoId, sec);
    } else if (st.ready) {
      st.player.seekTo(sec, true);
      st.player.playVideo();
    } else {
      st.pendingSec = sec;       // 播放器還沒好：只更新目標秒數，不重建
    }
    return;
  }

  viewport.innerHTML = `<div id="yt-player-${epId}"></div>`;
  const state = players[epId] = { ready: false, pendingSec: sec, player: null, fallback: false };
  let created = false;

  const create = () => {
    if (created) return;
    created = true;
    state.player = new YT.Player(`yt-player-${epId}`, {
      videoId,
      playerVars: { start: sec, autoplay: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: e => {
          state.ready = true;
          e.target.seekTo(state.pendingSec, true);
          e.target.playVideo();
        }
      }
    });
  };

  if (apiReady) {
    create();
  } else {
    apiQueue.push(create);
    // 若 5 秒後 API 仍未載入（被擋或網路問題），改用一般嵌入
    setTimeout(() => {
      if (created) return;
      created = true;
      state.fallback = true;
      viewport.innerHTML = `<iframe src="${embedSrc(videoId, state.pendingSec)}" title="YouTube 影片" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    }, 5000);
  }
}

// 事件委派：所有 [data-seek] 元素（時間碼按鈕、影片封面）
document.addEventListener('click', e => {
  const el = e.target.closest('[data-seek]');
  if (el) seekTo(el.dataset.ep, el.dataset.vid, Number(el.dataset.sec));
});

/* ---------- 渲染 ---------- */
function renderEpisode(ep) {
  const loc = ep.location || {};
  const seekAttrs = sec => `data-seek data-ep="${esc(ep.id)}" data-vid="${esc(ep.videoId)}" data-sec="${sec}"`;
  const hasEating = ep.timeline.some(t => t.isEating);

  const mapBtn = loc.mapQuery
    ? `<a class="loc-link-btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapQuery)}" target="_blank" rel="noopener"><i class="fa-solid fa-map-location-dot"></i> 在 Google Maps 開啟</a>`
    : `<span class="loc-unconfirmed"><i class="fa-solid fa-circle-question"></i> 確切拍攝地點未公開，暫無地圖連結</span>`;

  const timeline = ep.timeline.map(t => {
    const sec = t.sec ?? toSec(t.time);
    const btn = `<button type="button" class="tl-btn" ${seekAttrs(sec)} title="跳轉至 ${esc(t.time)}"><i class="fa-solid fa-play"></i> ${esc(t.time)}</button>`;
    const yt = `<a class="tl-yt" href="https://www.youtube.com/watch?v=${esc(ep.videoId)}&t=${sec}s" target="_blank" rel="noopener" aria-label="在 YouTube 開啟 ${esc(t.time)}" title="在 YouTube 開啟"><i class="fa-brands fa-youtube"></i></a>`;
    if (t.isEating) {
      return `<div class="timeline-item is-eating"><div class="tl-left">${btn}${yt}
        <span class="tl-tag"><i class="fa-solid fa-utensils"></i> 開吃前5秒</span>
        <div class="tl-body"><span class="tl-eating-food">[${esc(t.foodTitle)}]</span> <span class="tl-text">${esc(t.text)}</span></div></div></div>`;
    }
    return `<div class="timeline-item"><div class="tl-left">${btn}${yt}<span class="tl-text tl-body">${esc(t.text)}</span></div></div>`;
  }).join('');

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
        <div class="location-box">
          <div class="loc-label"><i class="fa-solid fa-location-dot"></i> 外景拍攝地點</div>
          <div class="loc-name">${esc(loc.name)}</div>
          <div class="loc-links">${mapBtn}</div>
        </div>
        <div>
          <div class="section-title"><i class="fa-solid fa-utensils ic-orange"></i> ${ep.isRestaurant ? '同款外食美饌品項' : '現場料理與食材品項'}</div>
          <div class="food-chips">${ep.foods.map(f => `<span class="food-chip"><i class="fa-solid fa-check"></i> ${esc(f)}</span>`).join('')}</div>
        </div>
        <div class="timeline-section">
          <div class="section-title"><i class="fa-regular fa-clock ic-pink"></i> 時間軸（點時間碼跳轉；<i class="fa-brands fa-youtube"></i> 在 YouTube 開啟）</div>
          <div class="timeline-list">${timeline}</div>
        </div>
      </div>
      <div class="player-container">
        <div class="video-viewport" id="viewport-${esc(ep.id)}">
          <button type="button" class="video-cover-btn" ${seekAttrs(0)} aria-label="播放：${esc(ep.title)}">
            <img class="video-cover" src="https://img.youtube.com/vi/${esc(ep.videoId)}/hqdefault.jpg" alt="" loading="lazy">
            <span class="cover-overlay">
              <span class="play-icon-box"><i class="fa-solid fa-play"></i></span>
              <span class="play-tip">點擊載入播放</span>
            </span>
          </button>
        </div>
        <div class="player-ctrl-bar">
          <span><i class="fa-brands fa-youtube ic-red"></i> 官方 YouTube 影片</span>
          <span>點時間碼即開即播</span>
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
      `<a class="nav-btn" href="${n.href}"${n.key === active ? ' aria-current="page"' : ''}><i class="fa-solid ${n.icon}"></i> ${n.label}</a>`
    ).join('');
  }

  const container = document.getElementById('episodesContainer');
  if (!container || !Array.isArray(data)) return;
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

if (typeof module !== 'undefined') module.exports = { renderEpisode, toSec, esc };
