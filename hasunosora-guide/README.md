# 蓮ノ空「せーはす Plus」外景與美食完全指南

專為《蓮ノ空女学院スクールアイドルクラブ》聖地巡禮與外景美食打造的互動導覽網站。

## 目錄結構
```
hasunosora-guide/
├── index.html               # 主頁面（せーはす Plus）
├── css/
│   └── style.css            # 全站共用主題樣式
├── js/
│   ├── app.js               # 核心播放引擎與卡片渲染控制器（共用）
│   └── data-sehasu-plus.js  # 《せーはす Plus》11 集完整資料
└── README.md                # 專案說明文件
```

## 未來擴充新頁面方式（只需 30 秒）
1. 複製 `js/data-sehasu-plus.js` 為新檔（例如 `js/data-link-live.js`），修改裡面的資料。
2. 複製 `index.html` 為新頁面（例如 `link-live.html`）。
3. 將新頁面底部的資料引入替換為：
   ```html
   <script src="js/data-link-live.js"></script>
   <script src="js/app.js"></script>
   <script>
     document.addEventListener('DOMContentLoaded', () => {
       renderEpisodes(linkLiveCustomData);
     });
   </script>
   ```
核心播放器與排版邏輯會自動接手處理，乾淨俐落！
