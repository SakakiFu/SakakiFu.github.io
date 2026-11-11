# SakakiFu.github.io

SakakiFu 的 GitHub Pages 個人站。目前收錄一個專案：

## 🪷 蓮ノ空聖地巡禮與外景美食指南

**▶ 線上瀏覽：https://sakakifu.github.io/hasunosora-guide/**

整理《ラブライブ！蓮ノ空女学院スクールアイドルクラブ》官方 YouTube 節目「せーので！はすのそら！」的外景拍攝地點、同款美食與影片時間軸。點時間碼就能在頁面內跳到對應片段，搭配巡禮地圖規劃聖地巡禮行程。

| 頁面 | 內容 |
| --- | --- |
| [せーはす Plus](https://sakakifu.github.io/hasunosora-guide/index.html) | Plus 系列外景、Aqours × 蓮ノ空 金澤／沼津聯動特別篇 |
| [劇場版大賣祈願](https://sakakifu.github.io/hasunosora-guide/prayer.html) | 《Bloom Garden Party》大賣祈願企劃、蓮ノ三連華甜點對談 |
| [せーはす 103](https://sakakifu.github.io/hasunosora-guide/sehasu103.html) | 房總 BBQ、金澤大外景、浅草ご褒美ロケ |
| [せーはす 104](https://sakakifu.github.io/hasunosora-guide/sehasu104.html) | 金澤外景、學年別企劃 |
| [せーはす 105](https://sakakifu.github.io/hasunosora-guide/sehasu105.html) | Unit 旅、金澤能登外景 |
| [巡禮地圖](https://sakakifu.github.io/hasunosora-guide/map.html) | 全系列景點與餐廳整合地圖 |

### 功能

- **時間軸跳轉**：點時間碼即在底部常駐播放器播放對應片段，美食場景另有標記。
- **巡禮地圖**：Leaflet ＋ 國土地理院底圖，一般外景／美食餐廳分色標記，可依金澤、能登、加賀、關東等區域切換。
- **巡禮清單／打卡**：每個地點可標「⭐ 想去」或「✅ 已踩點」，存在瀏覽器 `localStorage`，可匯出 `.kml`（匯入 Google My Maps）或 `.geojson`。
- **跨集數搜尋與篩選**：店名、料理、成員、時間軸全文搜尋，支援跨 5 個系列搜尋，並可依 Unit（スリーズブーケ／DOLLCHESTRA／みらくらぱーく！／Edel Note／蓮ノ三連華）、打卡狀態、美食片段篩選。
- **Deep Link 分享**：分享特定集數與秒數（`sehasu103.html?ep=ep27&t=1077`）或地圖點位（`map.html?loc=グリルオーツカ`）。

### 收錄進度

| 系列 | 集數 | 時間軸待補 |
| --- | ---: | ---: |
| せーはす Plus | 17 | 6 |
| 劇場版大賣祈願 | 6 | 4 |
| せーはす 103 | 25 | 11 |
| せーはす 104 | 27 | 0 |
| せーはす 105 | 22 | 13 |
| **合計** | **97** | **34** |

全部集數皆已對應 YouTube 影片，地圖收錄 89 筆座標。

## 技術與結構

純 HTML／CSS／JavaScript 靜態網站，無建置步驟、無相依套件，push 到 `main` 即由 GitHub Pages 發布。

```text
.
├── index.html                # 專案列表首頁（https://sakakifu.github.io/）
├── projects.js               # 專案列表資料
├── 404.html                  # GitHub Pages 找不到頁面時顯示
├── README.md                 # 本檔
└── hasunosora-guide/         # 聖地巡禮指南
    ├── *.html                # 各系列頁面與地圖頁
    ├── css/style.css         # 共用 RWD 樣式
    ├── js/
    │   ├── app.js            # 共用渲染、播放器、搜尋、打卡、Deep Link
    │   ├── map.js            # 地圖標記與篩選
    │   ├── data-*.js         # 各系列集數資料
    │   └── map-location-coordinates.js
    ├── scripts/validate_data.py   # 資料檢查
    └── README.md             # 詳細文件與資料格式
```

### 新增專案

1. 在根目錄開新資料夾放專案（例如 `my-project/index.html`）
2. 在 [projects.js](./projects.js) 陣列加一筆，首頁自動出現：

```js
{
  id: "my-project",
  title: "專案名稱",
  desc: "一句話簡介",
  href: "./my-project/",
  emoji: "🛠️",          // 沒封面圖時顯示
  accent: "#3b82f6",
  tags: ["工具"],
  status: "wip",        // active | wip | archived
  updated: "2026-11-12"
}
```

專案數 ≥ 2 時首頁會自動出現標籤篩選；搜尋與標籤狀態會同步到網址（`?q=...&tag=...`）。

### 本機預覽

```powershell
python -m http.server 8000
# 開 http://localhost:8000/hasunosora-guide/
```

### 資料維護

集數資料在 `hasunosora-guide/js/data-*.js`，格式說明見 [hasunosora-guide/README.md](./hasunosora-guide/README.md#集數資料維護)。改完跑一次檢查：

```powershell
python hasunosora-guide/scripts/validate_data.py
```

會列出缺 `videoId`、待補時間軸的集數，以及沒有對應座標的地點。

## 聲明

非官方粉絲整理站，與官方無關。影片版權屬 ©プロジェクトラブライブ！蓮ノ空女学院スクールアイドルクラブ 及各權利人所有；地圖底圖來源為 [地理院タイル](https://maps.gsi.go.jp/development/ichiran.html)。
