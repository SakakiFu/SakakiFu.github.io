// 專案列表資料：新增專案只要在陣列加一筆，首頁會自動渲染
// 欄位：
//   id        唯一識別（英數）
//   title     標題
//   subtitle  副標（可省略）
//   desc      簡介
//   href      專案入口（相對路徑或外部網址）
//   repo      原始碼連結（可省略）
//   cover     封面圖網址（可省略，省略時用 accent 漸層 + emoji）
//   emoji     無封面時顯示的圖示（可省略）
//   accent    主題色
//   tags      標籤陣列，首頁可依標籤篩選
//   status    "active" | "wip" | "archived"
//   updated   最後更新日期 YYYY-MM-DD，列表依此排序
const projects = [
  {
    id: "hasunosora-guide",
    title: "蓮ノ空聖地巡禮與外景美食指南",
    subtitle: "せーので！はすのそら！外景整理",
    desc: "整理「せーはす」各期外景拍攝地點、同款美食與影片時間軸。點時間碼直接跳片段，附巡禮地圖、打卡清單與 KML 匯出。",
    href: "./hasunosora-guide/",
    repo: "https://github.com/SakakiFu/SakakiFu.github.io/tree/main/hasunosora-guide",
    cover: "https://img.youtube.com/vi/leSrnb3lO64/hqdefault.jpg",
    emoji: "🪷",
    accent: "#ff4081",
    tags: ["Love Live!", "蓮ノ空", "聖地巡禮", "地圖"],
    status: "active",
    updated: "2026-11-12",
    links: [
      { label: "巡禮地圖", href: "./hasunosora-guide/map.html" },
      { label: "103", href: "./hasunosora-guide/sehasu103.html" },
      { label: "104", href: "./hasunosora-guide/sehasu104.html" },
      { label: "105", href: "./hasunosora-guide/sehasu105.html" },
      { label: "Plus", href: "./hasunosora-guide/index.html" },
      { label: "大賣祈願", href: "./hasunosora-guide/prayer.html" }
    ]
  }
];
