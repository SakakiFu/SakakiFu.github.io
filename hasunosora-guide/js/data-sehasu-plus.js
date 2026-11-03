// 《せーので！はすのそら！Plus》11 集完整外景與美食資料
const sehasuPlusData = [
  {
    id: "bbq1",
    epNum: "EP 01",
    title: "STEP UP ! BBQ篇① 食材升級大挑戰",
    cast: "全員出陣（8人齊聚）",
    videoId: "leSrnb3lO64",
    isRestaurant: false,
    location: {
      name: "東京近郊露營場・戶外BBQ設施",
      mapQuery: "東京 近郊 キャンプ BBQ"
    },
    foods: ["挑戰食材：綜合蔬菜拼盤（玉米、南瓜、洋蔥、青椒）"],
    timeline: [
      { time: "00:00", sec: 0, text: "節目改版『せーはす Plus』開場與升級食材企劃說明" },
      { time: "04:53", sec: 293, text: "心靈契合答題挑戰（爭奪蔬菜食材）" },
      { time: "07:45", sec: 465, text: "夏季代表曲一致答題（全員回答：夏めきペイン成功）" },
      { time: "12:12", sec: 732, text: "夏天想去的地方一致回答（全員回答：海邊成功，獲得蔬菜！）" },
      { time: "12:54", sec: 774, text: "精準1kg量水挑戰（爭取調味料，櫻井最後失手爆量失敗）" }
    ]
  },
  {
    id: "bbq2",
    epNum: "EP 02",
    title: "STEP UP ! BBQ篇② 絕體絕命食材爭奪戰",
    cast: "全員出陣（8人齊聚）",
    videoId: "n4GsCWCnYSg",
    isRestaurant: false,
    location: {
      name: "東京近郊露營場・戶外BBQ設施",
      mapQuery: "東京 近郊 キャンプ BBQ"
    },
    foods: ["挑戰食材：調味料（戶外香料ほりにし、白鹽）、綜合海鮮（鮮蝦、文蛤）"],
    timeline: [
      { time: "00:43", sec: 43, text: "90秒撈金魚撈球挑戰（撈取成功獲得高級調味料！）" },
      { time: "02:39", sec: 159, text: "字數限制接龍挑戰（三度挑戰最終因秒數不足飲恨）" },
      { time: "08:36", sec: 516, text: "彈瓶蓋停格挑戰（爭奪海鮮食材）" },
      { time: "12:15", sec: 735, text: "來栖凜彈瓶蓋名場面：力量過猛直接將瓶蓋轟飛出鏡頭外" },
      { time: "15:30", sec: 930, text: "三宅美羽最後一投奇蹟壓線停格！成功保住海鮮！" }
    ]
  },
  {
    id: "bbq3",
    epNum: "EP 03",
    title: "STEP UP ! BBQ篇③ 盛夏BBQ盛宴開吃！",
    cast: "全員出陣（8人齊聚）",
    videoId: "zDpb_P1UdWk",
    isRestaurant: false,
    location: {
      name: "東京近郊露營場・戶外BBQ設施",
      mapQuery: "東京 近郊 キャンプ BBQ"
    },
    foods: [
      "炭火現烤綜合蔬菜（烤南瓜、玉米、青椒、洋蔥）",
      "特選和牛燒肉佐戶外萬用香料（ほりにし）",
      "鐵板日式蔬菜炒麵（野菜たっぷり焼きそば）",
      "現烤大文蛤與海鮮"
    ],
    timeline: [
      { time: "01:42", sec: 102, text: "食材救濟台詞挑戰：令人心動的夏日告白（獲得特選燒肉！）" },
      { time: "05:27", sec: 327, text: "生火備料：進藤天音細心在烤蔬菜上壓出漂亮菱格烤痕" },
      { time: "10:35", sec: 635, text: "乾杯開動！全員就座準備大啖烤肉盛宴" },
      { 
        time: "11:15", 
        sec: 675, 
        isEating: true, 
        foodTitle: "炭火現烤綜合蔬菜",
        text: "開吃前5秒：夾起烤出焦香的軟嫩南瓜，大口品嚐原汁甜味" 
      },
      { 
        time: "13:58", 
        sec: 838, 
        isEating: true, 
        foodTitle: "特選和牛燒肉佐萬能香料（ほりにし）",
        text: "開吃前5秒：和牛燒肉滋滋作響，沾上香料大口咬下" 
      },
      { 
        time: "15:05", 
        sec: 905, 
        isEating: true, 
        foodTitle: "鐵板日式蔬菜炒麵",
        text: "開吃前5秒：翻炒細麵炒麵上桌，全員大口吸麵" 
      },
      { time: "16:48", sec: 1008, text: "圍爐閒聊如果沒當聲優會想做什麼職業（圖書館員、醫療等）" }
    ]
  },
  {
    id: "enoshima1",
    epNum: "EP 04",
    title: "STEP UP ! 旅 江之島水族館篇",
    cast: "來栖凜 ＆ 進藤天音",
    videoId: "6NghpxRDReI",
    isRestaurant: true,
    location: {
      name: "新江之島水族館（えのすい）",
      mapQuery: "新江ノ島水族館"
    },
    foods: ["水族館限定・海洋生物造型熱蜂蜜蛋糕（含彩色爆爆晶球）", "巨峰葡萄冰淇淋"],
    timeline: [
      { time: "00:00", sec: 0, text: "開場企劃說明：抽籤分組背景與水族館前集合" },
      { time: "03:26", sec: 206, text: "相模灣大水槽參觀，兩人討論最喜愛的魚類" },
      { time: "06:41", sec: 401, text: "海豚表演看台欣賞海豚秀，聊童年回憶" },
      { time: "09:49", sec: 589, text: "水母夢幻廳（クラゲファンタジーホール）觀賞光影秀" },
      { 
        time: "12:01", 
        sec: 721, 
        isEating: true, 
        foodTitle: "水族館限定・海洋造型蜂蜜蛋糕（水族館カステラ）",
        text: "開吃前5秒：在露天海景看台享用剛出爐、帶有彩色晶球的造型蜂蜜蛋糕" 
      },
      { time: "12:45", sec: 765, text: "露天看台深度對談：發現彼此意外的真實一面" },
      { time: "15:36", sec: 936, text: "水族館旁由比濱沙灘漫步散策、踏浪與拍照" },
      { time: "18:15", sec: 1095, text: "海風吹拂下的外景總結與心得分享" }
    ]
  },
  {
    id: "ginza_tea",
    epNum: "EP 05",
    title: "STEP UP ! 旅 念願的大小姐下午茶",
    cast: "葉山風花 ＆ 三宅美羽",
    videoId: "Ey0MzdAH0qQ",
    isRestaurant: true,
    location: {
      name: "Tea Bloomy 銀座店",
      mapQuery: "Tea Bloomy 銀座"
    },
    foods: [
      "草莓主題下午茶塔（草莓塔、白桃玫瑰果凍、玫瑰馬卡龍）",
      "迎賓草莓果香冷飲",
      "特調大吉嶺花果茶",
      "鹹點開胃菜：特製迷你肉餡彩椒",
      "解膩主食：特製鮭魚高湯茶泡飯（鮭茶漬け）"
    ],
    timeline: [
      { time: "00:00", sec: 0, text: "開場：三宅大小姐與隨從執事葉山風花的逗趣設定" },
      { time: "02:13", sec: 133, text: "入店入座，三宅說明想在出外景時盡情大吃的願望" },
      { 
        time: "06:07", 
        sec: 367, 
        isEating: true, 
        foodTitle: "乾杯迎賓特調：草莓花香冷飲（おちやす乾杯）",
        text: "開吃前5秒：大小姐與執事碰杯，品嚐帶有花果香氣的迎賓冷飲" 
      },
      { 
        time: "07:07", 
        sec: 427, 
        isEating: true, 
        foodTitle: "鹹點開胃菜：肉汁內餡特製迷你彩椒",
        text: "開吃前5秒：執事替大小姐分菜，品嚐爆汁小彩椒" 
      },
      { 
        time: "09:46", 
        sec: 586, 
        isEating: true, 
        foodTitle: "精選甜點：特製玫瑰草莓馬卡龍",
        text: "開吃前5秒：享用口感酥脆輕柔的粉色玫瑰草莓馬卡龍" 
      },
      { 
        time: "13:32", 
        sec: 812, 
        isEating: true, 
        foodTitle: "主廚特選甜點：草莓千層招牌點心",
        text: "開吃前5秒：大口品嚐主廚推薦的鬆軟招牌草莓甜品" 
      },
      { 
        time: "16:03", 
        sec: 963, 
        isEating: true, 
        foodTitle: "解膩主食：特製鮭魚高湯茶泡飯",
        text: "開吃前5秒：大小姐豪邁將整壺熱高湯淋在鮭魚茶泡飯上並大口品嚐" 
      },
      { time: "16:45", sec: 1005, text: "邊吃茶泡飯邊談論團內吐槽擔當與真心話總結" }
    ]
  },
  {
    id: "vspark",
    epNum: "EP 06",
    title: "STEP UP ! 旅 VS PARK 雙部長白熱五番勝負",
    cast: "楡井希実 ＆ 野中ここな",
    videoId: "zSNOZ5InzO8",
    isRestaurant: false,
    location: {
      name: "VS PARK 運動娛樂場館",
      mapQuery: "VS PARK"
    },
    foods: ["運動補給水分與能量飲料"],
    timeline: [
      { time: "00:00", sec: 0, text: "雙部長開場，野中擔任主持讓楡井盡情放飛" },
      { time: "04:30", sec: 270, text: "第一戰：『ニゲキル』猛獸賽跑逃脫挑戰（野中獲勝）" },
      { time: "08:50", sec: 530, text: "第二戰：『VS スイミング』座位瘋狂揮手游泳對決" },
      { time: "10:45", sec: 645, text: "第三戰：反應燈光按鈕競速（楡井 105:88 獲勝）" },
      { time: "12:45", sec: 765, text: "第四戰：『ボンバーアタック』高台巨球衝撞對決" },
      { time: "15:25", sec: 925, text: "最終決戰：『Jump×Jump』旋轉跳躍避障，野中獲總冠軍！" },
      { time: "19:15", sec: 1155, text: "懲罰遊戲：楡井希実演繹罕見的『溫柔年上大姐姐系女友』告白" }
    ]
  },
  {
    id: "buffet",
    epNum: "EP 07",
    title: "STEP UP ! 旅 新宿海鮮 Buffet「僅限一輪」挑戰",
    cast: "菅叶和 ＆ 櫻井陽菜",
    videoId: "ejV9WucHGs8",
    isRestaurant: true,
    location: {
      name: "海鮮ブッフェダイニング 銀座八芳 新宿店",
      mapQuery: "銀座八芳 新宿店"
    },
    foods: [
      "豪華海鮮：清蒸帝王蟹腳、松葉蟹腳、甜蝦生魚片、蟹膏",
      "招牌熟食：現煎特選烤牛肉佐洋蔥和風醬、現切牛舌",
      "中式美饌：現烤脆皮北京烤鴨夾餅、黑醋咕咾肉",
      "日式咖哩飯（櫻井陽菜特選）",
      "水果甜點：香甜新鮮荔枝、哈密瓜、精緻一口蛋糕"
    ],
    timeline: [
      { time: "00:00", sec: 0, text: "開場：菅叶和與櫻井陽菜的新宿美食企劃說明" },
      { time: "02:40", sec: 160, text: "規則設定：『僅限巡禮一輪』考驗兩人食量與排盤美學" },
      { time: "03:40", sec: 220, text: "菅叶和裝盤：豪氣拿取牛舌、帝王蟹與最愛的荔枝" },
      { time: "09:10", sec: 550, text: "櫻井陽菜裝盤：發揮打工經驗，裝滿炸蝦與必備咖哩" },
      { 
        time: "08:35", 
        sec: 515, 
        isEating: true, 
        foodTitle: "鮮甜清蒸帝王蟹腳與松葉蟹肉",
        text: "開吃前5秒：剪開肥嫩帝王蟹殼，菅叶和大口吸入滿滿鮮甜蟹肉" 
          },
      { 
        time: "12:00", 
        sec: 720, 
        isEating: true, 
        foodTitle: "現煎特選烤牛肉佐洋蔥和風醬汁",
        text: "開吃前5秒：淋上濃郁洋蔥醬，品嚐軟嫩多汁的現切薄片烤牛肉" 
      },
      { 
        time: "13:35", 
        sec: 815, 
        isEating: true, 
        foodTitle: "現烤脆皮北京烤鴨夾餅",
        text: "開吃前5秒：包著清脆大蔥與烤鴨薄餅，大口享受油脂香氣" 
      },
      { time: "14:40", sec: 880, text: "暢聊：櫻井在彩排時把菅叶和當成媽媽依賴的溫馨往事" },
      { time: "22:30", sec: 1350, text: "兩人完全完食，直呼太幸福滿足" }
    ]
  },
  {
    id: "enoshima2",
    epNum: "EP 08",
    title: "STEP UP ! 旅 江之島吻仔魚海鮮丼大滿足",
    cast: "來栖凜 ＆ 進藤天音",
    videoId: "cnbLz_BlzcQ",
    isRestaurant: true,
    location: {
      name: "しらす問屋 とびっちょ 江の島弁財天仲見世通り店",
      mapQuery: "しらす問屋 とびっちょ 江の島弁財天仲見世通り店"
    },
    foods: [
      "來栖凜點：釜揚吻仔魚蔥鮪鮭魚卵丼（釜揚げしらすネギトロいくら丼）",
      "進藤天音點：釜揚吻仔魚蔥鮪鮭魚丼（釜揚げしらすネギトロサーモン丼）",
      "合點推薦：究極現烤特大文蛤（究極の焼きハマグリ / 大蒜醬油風味）"
    ],
    timeline: [
      { time: "00:00", sec: 0, text: "江之島大橋集合，正式登陸江之島本島" },
      { time: "02:41", sec: 161, text: "弁財天仲見世通商店街散策，進藤展示掏貝狂熱" },
      { time: "04:54", sec: 294, text: "抵達名店「とびっちょ」，激烈選擇障礙後決定餐點" },
      { time: "08:06", sec: 486, text: "特大碗公海鮮丼與味噌湯端上桌，兩人驚呼像珠寶盒" },
      { 
        time: "09:58", 
        sec: 598, 
        isEating: true, 
        foodTitle: "釜揚吻仔魚蔥鮪鮭魚卵丼 ＆ 鮭魚丼雙巨碗",
        text: "開吃前5秒：雙手合十開動！大口扒下第一口鮮美吻仔魚與海鮮丼" 
      },
      { 
        time: "11:13", 
        sec: 673, 
        isEating: true, 
        foodTitle: "究極現烤特大文蛤（究極の焼きハマグリ）",
        text: "開吃前5秒：猜拳勝利！大口咬下飽滿多汁的大蒜醬油現烤特大文蛤" 
      },
      { time: "11:45", sec: 705, text: "大快朵頤中暢聊：人類來自大海的哲學話題與私下興趣" },
      { time: "17:21", sec: 1041, text: "大份量完食！兩人拍肚子直呼超級飽足" },
      { time: "18:01", sec: 1081, text: "老街散步消食、回顧水族館與海鮮美食一日行" }
    ]
  },
  {
    id: "tondemi",
    epNum: "EP 09",
    title: "STEP UP ! 旅 平和島 TONDEMI 極限體能挑戰",
    cast: "葉山風花 ＆ 三宅美羽",
    videoId: "citDTRXo_Rc",
    isRestaurant: false,
    location: {
      name: "TONDEMI 平和島（トンデミ平和島）",
      mapQuery: "トンデミ平和島"
    },
    foods: ["運動能量水分補給"],
    timeline: [
      { time: "00:00", sec: 0, text: "換上排舞運動私服，三宅美羽想在大設施全力瘋玩" },
      { time: "03:15", sec: 195, text: "項目一：彈跳床躲避球對決（葉山風花勝出）" },
      { time: "06:10", sec: 370, text: "項目二：『Air Run』巨型充氣障礙跑道競速" },
      { time: "09:40", sec: 580, text: "項目三：巨型充氣人體保齡球（葉山 11:8 險勝）" },
      { time: "12:15", sec: 735, text: "項目四：相撲彈跳柱推擠大戰（葉山被推落墊子）" },
      { time: "15:35", sec: 935, text: "極限考驗：7公尺垂直下落巨大滑梯懸空倒數滑落" },
      { time: "18:00", sec: 1080, text: "三宅克服心理障礙勇敢鬆手急速落下，直呼心跳加速" }
    ]
  },
  {
    id: "yokohama",
    epNum: "EP 10",
    title: "STEP UP ! 旅 雙部長橫濱漫談與滑蛋蛋包飯",
    cast: "楡井希実 ＆ 野中ここな",
    videoId: "LAPj8WjRNJg",
    isRestaurant: true,
    location: {
      name: "ふわとろオムライスとチーズカフェ たまごのきもち。 横浜駅前店",
      mapQuery: "たまごのきもち。 横浜駅前店"
    },
    foods: [
      "熔岩起司漢堡排多蜜醬滑蛋蛋包飯（切開流心）",
      "招牌溫泉蛋凱撒沙拉配現刨起司與麵包丁",
      "漂浮哈密瓜冰淇淋蘇打汽水",
      "起司奶蓋冰茶"
    ],
    timeline: [
      { time: "00:00", sec: 0, text: "開場：雙部長來到野中為楡井精心挑選的蛋包飯名店" },
      { time: "02:40", sec: 160, text: "入座看菜單：點了第一名的漢堡排起司蛋包飯與沙拉" },
      { time: "04:10", sec: 250, text: "候餐閒聊：楡井喜歡在咖啡廳看書的休閒，以及團內讀書熱潮" },
      { 
        time: "08:05", 
        sec: 485, 
        isEating: true, 
        foodTitle: "招牌溫泉蛋凱撒沙拉",
        text: "開吃前5秒：劃破半熟溫泉蛋，拌入起司與香脆麵包丁大口品嚐" 
      },
      { 
        time: "08:35", 
        sec: 515, 
        isEating: true, 
        foodTitle: "熔岩起司漢堡排多蜜醬半熟滑蛋蛋包飯",
        text: "開吃前5秒：用刀子劃開蓬鬆蛋包！瀑布般半熟滑蛋覆蓋飽滿厚實的漢堡排" 
      },
      { time: "09:30", sec: 570, text: "大口狂讚肉質扎實與蛋香濃郁，榆井露出幸福滿滿的笑容" },
      { time: "11:00", sec: 660, text: "邊吃邊談心：聊起後輩們的成長、兩人身為部長的真心話" },
      { time: "15:20", sec: 920, text: "餐後總結：在滿滿的治癒與飽足中為雙部長外景畫下句點" }
    ]
  },
  {
    id: "bowling",
    epNum: "EP 11",
    title: "STEP UP ! 旅 全員保齡球奇蹟對決",
    cast: "菅叶和 ＆ 櫻井陽菜",
    videoId: "PXb8GiCSaCE",
    isRestaurant: true,
    location: {
      name: "室內保齡球休閒館",
      mapQuery: "東京 ボウリング場"
    },
    foods: ["球館休閒輕食：現炸酥脆金黃起司條（勝者獎勵）"],
    timeline: [
      { time: "00:00", sec: 0, text: "吃完新宿海鮮 Buffet 精神飽滿，來到保齡球館決一勝負" },
      { time: "03:20", sec: 200, text: "熱身試投：兩人姿勢滿分但球路頻頻洗溝的搞笑開場" },
      { time: "06:40", sec: 400, text: "正式比賽展開：互相幫對方取了爆笑球員稱號" },
      { time: "11:20", sec: 680, text: "中盤膠著拉鋸：菅叶和嘗試左手投球奇蹟擊倒多瓶" },
      { time: "18:00", sec: 1080, text: "落後方需接受單人拍貼機懲罰，雙方拼盡全力求勝" },
      { 
        time: "22:40", 
        sec: 1360, 
        isEating: true, 
        foodTitle: "現炸酥脆金黃牽絲起司條",
        text: "開吃前5秒：賽後頒獎！菅叶和端起剛炸好牽絲香濃的起司條大口享用" 
      },
      { time: "23:00", sec: 1380, text: "完食心得：如果發財了一定要天天大吃美食！外景圓滿收尾" }
    ]
  }
];
