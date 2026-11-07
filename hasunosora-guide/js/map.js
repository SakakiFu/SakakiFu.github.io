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

  dataSets.forEach(({ series, data }) => data.forEach(ep => {
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
          episodes: []
        };
        locations.set(key, entry);
      }
      if (!entry.episodes.some(item => item.ep.id === ep.id)) {
        entry.episodes.push({ ep, series, isRestaurant: !!ep.isRestaurant });
      }
      if (ep.isRestaurant) entry.isRestaurant = true;
    });
  }));

  return { locations: [...locations.values()], unlocated: [...unlocated.values()] };
}

function markerIcon(isRestaurant, approximate) {
  const type = isRestaurant ? 'food' : 'spot';
  const icon = isRestaurant ? '🍴' : '<i class="fa-solid fa-location-dot"></i>';
  const uncertainty = approximate ? '<small class="map-marker-uncertain">?</small>' : '';
  return L.divIcon({
    className: 'map-marker-wrapper',
    html: `<span class="map-marker map-marker--${type}">${icon}${uncertainty}</span>`,
    iconSize: [34, 40],
    iconAnchor: [17, 38],
    tooltipAnchor: [0, -34]
  });
}

function renderMapSelection(location) {
  const selection = document.getElementById('mapSelection');
  const approximateLabel = location.approximate
    ? '<span class="map-approximate"><i class="fa-solid fa-circle-question"></i> 約略位置</span>'
    : '';
  const locationLink = location.mapQuery
    ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapQuery)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> 在 Google Maps 查看</a>`
    : '';
  const episodeCards = location.episodes.map(({ ep, series, isRestaurant }) => {
    const foods = (ep.foods || []).length
      ? `<ul class="map-food-list">${ep.foods.map(food => `<li>${escapeMapHtml(food)}</li>`).join('')}</ul>`
      : '';
    const playButton = ep.videoId
      ? `<button type="button" class="map-play-button" data-map-episode="${escapeMapHtml(ep.id)}"><i class="fa-solid fa-play"></i> 播放影片</button>`
      : '<span class="map-no-video">此集尚未提供影片</span>';
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
        ${playButton}
      </article>`;
  }).join('');

  selection.innerHTML = `
    <div class="map-selection-heading">
      <div>
        <p class="map-selection-eyebrow">地點資訊 ${approximateLabel}</p>
        <h2>${escapeMapHtml(location.name)}</h2>
      </div>
      ${locationLink}
    </div>
    <div class="map-episode-grid">${episodeCards}</div>`;

  selection.querySelectorAll('[data-map-episode]').forEach(button => {
    button.addEventListener('click', () => window.playMapEpisode(button.dataset.mapEpisode));
  });

  const firstPlayable = location.episodes.find(({ ep }) => ep.videoId);
  if (firstPlayable) window.playMapEpisode(firstPlayable.ep.id);
  selection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderUnlocatedList(items) {
  if (!items.length) return;
  const section = document.getElementById('mapUnlocated');
  section.hidden = false;
  document.getElementById('mapUnlocatedList').innerHTML = items.map(item =>
    `<li>${escapeMapHtml(item.name)} <span>${item.episodes.map(entry => `${escapeMapHtml(entry.series)}・${escapeMapHtml(entry.episode)}`).join('、')}</span></li>`
  ).join('');
}

function initPilgrimageMap(dataSets) {
  const status = document.getElementById('mapStatus');
  if (!window.L || !L.markerClusterGroup) {
    status.textContent = '地圖程式載入失敗，請確認網路連線或稍後重試。';
    return;
  }

  const { locations, unlocated } = collectMapLocations(dataSets);
  const map = L.map('pilgrimageMap', { scrollWheelZoom: false }).setView([36.4, 137.9], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
    const marker = L.marker([location.lat, location.lng], {
      icon: markerIcon(location.isRestaurant, location.approximate),
      title: `${location.isRestaurant ? '🍴 ' : ''}${location.name}${location.approximate ? '（約略位置）' : ''}`,
      mapCategory: location.isRestaurant ? 'food' : 'spot',
      keyboard: true
    });
    marker.bindTooltip(`${escapeMapHtml(location.name)}${location.approximate ? '（約略位置）' : ''}`);
    marker.on('click', () => renderMapSelection(location));
    return { location, marker };
  });
  markerGroup.addLayers(markers.map(({ marker }) => marker));
  map.addLayer(markerGroup);

  const regionNav = document.getElementById('mapRegions');
  regionNav.innerHTML = MAP_REGIONS.map(region =>
    `<button type="button" class="map-region-button" data-map-region="${region.id}" aria-pressed="false">${region.label}</button>`
  ).join('');

  regionNav.addEventListener('click', event => {
    const button = event.target.closest('[data-map-region]');
    if (!button) return;
    const region = MAP_REGIONS.find(item => item.id === button.dataset.mapRegion);
    regionNav.querySelectorAll('.map-region-button').forEach(item =>
      item.setAttribute('aria-pressed', String(item === button)));

    const visible = region.id === 'all'
      ? markers
      : markers.filter(({ location }) => location.region === region.id);
    markerGroup.clearLayers();
    markerGroup.addLayers(visible.map(({ marker }) => marker));
    const bounds = L.latLngBounds(visible.map(({ location }) => [location.lat, location.lng]));
    if (bounds.isValid()) map.flyToBounds(bounds, { padding: [28, 28], maxZoom: region.id === 'all' ? 5 : 14 });
    else map.flyTo(region.center, region.zoom);
  });

  regionNav.querySelector('[data-map-region="all"]').setAttribute('aria-pressed', 'true');
  const bounds = L.latLngBounds(locations.map(item => [item.lat, item.lng]));
  if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 5 });

  status.textContent = `已標示 ${locations.length} 個地點：粉紅為一般外景，金色 🍴 為同款美食。`;
  renderUnlocatedList(unlocated);
  window.setTimeout(() => map.invalidateSize(), 0);
}

document.addEventListener('DOMContentLoaded', () => {
  const mapDataSets = window.initMapPage(SERIES_DATA);
  initPilgrimageMap(mapDataSets);
});
