const MAP_REGIONS = [
  { id: 'kanazawa', label: '石川・金澤市區', center: [36.57, 136.65], zoom: 12 },
  { id: 'noto', label: '石川・能登半島', center: [37.05, 136.92], zoom: 9 },
  { id: 'kaga', label: '石川・加賀溫泉', center: [36.29, 136.35], zoom: 11 },
  { id: 'kanto', label: '東京・關東地區', center: [35.55, 139.35], zoom: 8 },
  { id: 'all', label: '全日本視角', center: [36.4, 137.9], zoom: 5 }
];

const SERIES_DATA = [
  { key: 'plus', series: 'せーはす Plus', data: sehasuPlusData },
  { key: 'prayer', series: '劇場版大賣祈願', data: moviePrayerData },
  { key: 'sehasu103', series: 'せーはす 103', data: sehasu103Data },
  { key: 'sehasu104', series: 'せーはす 104', data: sehasu104Data },
  { key: 'sehasu105', series: 'せーはす 105', data: sehasu105Data }
];

const escapeMapHtml = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const normalizeMapKey = value => String(value ?? '').trim().replace(/\s+/g, ' ');

function mapRegionFor(lat, lng) {
  if (lng >= 135.8 && lng <= 137.8 && lat >= 36 && lat <= 37.8) {
    if (lat >= 36.9) return 'noto';
    if (lat < 36.42) return 'kaga';
    return 'kanazawa';
  }
  if (lat >= 34 && lat <= 37.5 && lng >= 138 && lng <= 141.5) return 'kanto';
  return 'other';
}

function locationKey(location) {
  return normalizeMapKey(location.mapQuery || location.name);
}

function collectMapLocations(dataSets) {
  const coordinates = new Map(mapLocationCoordinates.map(entry => [normalizeMapKey(entry.key), entry]));
  const locations = new Map();
  const unlocated = new Map();

  dataSets.forEach(({ series, href, data }) => data.forEach(ep => {
    const episodeLocations = ep.locations || (ep.location ? [ep.location] : []);
    episodeLocations.forEach(location => {
      const key = locationKey(location);
      const metadata = coordinates.get(key);
      // 沒有座標資料的地點一律列入「尚待補充」，不再用名稱關鍵字猜區域預設點
      const fallback = metadata;
      if (!fallback) {
        const pending = unlocated.get(key) || { name: location.name, episodes: [] };
        if (!pending.episodes.some(item => item.series === series && item.episode === ep.epNum)) {
          pending.episodes.push({ series, episode: ep.epNum });
        }
        unlocated.set(key, pending);
        return;
      }

      let entry = locations.get(key);
      if (!entry) {
        entry = {
          key,
          name: location.name,
          lat: fallback.lat,
          lng: fallback.lng,
          region: fallback.region || mapRegionFor(fallback.lat, fallback.lng),
          approximate: !!fallback.approximate,
          mapQuery: location.mapQuery,
          isRestaurant: !!fallback.food,
          episodes: []
        };
        locations.set(key, entry);
      }
      if (!entry.episodes.some(item => item.ep.id === ep.id)) {
        entry.episodes.push({ ep, series, href: ep._seriesHref || href, isRestaurant: !!ep.isRestaurant });
      }
      if (ep.isRestaurant) entry.isRestaurant = true;
    });
  }));

  return { locations: [...locations.values()], unlocated: [...unlocated.values()] };
}

function markerIcon(isRestaurant, approximate, stampStatus = null, isSelected = false) {
  const type = isRestaurant ? 'food' : 'spot';
  const icon = isRestaurant ? '🍴' : '<i class="fa-solid fa-location-dot"></i>';
  const uncertainty = approximate ? '<small class="map-marker-uncertain">?</small>' : '';
  const stampBadge = stampStatus === 'visited'
    ? '<small class="map-marker-stamp map-marker-stamp--visited" title="已踩點">✓</small>'
    : stampStatus === 'wish'
      ? '<small class="map-marker-stamp map-marker-stamp--wish" title="想去">★</small>'
      : '';
  const selectedClass = isSelected ? ' is-selected' : '';
  return L.divIcon({
    className: 'map-marker-wrapper',
    html: `<span class="map-marker map-marker--${type}${selectedClass}">${icon}${uncertainty}${stampBadge}</span>`,
    iconSize: [34, 40],
    iconAnchor: [17, 38],
    tooltipAnchor: [0, -34]
  });
}

let activeMapSelectionKey = null;

function renderMapSelection(location, { autoPlay = true, scroll = true, updateUrl = true } = {}) {
  activeMapSelectionKey = location.key;
  const selection = document.getElementById('mapSelection');
  const approximateLabel = location.approximate
    ? '<span class="map-approximate"><i class="fa-solid fa-circle-question"></i> 約略位置</span>'
    : '';
  const locationLink = location.mapQuery
    ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapQuery)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Google Maps</a>`
    : '';
  const shareLocBtn = `<button type="button" class="map-back-button" data-share-loc="${escapeMapHtml(location.key)}" data-share-loc-name="${escapeMapHtml(location.name)}" title="複製此聖地地圖連結"><i class="fa-solid fa-link"></i> 分享此點位</button>`;
  const stampButtons = window.HasuApp ? window.HasuApp.renderStampButtonsHtml(location.key, location.name) : '';
  const backToMapBtn = `<button type="button" class="map-back-button" id="mapBackToTop"><i class="fa-solid fa-arrow-up"></i> 回到地圖</button>`;

  const episodeCards = location.episodes.map(({ ep, series, href, isRestaurant }) => {
    const foods = (ep.foods || []).length
      ? `<ul class="map-food-list">${ep.foods.map(food => `<li>${escapeMapHtml(food)}</li>`).join('')}</ul>`
      : '';
    const playButton = ep.videoId
      ? `<button type="button" class="map-play-button" data-map-episode="${escapeMapHtml(ep.id)}"><i class="fa-solid fa-play"></i> 播放影片</button>`
      : '<span class="map-no-video">此集尚未提供影片</span>';
    const pageLink = href
      ? `<a class="map-ep-page-link" href="${escapeMapHtml(href)}"><i class="fa-regular fa-clock"></i> 查看完整時間軸</a>`
      : '';
    return `
      <article class="map-episode-card" id="${escapeMapHtml(ep.id)}">
        <div class="map-episode-meta">
          <span>${escapeMapHtml(series)}</span>
          <span>${escapeMapHtml(ep.epNum)}</span>
          ${isRestaurant ? '<span class="map-food-label"><i class="fa-solid fa-utensils"></i> 同款美食</span>' : '<span class="map-spot-label">外景</span>'}
        </div>
        <h3>${escapeMapHtml(ep.title)}</h3>
        <p>${escapeMapHtml(ep.cast || '')}</p>
        ${foods}
        <div class="map-ep-card-actions">
          ${playButton}
          ${pageLink}
        </div>
      </article>`;
  }).join('');

  selection.innerHTML = `
    <div class="map-selection-heading">
      <div>
        <p class="map-selection-eyebrow">地點資訊 ${approximateLabel}</p>
        <h2>${escapeMapHtml(location.name)}</h2>
      </div>
      <div class="map-selection-actions">
        ${stampButtons}
        ${shareLocBtn}
        ${locationLink}
        ${backToMapBtn}
      </div>
    </div>
    <div class="map-episode-grid">${episodeCards}</div>`;

  selection.querySelectorAll('[data-map-episode]').forEach(button => {
    button.addEventListener('click', () => window.playMapEpisode(button.dataset.mapEpisode));
  });

  const backBtn = document.getElementById('mapBackToTop');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      document.getElementById('pilgrimageMap').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  if (updateUrl && typeof history !== 'undefined' && history.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.set('loc', location.key);
    history.replaceState(null, '', url.toString());
  }

  if (autoPlay) {
    const firstPlayable = location.episodes.find(({ ep }) => ep.videoId);
    if (firstPlayable) window.playMapEpisode(firstPlayable.ep.id);
  }
  if (scroll) {
    selection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderUnlocatedList(items) {
  if (!items.length) return;
  const section = document.getElementById('mapUnlocated');
  section.hidden = false;
  document.getElementById('mapUnlocatedList').innerHTML = items.map(item =>
    `<li>${escapeMapHtml(item.name)} <span>${item.episodes.map(entry => `${escapeMapHtml(entry.series)}・${escapeMapHtml(entry.episode)}`).join('、')}</span></li>`
  ).join('');
}

function renderMapFilterToolbar() {
  const holder = document.getElementById('mapFilterToolbar');
  if (!holder || !window.HasuApp) return;
  const unitButtons = window.HasuApp.UNIT_FILTERS.map((u, idx) =>
    `<button type="button" class="filter-chip${idx === 0 ? ' is-active' : ''}" data-map-unit="${u.id}" aria-pressed="${idx === 0}">${escapeMapHtml(u.short)}</button>`
  ).join('');

  holder.innerHTML = `
    ${window.HasuApp.renderPilgrimageBarHtml()}
    <div class="filter-panel">
      <div class="search-row">
        <div class="search-input-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="search" id="mapSearchInput" class="search-input" placeholder="搜尋地圖上的店名、同款美食、集數、聲優…" aria-label="搜尋地圖地點" autocomplete="off">
          <button type="button" id="mapSearchClear" class="search-clear" hidden aria-label="清除搜尋"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <label class="food-toggle">
          <input type="checkbox" id="mapFoodOnly">
          <i class="fa-solid fa-utensils ic-orange"></i> 只看美食餐廳
        </label>
      </div>
      <div class="filter-row">
        <div class="unit-filter-group" id="mapUnitFilterGroup" role="group" aria-label="Unit 與成員篩選">
          ${unitButtons}
        </div>
        <div class="stamp-filter-group" id="mapStampFilterGroup" role="group" aria-label="巡禮打卡狀態篩選">
          <button type="button" class="filter-chip is-active" data-map-stamp="all" aria-pressed="true">全部地點</button>
          <button type="button" class="filter-chip filter-chip--wish" data-map-stamp="wish" aria-pressed="false"><i class="fa-solid fa-star"></i> 只看想去</button>
          <button type="button" class="filter-chip filter-chip--visited" data-map-stamp="visited" aria-pressed="false"><i class="fa-solid fa-check"></i> 只看已踩點</button>
        </div>
      </div>
    </div>`;
}

function locationMatchesFilters(location, state) {
  if (state.region !== 'all' && location.region !== state.region) return false;
  if (state.foodOnly && !location.isRestaurant) return false;
  if (state.stamp !== 'all') {
    const stamp = window.HasuApp ? window.HasuApp.getStamp(location.key) : null;
    if (stamp !== state.stamp) return false;
  }
  if (state.unit !== 'all' && window.HasuApp) {
    const hasUnitEp = location.episodes.some(({ ep }) => window.HasuApp.episodeMatchesUnit(ep, state.unit));
    if (!hasUnitEp) return false;
  }
  if (state.query && window.HasuApp) {
    const q = state.query.trim().toLowerCase();
    const locMatch = `${location.name} ${location.mapQuery || ''}`.toLowerCase().includes(q);
    const epMatch = location.episodes.some(({ ep }) => window.HasuApp.episodeMatchesQuery(ep, state.query));
    if (!locMatch && !epMatch) return false;
  }
  return true;
}

function initPilgrimageMap(dataSets) {
  const status = document.getElementById('mapStatus');
  if (!window.L || !L.markerClusterGroup) {
    status.textContent = '地圖程式載入失敗，請確認網路連線或稍後重試。';
    return;
  }

  renderMapFilterToolbar();

  const { locations, unlocated } = collectMapLocations(dataSets);
  const map = L.map('pilgrimageMap', { scrollWheelZoom: false, minZoom: 5, maxZoom: 19 }).setView([36.4, 137.9], 5);
  // 底圖：國土地理院「淡色地圖」（僅涵蓋日本；原生圖磚到 18 級，19 級會放大 18 級圖磚）
  L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
    minZoom: 5,
    maxZoom: 19,
    maxNativeZoom: 18,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>'
  }).addTo(map);

  const markerGroup = L.markerClusterGroup({
    maxClusterRadius: 42,
    showCoverageOnHover: false,
    iconCreateFunction: cluster => {
      const childMarkers = cluster.getAllChildMarkers();
      const foodCount = childMarkers.filter(marker => marker.options.mapCategory === 'food').length;
      const category = foodCount === 0 ? 'spot' : foodCount === childMarkers.length ? 'food' : 'mixed';
      return L.divIcon({
        className: 'map-cluster-wrapper',
        html: `<span class="map-cluster map-cluster--${category}">${cluster.getChildCount()}</span>`,
        iconSize: [42, 42]
      });
    }
  });

  const markers = locations.map(location => {
    const stamp = window.HasuApp ? window.HasuApp.getStamp(location.key) : null;
    const marker = L.marker([location.lat, location.lng], {
      icon: markerIcon(location.isRestaurant, location.approximate, stamp, false),
      title: `${location.isRestaurant ? '🍴 ' : ''}${location.name}${location.approximate ? '（約略位置）' : ''}`,
      mapCategory: location.isRestaurant ? 'food' : 'spot',
      keyboard: true
    });
    marker.bindTooltip(`${escapeMapHtml(location.name)}${location.approximate ? '（約略位置）' : ''}`);
    marker.on('click', () => {
      selectMapLocation(location, { autoPlay: true, scroll: true, updateUrl: true });
    });
    return { location, marker };
  });

  function refreshMarkerIcons() {
    markers.forEach(({ location, marker }) => {
      const stamp = window.HasuApp ? window.HasuApp.getStamp(location.key) : null;
      const isSelected = activeMapSelectionKey === location.key;
      marker.setIcon(markerIcon(location.isRestaurant, location.approximate, stamp, isSelected));
    });
  }

  function selectMapLocation(location, options = {}) {
    activeMapSelectionKey = location.key;
    refreshMarkerIcons();
    renderMapSelection(location, options);
  }

  markerGroup.addLayers(markers.map(({ marker }) => marker));
  map.addLayer(markerGroup);

  const mapFilterState = {
    region: 'all',
    query: '',
    unit: 'all',
    stamp: 'all',
    foodOnly: false
  };

  function applyMapFilters({ fly = false, updateUrl = true } = {}) {
    const visible = markers.filter(({ location }) => locationMatchesFilters(location, mapFilterState));
    markerGroup.clearLayers();
    markerGroup.addLayers(visible.map(({ marker }) => marker));

    if (fly) {
      const regionObj = MAP_REGIONS.find(item => item.id === mapFilterState.region) || MAP_REGIONS[MAP_REGIONS.length - 1];
      const bounds = L.latLngBounds(visible.map(({ location }) => [location.lat, location.lng]));
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [28, 28], maxZoom: mapFilterState.region === 'all' && visible.length > 10 ? 6 : 14 });
      } else {
        map.flyTo(regionObj.center, regionObj.zoom);
      }
    }

    const counts = window.HasuApp ? window.HasuApp.getStampCounts(locations.map(l => l.key)) : { wish: 0, visited: 0 };
    status.textContent = `目前顯示 ${visible.length} / ${locations.length} 個聖地（⭐ 想去 ${counts.wish}｜✅ 已踩點 ${counts.visited}）。粉紅為一般外景，金色 🍴 為同款美食。`;

    if (updateUrl && typeof history !== 'undefined' && history.replaceState) {
      const url = new URL(window.location.href);
      if (mapFilterState.region !== 'all') url.searchParams.set('region', mapFilterState.region);
      else url.searchParams.delete('region');
      if (mapFilterState.query) url.searchParams.set('q', mapFilterState.query);
      else url.searchParams.delete('q');
      if (mapFilterState.unit !== 'all') url.searchParams.set('unit', mapFilterState.unit);
      else url.searchParams.delete('unit');
      if (mapFilterState.stamp !== 'all') url.searchParams.set('stamp', mapFilterState.stamp);
      else url.searchParams.delete('stamp');
      if (mapFilterState.foodOnly) url.searchParams.set('food', '1');
      else url.searchParams.delete('food');
      history.replaceState(null, '', url.toString());
    }
  }

  const regionNav = document.getElementById('mapRegions');
  regionNav.innerHTML = MAP_REGIONS.map(region =>
    `<button type="button" class="map-region-button" data-map-region="${region.id}" aria-pressed="${region.id === 'all'}">${region.label}</button>`
  ).join('');

  regionNav.addEventListener('click', event => {
    const button = event.target.closest('[data-map-region]');
    if (!button) return;
    mapFilterState.region = button.dataset.mapRegion;
    regionNav.querySelectorAll('.map-region-button').forEach(item =>
      item.setAttribute('aria-pressed', String(item === button)));
    applyMapFilters({ fly: true });
  });

  // 綁定搜尋與篩選控制項
  const searchInput = document.getElementById('mapSearchInput');
  const searchClear = document.getElementById('mapSearchClear');
  const foodOnly = document.getElementById('mapFoodOnly');
  const unitGroup = document.getElementById('mapUnitFilterGroup');
  const stampGroup = document.getElementById('mapStampFilterGroup');

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      mapFilterState.query = e.target.value;
      if (searchClear) searchClear.hidden = !mapFilterState.query;
      applyMapFilters({ fly: false });
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      mapFilterState.query = '';
      if (searchInput) searchInput.value = '';
      searchClear.hidden = true;
      applyMapFilters({ fly: false });
    });
  }
  if (foodOnly) {
    foodOnly.addEventListener('change', e => {
      mapFilterState.foodOnly = e.target.checked;
      applyMapFilters({ fly: false });
    });
  }
  if (unitGroup) {
    unitGroup.addEventListener('click', e => {
      const btn = e.target.closest('[data-map-unit]');
      if (!btn) return;
      mapFilterState.unit = btn.dataset.mapUnit;
      unitGroup.querySelectorAll('[data-map-unit]').forEach(el => {
        const active = el === btn;
        el.classList.toggle('is-active', active);
        el.setAttribute('aria-pressed', String(active));
      });
      applyMapFilters({ fly: true });
    });
  }
  if (stampGroup) {
    stampGroup.addEventListener('click', e => {
      const btn = e.target.closest('[data-map-stamp]');
      if (!btn) return;
      mapFilterState.stamp = btn.dataset.mapStamp;
      stampGroup.querySelectorAll('[data-map-stamp]').forEach(el => {
        const active = el === btn;
        el.classList.toggle('is-active', active);
        el.setAttribute('aria-pressed', String(active));
      });
      applyMapFilters({ fly: true });
    });
  }

  // 當打卡狀態變更時，即時更新地圖標記徽章與篩選結果
  window.addEventListener('pilgrimage:change', () => {
    refreshMarkerIcons();
    applyMapFilters({ fly: false, updateUrl: false });
  });

  const bounds = L.latLngBounds(locations.map(item => [item.lat, item.lng]));
  if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 5 });

  renderUnlocatedList(unlocated);
  applyMapFilters({ fly: false, updateUrl: false });

  // 處理地圖頁 URL Deep Linking (?loc=...&region=...&unit=...&q=...&stamp=...)
  const params = new URLSearchParams(window.location.search);
  const regionParam = params.get('region');
  const qParam = params.get('q');
  const unitParam = params.get('unit');
  const stampParam = params.get('stamp');
  const foodParam = params.get('food');
  const locParam = params.get('loc');

  let hasFilterParam = false;
  if (regionParam && MAP_REGIONS.some(r => r.id === regionParam)) {
    mapFilterState.region = regionParam;
    regionNav.querySelectorAll('.map-region-button').forEach(btn =>
      btn.setAttribute('aria-pressed', String(btn.dataset.mapRegion === regionParam)));
    hasFilterParam = true;
  }
  if (qParam && searchInput) {
    mapFilterState.query = qParam;
    searchInput.value = qParam;
    if (searchClear) searchClear.hidden = false;
    hasFilterParam = true;
  }
  if (unitParam && unitGroup) {
    mapFilterState.unit = unitParam;
    unitGroup.querySelectorAll('[data-map-unit]').forEach(el => {
      const active = el.dataset.mapUnit === unitParam;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-pressed', String(active));
    });
    hasFilterParam = true;
  }
  if (stampParam && ['all', 'wish', 'visited'].includes(stampParam) && stampGroup) {
    mapFilterState.stamp = stampParam;
    stampGroup.querySelectorAll('[data-map-stamp]').forEach(el => {
      const active = el.dataset.mapStamp === stampParam;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-pressed', String(active));
    });
    hasFilterParam = true;
  }
  if ((foodParam === '1' || foodParam === 'true') && foodOnly) {
    mapFilterState.foodOnly = true;
    foodOnly.checked = true;
    hasFilterParam = true;
  }

  if (hasFilterParam) {
    applyMapFilters({ fly: !locParam, updateUrl: false });
  }

  if (locParam) {
    const normTarget = normalizeMapKey(locParam).toLowerCase();
    const found = markers.find(({ location }) =>
      location.key.toLowerCase() === normTarget ||
      location.name.toLowerCase().includes(normTarget) ||
      (location.mapQuery && location.mapQuery.toLowerCase().includes(normTarget))
    );
    if (found) {
      window.setTimeout(() => {
        if (!markerGroup.hasLayer(found.marker)) {
          markerGroup.addLayer(found.marker);
        }
        markerGroup.zoomToShowLayer(found.marker, () => {
          map.setView([found.location.lat, found.location.lng], Math.max(map.getZoom(), 16));
          found.marker.openTooltip();
        });
        selectMapLocation(found.location, { autoPlay: false, scroll: true, updateUrl: false });
      }, 120);
    }
  }

  window.setTimeout(() => map.invalidateSize(), 0);
}

document.addEventListener('DOMContentLoaded', () => {
  const mapDataSets = window.initMapPage(SERIES_DATA);
  initPilgrimageMap(mapDataSets);
});
