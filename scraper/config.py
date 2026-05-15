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
    "economy": "经济",
    "finance": "财经",
    "policy": "政策",
    "market": "市场",
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
