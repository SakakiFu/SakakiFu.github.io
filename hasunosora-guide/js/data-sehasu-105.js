// 《せーので！はすのそら！105》外景與美食資料庫（精簡棚拍 + 深度外景）
const sehasu105Data = [
  {
    id: "ep19",
    epNum: "EP 19",
    title: "小組旅 スリーズブーケ篇 月兔之里治癒之旅",
    cast: "楡井希実 ＆ 花宮初奈 ＆ 櫻井陽菜",
    videoId: "3MzY8x2ehRg",
    isRestaurant: true,
    location: {
      name: "石川縣加賀市・月兔之里（月うさぎの里）",
      mapQuery: "月うさぎの里 加賀"
    },
    foods: ["月兔造型精緻小蛋糕（草莓果泥夾心）", "加賀現沖熱焙茶"],
    timeline: [
      { time: "00:00", sec: 0, text: "抵達月兔之里，三人換上圍裙準備餵食兔子" },
      { time: "03:11", sec: 191, text: "園區漫步與兔子親密抱抱互動" },
      { 
        time: "11:45", 
        sec: 705, 
        isEating: true, 
        foodTitle: "月兔造型草莓甜點佐加賀焙茶",
        text: "開吃前5秒：就座享用可愛兔耳造型草莓蛋糕與香醇熱焙茶" 
      },
      { time: "13:30", sec: 810, text: "邊吃甜點邊聊日常排練心得與合照收尾" }
    ]
  },
  {
    id: "ep20",
    epNum: "EP 20",
    title: "小組旅 DOLLCHESTRA篇 卡拉OK瘋狂飆歌大會",
    cast: "野中ここな ＆ 佐佐木琴子 ＆ 葉山風花",
    videoId: "0SRaBjNwpgA",
    isRestaurant: true,
    location: {
      name: "東京都內卡拉OK包廂",
      mapQuery: "カラオケ 東京"
    },
    foods: ["派對炸物拼盤（現炸金黃脆薯、日式唐揚炸雞、洋蔥圈）", "漂浮哈密瓜蘇打"],
    timeline: [
      { time: "00:00", sec: 0, text: "包廂集合，三人熱血發表飆歌企劃" },
      { time: "02:41", sec: 161, text: "點唱經典曲目，三人拿麥克風熱跳互動" },
      { 
        time: "07:35", 
        sec: 455, 
        isEating: true, 
        foodTitle: "現炸卡拉OK拼盤（金黃薯條與炸雞塊）",
        text: "開吃前5秒：熱騰騰炸物拼盤上桌，大口搶吃薯條補充體力" 
      },
      { time: "08:45", sec: 525, text: "大合唱 DOLLCHESTRA 代表曲與熱血結尾" }
    ]
  },
  {
    id: "ep22",
    epNum: "EP 22",
    title: "小組旅 Edel Note篇 親手做創意角色便當",
    cast: "三宅美羽 ＆ 進藤天音",
    videoId: "p4Rqk27e5bc",
    isRestaurant: true,
    location: {
      name: "料理手作教室廚房",
      mapQuery: "料理教室 東京"
    },
    foods: ["兩人親手自製角色便當（特製玉子燒、章魚香腸、角色海苔飯糰）"],
    timeline: [
      { time: "00:00", sec: 0, text: "料理教室集合，穿上圍裙準備手做愛心便當" },
      { time: "03:01", sec: 181, text: "細心剪海苔拼裝五官、煎蛋捲與捏飯糰" },
      { 
        time: "11:15", 
        sec: 675, 
        isEating: true, 
        foodTitle: "親手完成的 Edel Note 角色造型便當",
        text: "開吃前5秒：開箱便當盒！互相餵食品嚐對方親手做的玉子燒" 
      },
      { time: "13:00", sec: 780, text: "品評彼此的料理手藝與歡樂收尾" }
    ]
  },
  {
    id: "ep36",
    epNum: "EP 36",
    title: "金澤＆能登大外景① 踏上聖地金澤站與鼓門",
    cast: "蓮之空全員（105期）",
    videoId: "H5Il8if3i3s",
    isRestaurant: true,
    location: {
      name: "石川縣金澤市・JR金澤站 鼓門",
      mapQuery: "金沢駅 鼓門"
    },
    foods: ["金澤名物金箔牛奶霜淇淋（金箔ソフトクリーム）"],
    timeline: [
      { time: "00:00", sec: 0, text: "金澤站鼓門前全員集合！宣布金澤能登大外景正式啟程" },
      { 
        time: "12:40", 
        sec: 760, 
        isEating: true, 
        foodTitle: "金澤名物金箔奢華霜淇淋",
        text: "開吃前5秒：整片亮金色食用金箔貼在濃郁牛奶霜淇淋上，全員大口咬下" 
      },
      { time: "15:20", sec: 920, text: "車站前打卡留念與準備前往下一站" }
    ]
  },
  {
    id: "ep38",
    epNum: "EP 38",
    title: "金澤＆能登大外景③ 近江町市場大啖頂級海鮮丼",
    cast: "蓮之空全員（105期）",
    videoId: "TkF-_SRONY0",
    isRestaurant: true,
    location: {
      name: "石川縣金澤市・近江町市場海鮮餐廳",
      mapQuery: "近江町市場 海鮮丼"
    },
    foods: ["特選近江町海鮮散壽司丼（滿鋪能登鰤魚、甜蝦、鮭魚卵、特級海膽）"],
    timeline: [
      { time: "00:00", sec: 0, text: "走進有「金澤廚房」之稱的近江町市場，入座海鮮餐廳" },
      { 
        time: "06:50", 
        sec: 410, 
        isEating: true, 
        foodTitle: "近江町特選豪華海鮮散壽司丼",
        text: "開吃前5秒：巨大刺身碗端上桌，滿滿油脂豐厚的生魚片與海膽開吃" 
      },
      { time: "10:30", sec: 630, text: "大快朵頤石川特產海鮮與心得交流" }
    ]
  },
  {
    id: "ep39",
    epNum: "EP 39",
    title: "金澤＆能登大外景④ 兼六園風雅漫步與見晴台",
    cast: "蓮之空全員（105期）",
    videoId: "y8cFFON9U7M",
    isRestaurant: true,
    location: {
      name: "石川縣金澤市・兼六園茶屋 ＆ 卯辰山見晴台",
      mapQuery: "兼六園 茶屋"
    },
    foods: ["兼六園茶屋名物現烤三色甜糯米糰子（三色団子）佐抹茶"],
    timeline: [
      { time: "00:00", sec: 0, text: "來到日本三大名園兼六園散策，欣賞徽軫燈籠" },
      { 
        time: "10:20", 
        sec: 620, 
        isEating: true, 
        foodTitle: "兼六園三色軟糯甜糰子配熱抹茶",
        text: "開吃前5秒：在傳統日式庭園緣側就座，大口品嚐軟糯甜醬糰子" 
      },
      { time: "14:15", sec: 855, text: "前往卯辰山見晴台俯瞰金澤全景聖地巡禮" }
    ]
  },
  {
    id: "ep42",
    epNum: "EP 42",
    title: "金澤＆能登大外景⑦ 能登溫泉旅館頂級會席料理",
    cast: "蓮之空全員（105期）",
    videoId: "keMTPcsfrBg",
    isRestaurant: true,
    location: {
      name: "石川縣能登半島・傳統溫泉旅館大宴會廳",
      mapQuery: "能登 温泉 旅館"
    },
    foods: ["能登牛陶板燒肉、能登當季刺身盛合、能登產鮮蔬煮物"],
    timeline: [
      { time: "00:00", sec: 0, text: "全員換上日式浴衣，抵達榻榻米大宴會廳" },
      { 
        time: "09:30", 
        sec: 570, 
        isEating: true, 
        foodTitle: "能登牛陶板燒與當季會席料理大餐",
        text: "開吃前5秒：陶板上滋滋作響的多汁能登牛排，全員動筷大快朵頤" 
      },
      { time: "16:40", sec: 1000, text: "大宴會桌前邊吃邊回顧一整天的外景名場面" }
    ]
  },
  {
    id: "ep43",
    epNum: "EP 43",
    title: "金澤＆能登大外景⑧ 溫泉朝食與金澤外景感動完結",
    cast: "蓮之空全員（105期）",
    videoId: "jIbPQHp87RU",
    isRestaurant: true,
    location: {
      name: "能登溫泉旅館・早餐廳 ＆ 展望足湯",
      mapQuery: "能登 温泉 足湯"
    },
    foods: ["溫泉旅館和風朝食（現烤鹽烤鮭魚、溫泉蛋、越光米飯配蛤蜊湯）"],
    timeline: [
      { time: "00:00", sec: 0, text: "晨間清爽開場，邊眺望海景邊泡足湯" },
      { 
        time: "07:15", 
        sec: 435, 
        isEating: true, 
        foodTitle: "溫泉旅館精緻和風朝食定食",
        text: "開吃前5秒：將半熟溫泉蛋淋在熱騰騰越光米飯上，大口扒飯" 
      },
      { time: "18:30", sec: 1110, text: "金澤＆能登整趟外景旅程的心路歷程真情告白，圓滿收官" }
    ]
  }
];
