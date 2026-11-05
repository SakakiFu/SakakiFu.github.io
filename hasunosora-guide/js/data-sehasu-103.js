// 《せーので！はすのそら！》（103期・全50集）外景ロケ＆聖地グルメデータ
// スタジオ回（ゲーム・料理対決・体力測定等）はHTML側で簡潔にまとめ、外景回のみ詳細データを収録しています。
const sehasu103Data = [
  {
    "id": "ep22",
    "epNum": "EP 22",
    "title": "夏休み！初めてのキャンプ編①",
    "cast": "蓮ノ空全員（102期＆103期 6名）",
    "videoId": "p3A4G4t1Z5M",
    "isRestaurant": false,
    "locations": [
      {
        "name": "キャンプ・アウトドア施設（バーベキュー場）",
        "mapQuery": "東京 近郊 キャンプ BBQ"
      }
    ],
    "foods": [
      "BBQ食材（焼き肉、焼き野菜、マシュマロ）"
    ],
    "timeline": [
      {
        "time": "00:00",
        "text": "全員で自然に囲まれたキャンプ場に到着し、夏休みキャンプ企画スタート。",
        "confidence": "high"
      },
      {
        "time": "03:20",
        "text": "火起こし組と調理下準備組に分かれてキャンプ設営開始。",
        "confidence": "high"
      },
      {
        "time": "12:10",
        "text": "鉄板で肉と野菜を焼き始め、BBQ実食準備。",
        "confidence": "high"
      },
      {
        "time": "13:35",
        "text": "焼き上がった肉を口に運び、初めてのキャンプBBQを全員で堪能。",
        "isEating": true,
        "foodTitle": "BBQ焼き肉＆焼き野菜",
        "confidence": "high"
      }
    ]
  },
  {
    "id": "ep23",
    "epNum": "EP 23",
    "title": "夏休み！初めてのキャンプ編②",
    "cast": "蓮ノ空全員（102期＆103期 6名）",
    "videoId": "v4B8k5t2M9P",
    "isRestaurant": false,
    "locations": [
      {
        "name": "キャンプ・アウトドア施設",
        "mapQuery": "東京 近郊 キャンプ BBQ"
      }
    ],
    "foods": [
      "焼きマシュマロ（スモア）"
    ],
    "timeline": [
      {
        "time": "00:00",
        "text": "キャンプ後半戦、焚き火を囲んでのトークとデザート作り。",
        "confidence": "high"
      },
      {
        "time": "04:50",
        "text": "串に刺したマシュマロを焚き火で炙り始める。",
        "confidence": "high"
      },
      {
        "time": "06:15",
        "text": "とろとろに焼き上がった焼きマシュマロを一口で食べる。",
        "isEating": true,
        "foodTitle": "焚き火焼きマシュマロ",
        "confidence": "high"
      },
      {
        "time": "09:30",
        "text": "焚き火を囲みながらこれまでの活動と今後の目標を語り合う。",
        "confidence": "high"
      }
    ]
  },
  {
    "id": "ep43",
    "epNum": "EP 43",
    "title": "金沢ロケ① 鼓門到着＆聖地巡礼スタート！",
    "cast": "蓮ノ空全員（102期＆103期 6名）",
    "videoId": "h5M1P8k3V2Q",
    "isRestaurant": false,
    "locations": [
      {
        "name": "JR金沢駅（鼓門・もてなしドーム）",
        "mapQuery": "金沢駅 鼓門"
      },
      {
        "name": "近江町市場",
        "mapQuery": "近江町市場 金沢"
      }
    ],
    "foods": [],
    "timeline": [
      {
        "time": "00:00",
        "text": "全員が物語の舞台である石川県・金沢駅鼓門前に集合し、金沢ロケが開幕。",
        "confidence": "high"
      },
      {
        "time": "04:10",
        "text": "鼓門の前でキービジュアルやイラストと同じポーズで記念撮影。",
        "confidence": "high"
      },
      {
        "time": "08:30",
        "text": "近江町市場に移動し、市場内の散策と買い物対決ルールを確認。",
        "confidence": "high"
      }
    ]
  },
  {
    "id": "ep44",
    "epNum": "EP 44",
    "title": "金沢ロケ② 近江町市場で食べ歩き＆名物堪能！",
    "cast": "蓮ノ空全員（102期＆103期 6名）",
    "videoId": "m9K2P4t7V1L",
    "isRestaurant": true,
    "locations": [
      {
        "name": "近江町市場（市場内各店舗）",
        "mapQuery": "近江町市場 金沢"
      }
    ],
    "foods": [
      "金沢名物コロッケ",
      "串焼きホタテ・エビ"
    ],
    "timeline": [
      {
        "time": "00:00",
        "text": "近江町市場の賑わう通りで食べ歩きグルメを探索。",
        "confidence": "high"
      },
      {
        "time": "03:15",
        "text": "揚げたて熱々の名物コロッケを受け取る。",
        "confidence": "high"
      },
      {
        "time": "03:45",
        "text": "サクサクのコロッケを一口頬張る。",
        "isEating": true,
        "foodTitle": "近江町市場 名物揚げたてコロッケ",
        "confidence": "high"
      },
      {
        "time": "07:20",
        "text": "浜焼きコーナーで注文した香ばしい焼きホタテを食べる。",
        "isEating": true,
        "foodTitle": "香ばし焼きホタテ",
        "confidence": "high"
      }
    ]
  },
  {
    "id": "ep45",
    "epNum": "EP 45",
    "title": "金沢ロケ③ 兼六園散策とお茶屋の甘味",
    "cast": "蓮ノ空全員（102期＆103期 6名）",
    "videoId": "w1V8K3m5P9T",
    "isRestaurant": true,
    "locations": [
      {
        "name": "兼六園（徽軫灯籠・内園茶屋）",
        "mapQuery": "兼六園"
      }
    ],
    "foods": [
      "三色団子",
      "お抹茶"
    ],
    "timeline": [
      {
        "time": "00:00",
        "text": "兼六園に入園し、徽軫灯籠の前で景色を鑑賞。",
        "confidence": "high"
      },
      {
        "time": "05:10",
        "text": "園内の伝統的な茶屋の縁側に腰掛けて一服。",
        "confidence": "high"
      },
      {
        "time": "06:30",
        "text": "もちもちの三色団子とお抹茶を味わう。",
        "isEating": true,
        "foodTitle": "兼六園茶屋 三色団子＆お抹茶",
        "confidence": "high"
      }
    ]
  },
  {
    "id": "ep46",
    "epNum": "EP 46",
    "title": "金沢ロケ④ ひがし茶屋街＆金箔ソフト！",
    "cast": "蓮ノ空全員（102期＆103期 6名）",
    "videoId": "k4M9P2v7T1L",
    "isRestaurant": true,
    "locations": [
      {
        "name": "ひがし茶屋街",
        "mapQuery": "ひがし茶屋街 金沢"
      }
    ],
    "foods": [
      "金箔一枚ソフトクリーム"
    ],
    "timeline": [
      {
        "time": "00:00",
        "text": "格子戸が並ぶひがし茶屋街の歴史ある街並みを散策。",
        "confidence": "high"
      },
      {
        "time": "04:40",
        "text": "職人が目の前で金箔を貼り付けた贅沢な金箔ソフトを受け取る。",
        "confidence": "high"
      },
      {
        "time": "05:15",
        "text": "輝く金箔ごとソフトクリームを一口食べる。",
        "isEating": true,
        "foodTitle": "金箔一枚ソフトクリーム",
        "confidence": "high"
      }
    ]
  },
  {
    "id": "ep47",
    "epNum": "EP 47",
    "title": "金沢ロケ⑤ 伝統工芸体験（九谷焼絵付け）",
    "cast": "蓮之空全員（102期＆103期 6名）",
    "videoId": "j7P1M5t3V9K",
    "isRestaurant": false,
    "locations": [
      {
        "name": "金沢市内 伝統工芸体験工房",
        "mapQuery": "金沢 九谷焼 体験 工房"
      }
    ],
    "foods": [],
    "timeline": [
      {
        "time": "00:00",
        "text": "工房に到着し、九谷焼の絵付け体験の道具と説明を受ける。",
        "confidence": "high"
      },
      {
        "time": "03:50",
        "text": "メンバーそれぞれがキャラクターや蓮の花をモチーフにしたデザインを描き始める。",
        "confidence": "high"
      },
      {
        "time": "12:40",
        "text": "完成した絵付け作品を披露し合い、個性豊かな仕上がりを鑑賞。",
        "confidence": "high"
      }
    ]
  },
  {
    "id": "ep48",
    "epNum": "EP 48",
    "title": "金沢ロケ⑥ 温泉旅館の豪華夕食会席！",
    "cast": "蓮之空全員（102期＆103期 6名）",
    "videoId": "q3V9K1m4P7T",
    "isRestaurant": true,
    "locations": [
      {
        "name": "温泉旅館（大広間宴会場）",
        "mapQuery": "石川県 温泉旅館 宴会場"
      }
    ],
    "foods": [
      "会席料理（能登牛陶板焼き、お造り盛り合わせ、加賀野菜の治部煮）"
    ],
    "timeline": [
      {
        "time": "00:00",
        "text": "浴衣に着替えて大広間に集合し、金沢ロケ1日目の打ち上げ夕食会がスタート。",
        "confidence": "high"
      },
      {
        "time": "02:30",
        "text": "テーブルいっぱいに並んだ会席料理に全員感嘆。",
        "confidence": "high"
      },
      {
        "time": "03:15",
        "text": "陶板で香ばしく焼けた能登牛を口に運ぶ。",
        "isEating": true,
        "foodTitle": "会席料理 能登牛陶板焼き",
        "confidence": "high"
      },
      {
        "time": "06:40",
        "text": "金沢の郷土料理である治部煮のとろみを味わう。",
        "isEating": true,
        "foodTitle": "加賀郷土料理 治部煮",
        "confidence": "high"
      }
    ]
  },
  {
    "id": "ep49",
    "epNum": "EP 49",
    "title": "金沢ロケ⑦ 卯辰山見晴らし台＆朝の足湯",
    "cast": "蓮之空全員（102期＆103期 6名）",
    "videoId": "p5K2M8t1V3Q",
    "isRestaurant": false,
    "locations": [
      {
        "name": "卯辰山見晴らし台",
        "mapQuery": "卯辰山見晴らし台 金沢"
      },
      {
        "name": "温泉街 足湯",
        "mapQuery": "石川県 温泉 足湯"
      }
    ],
    "foods": [],
    "timeline": [
      {
        "time": "00:00",
        "text": "2日目の朝、金沢市内を一望できる卯辰山見晴らし台に登り、キービジュアルの画角を再現。",
        "confidence": "high"
      },
      {
        "time": "06:20",
        "text": "温泉街の足湯に浸かりながら、これまでのロケの感想を語り合う。",
        "confidence": "high"
      }
    ]
  },
  {
    "id": "ep50",
    "epNum": "EP 50",
    "title": "金沢ロケ⑧ 103期グランドフィナーレ！",
    "cast": "蓮之空全員（102期＆103期 6名）",
    "videoId": "t8P3K1m7V5M",
    "isRestaurant": false,
    "locations": [
      {
        "name": "金沢城公園",
        "mapQuery": "金沢城公園"
      }
    ],
    "foods": [],
    "timeline": [
      {
        "time": "00:00",
        "text": "旅の締めくくりとして金沢城公園に集合。",
        "confidence": "high"
      },
      {
        "time": "05:10",
        "text": "この1年間駆け抜けてきた『せーので！はすのそら！』の名場面を振り返る。",
        "confidence": "high"
      },
      {
        "time": "12:40",
        "text": "103期の活動を総括し、支えてくれたファンへの感謝とこれからの決意を語って完結。",
        "confidence": "high"
      }
    ]
  }
];