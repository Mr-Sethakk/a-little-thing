NEWS_SOURCES = [
    {
        "name": "中国经济网",
        "type": "rss",
        "url": "http://www.ce.cn/xwzx/gnsz/gdxw/rss.xml",
        "category": "经济",
    },
    {
        "name": "新浪财经",
        "type": "web",
        "url": "https://finance.sina.com.cn/",
        "category": "财经",
    },
    {
        "name": "36氪",
        "type": "rss",
        "url": "https://36kr.com/feed",
        "category": "科技",
    },
]

CATEGORIES = {
    "stock": "股市",
    "tech": "科技",
    "finance": "财经",
    "policy": "政策",
    "market": "市场",
}

# Keyword-based classification (checked in order, first match wins)
CATEGORY_KEYWORDS = {
    "股市": ["A股", "港股", "美股", "大盘", "上证", "深证", "创业板", "科创板", "沪指", "深指", "纳指", "道指", "标普", "涨停", "跌停", "涨幅", "跌幅", "指数", "行情", "券商", "基金", "ETF", "北向资金", "外资", "IPO", "新股", "配股", "增发"],
    "科技": ["AI", "人工智能", "芯片", "半导体", "量子", "5G", "6G", "机器人", "大模型", "GPT", "算法", "自动驾驶", "无人机", "算力", "英伟达", "华为", "苹果", "谷歌", "OpenAI", "特斯拉", "SpaceX", "云计算", "区块链", "元宇宙", "VR", "AR"],
    "财经": ["央行", "降准", "降息", "加息", "利率", "汇率", "人民币", "美元", "通胀", "CPI", "PPI", "GDP", "财政", "税收", "国债", "债券", "信贷", "贷款", "存款", "银行", "保险", "理财", "REITs", "数字人民币"],
    "政策": ["国务院", "发改委", "工信部", "证监会", "银保监", "国资委", "两会", "政策", "法规", "监管", "改革", "规划", "补贴", "减税", "碳中和", "碳达峰", "双碳", "环保", "绿色"],
    "经济": ["消费", "零售", "出口", "进口", "贸易", "GDP", "经济增长", "PMI", "工业", "制造业", "供应链", "物流", "房地产", "楼市", "房价", "土地", "基建", "投资", "失业", "就业"],
}

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

REQUEST_TIMEOUT = 15

# Retry settings
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2  # exponential: 2s, 4s, 8s

# Random delay between requests (seconds)
REQUEST_DELAY_MIN = 1
REQUEST_DELAY_MAX = 3

# Scrape intervals (minutes) — used by backend APScheduler
RSS_INTERVAL_MIN = 1
RSS_INTERVAL_MAX = 2
WEB_INTERVAL_MIN = 3
WEB_INTERVAL_MAX = 5
