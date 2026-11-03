// 蓮ノ空 播放控制與卡片渲染核心引擎
const activePlayers = {};

function ensurePlayerAndSeek(epId, videoId, targetSeconds) {
  const viewport = document.getElementById(`viewport-${epId}`);
  if (!viewport) return;

  pauseOtherPlayers(epId);

  if (activePlayers[epId] && typeof activePlayers[epId].seekTo === 'function') {
    activePlayers[epId].seekTo(targetSeconds, true);
    activePlayers[epId].playVideo();
    viewport.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  viewport.innerHTML = `<div id="yt-player-${epId}"></div>`;

  if (window.YT && window.YT.Player) {
    initPlayer(epId, videoId, targetSeconds);
  } else {
    window.onYouTubeIframeAPIReady = () => {
      initPlayer(epId, videoId, targetSeconds);
    };
  }

  viewport.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function initPlayer(epId, videoId, targetSeconds) {
  activePlayers[epId] = new YT.Player(`yt-player-${epId}`, {
    videoId: videoId,
    playerVars: {
      start: targetSeconds,
      autoplay: 1,
      playsinline: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: (event) => {
        event.target.seekTo(targetSeconds, true);
        event.target.playVideo();
      }
    }
  });
}

function pauseOtherPlayers(currentEpId) {
  Object.keys(activePlayers).forEach(key => {
    if (key !== currentEpId && activePlayers[key] && typeof activePlayers[key].pauseVideo === 'function') {
      activePlayers[key].pauseVideo();
    }
  });
}

function renderEpisodes(data) {
  const container = document.getElementById('episodesContainer');
  if (!container || !Array.isArray(data)) return;

  container.innerHTML = data.map(ep => {
    return `
      <div class="episode-card" id="card-${ep.id}">
        <div class="card-header">
          <div class="ep-meta">
            <span class="ep-number">${ep.epNum}</span>
            <h2 class="ep-title">${ep.title}</h2>
          </div>
          <div class="cast-tag">
            <i class="fa-solid fa-user-group"></i> ${ep.cast}
          </div>
        </div>

        <div class="card-body">
          <div class="info-pane">
            <div class="location-box">
              <div class="loc-label"><i class="fa-solid fa-location-dot"></i> 外景拍攝地點</div>
              <div class="loc-name">${ep.location.name}</div>
              <div class="loc-links">
                <a class="loc-link-btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ep.location.mapQuery)}" target="_blank" rel="noopener">
                  <i class="fa-solid fa-map-location-dot"></i> Google Maps
                </a>
              </div>
            </div>

            <div>
              <div class="section-title">
                <i class="fa-solid fa-utensils text-orange-500"></i> ${ep.isRestaurant ? '同款外食美饌品項' : '現場料理與食材品項'}
              </div>
              <div class="food-chips">
                ${ep.foods.map(f => `<span class="food-chip"><i class="fa-solid fa-check"></i> ${f}</span>`).join('')}
              </div>
            </div>

            <div>
              <div class="section-title">
                <i class="fa-regular fa-clock text-pink-500"></i> 精確時間軸（點擊直接切入秒數）
              </div>
              <div class="timeline-list">
                ${ep.timeline.map(t => {
                  if (t.isEating) {
                    return `
                      <div class="timeline-item is-eating">
                        <div class="tl-left">
                          <button class="tl-btn" onclick="ensurePlayerAndSeek('${ep.id}', '${ep.videoId}', ${t.sec})" title="跳轉至 ${t.time}">
                            <i class="fa-solid fa-play"></i> ${t.time}
                          </button>
                          <span class="tl-tag"><i class="fa-solid fa-utensils"></i> 開吃前5秒</span>
                          <div>
                            <span class="tl-eating-food">[${t.foodTitle}]</span>
                            <span class="tl-text"> ${t.text}</span>
                          </div>
                        </div>
                      </div>
                    `;
                  } else {
                    return `
                      <div class="timeline-item">
                        <div class="tl-left">
                          <button class="tl-btn" onclick="ensurePlayerAndSeek('${ep.id}', '${ep.videoId}', ${t.sec})" title="跳轉至 ${t.time}">
                            <i class="fa-solid fa-play"></i> ${t.time}
                          </button>
                          <span class="tl-text">${t.text}</span>
                        </div>
                      </div>
                    `;
                  }
                }).join('')}
              </div>
            </div>
          </div>

          <div class="player-container">
            <div class="video-viewport" id="viewport-${ep.id}" onclick="ensurePlayerAndSeek('${ep.id}', '${ep.videoId}', 0)">
              <img class="video-cover" src="https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg" alt="${ep.title}">
              <div class="cover-overlay">
                <div class="play-icon-box">
                  <i class="fa-solid fa-play"></i>
                </div>
                <span class="play-tip">點擊即時載入播放</span>
              </div>
            </div>
            <div class="player-ctrl-bar">
              <span><i class="fa-brands fa-youtube text-red-500"></i> 官方正版播放器</span>
              <span>點選時間軸即開即播</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
