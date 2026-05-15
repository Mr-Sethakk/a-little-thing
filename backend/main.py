import os
import sys
import math
from datetime import date, datetime
from typing import Optional

from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, get_db, Base
from models import News
from schemas import NewsItem, NewsListResponse, NewsDetailResponse

Base.metadata.create_all(bind=engine)

# Migration: add source_name column if missing
def migrate_db():
    from sqlalchemy import text, inspect
    inspector = inspect(engine)
    columns = [col["name"] for col in inspector.get_columns("news")]
    if "source_name" not in columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE news ADD COLUMN source_name VARCHAR(100)"))
            conn.commit()

try:
    migrate_db()
except Exception:
    pass

# Scraping state
scrape_state = {"last_time": None, "last_new_count": 0, "running": False}

def scheduled_scrape():
    import subprocess
    if scrape_state["running"]:
        return
    scrape_state["running"] = True
    scraper_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scraper", "scraper.py")
    try:
        result = subprocess.run(["python", scraper_path], capture_output=True, text=True, timeout=120)
        import re
        match = re.search(r"新增 (\d+) 条", result.stdout)
        scrape_state["last_new_count"] = int(match.group(1)) if match else 0
    except Exception:
        pass
    finally:
        scrape_state["last_time"] = datetime.now()
        scrape_state["running"] = False

# APScheduler: scrape every 30 minutes
from apscheduler.schedulers.background import BackgroundScheduler
scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_scrape, "interval", minutes=30, id="news_scrape", replace_existing=True)
scheduler.start()

app = FastAPI(title="经济新闻抓取与展示系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PAGE_SIZE = 12


@app.get("/api/news", response_model=NewsListResponse)
def get_news_list(
    date: Optional[str] = Query(None, description="日期筛选，格式 YYYY-MM-DD"),
    category: Optional[str] = Query(None, description="类别筛选"),
    keyword: Optional[str] = Query(None, description="关键词搜索"),
    page: int = Query(1, ge=1, description="页码"),
    db: Session = Depends(get_db),
):
    query = db.query(News)

    if date:
        try:
            filter_date = datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(News.publish_date == filter_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="日期格式错误，请使用 YYYY-MM-DD")

    if category:
        query = query.filter(News.category == category)

    if keyword:
        query = query.filter(
            (News.title.contains(keyword)) | (News.summary.contains(keyword))
        )

    total_count = query.count()
    total_pages = max(1, math.ceil(total_count / PAGE_SIZE))

    news_list = (
        query.order_by(News.publish_date.desc(), News.id.desc())
        .offset((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .all()
    )

    return NewsListResponse(
        news=news_list, page=page, total_pages=total_pages, total_count=total_count
    )


@app.get("/api/news/{news_id}", response_model=NewsDetailResponse)
def get_news_detail(news_id: int, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="新闻不存在")
    return news


@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = (
        db.query(distinct(News.category))
        .filter(News.category.isnot(None))
        .all()
    )
    return {"categories": [c[0] for c in categories]}


@app.get("/api/dates")
def get_available_dates(db: Session = Depends(get_db)):
    dates = (
        db.query(distinct(News.publish_date))
        .order_by(News.publish_date.desc())
        .all()
    )
    return {"dates": [str(d[0]) for d in dates]}


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(News.id)).scalar()
    categories = db.query(func.count(distinct(News.category))).scalar()
    latest = db.query(func.max(News.publish_date)).scalar()
    return {
        "total_news": total,
        "total_categories": categories,
        "latest_date": str(latest) if latest else None,
    }


@app.get("/api/scrape/status")
def get_scrape_status():
    return {
        "running": scrape_state["running"],
        "last_time": str(scrape_state["last_time"]) if scrape_state["last_time"] else None,
        "last_new_count": scrape_state["last_new_count"],
    }


@app.post("/api/scrape")
def trigger_scrape():
    import subprocess
    scraper_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scraper", "scraper.py")
    try:
        result = subprocess.run(
            ["python", scraper_path],
            capture_output=True, text=True, timeout=120,
        )
        return {"status": "success", "output": result.stdout}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.post("/api/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    from datetime import timedelta
    import random

    categories = ["股市", "科技", "经济", "财经", "政策", "市场"]
    sources = ["新浪财经", "中国经济网", "36氪", "第一财经", "证券时报", "财新网"]
    sample_news = [
        ("A股三大指数集体收涨 半导体板块领涨", "今日A股市场表现强劲，三大指数集体收涨，半导体板块涨幅居前，多只个股涨停。", "https://picsum.photos/seed/stock1/400/250"),
        ("央行宣布降准0.5个百分点 释放长期资金约1万亿元", "中国人民银行决定下调金融机构存款准备金率0.5个百分点，释放长期资金约1万亿元。", "https://picsum.photos/seed/economy1/400/250"),
        ("OpenAI发布最新大模型 人工智能概念股集体走强", "OpenAI发布了最新一代大语言模型，性能大幅提升，A股人工智能概念股应声上涨。", "https://picsum.photos/seed/tech1/400/250"),
        ("新能源汽车5月销量创新高 渗透率突破50%", "5月新能源汽车销量达到历史新高，市场渗透率首次突破50%大关。", "https://picsum.photos/seed/car1/400/250"),
        ("国务院出台稳经济一揽子政策措施", "国务院常务会议研究部署稳经济的一揽子政策举措，涵盖财政、货币、产业等多个领域。", "https://picsum.photos/seed/policy1/400/250"),
        ("国际油价突破80美元 能源板块全线走强", "受地缘政治因素影响，国际原油期货价格突破80美元关口，能源板块应声上涨。", "https://picsum.photos/seed/oil1/400/250"),
        ("科创板IPO新规落地 首批企业获批上市", "科创板注册制改革最新规则正式实施，首批按照新规申报的企业已获得上市批准。", "https://picsum.photos/seed/ipo1/400/250"),
        ("全球芯片短缺持续 消费电子价格上涨", "全球半导体供应链紧张态势延续，消费电子产品价格出现不同程度上涨。", "https://picsum.photos/seed/chip1/400/250"),
        ("房地产市场回暖 一线城市成交量环比增长30%", "最新数据显示，一线城市房地产市场出现回暖迹象，成交量环比增长约30%。", "https://picsum.photos/seed/house1/400/250"),
        ("碳中和目标推动绿色金融快速发展", "在碳达峰碳中和目标引领下，我国绿色金融市场规模快速增长，绿色债券发行量创新高。", "https://picsum.photos/seed/green1/400/250"),
        ("人民币汇率保持稳定 外资持续流入A股", "人民币兑美元汇率在合理均衡水平上保持稳定，北向资金持续净流入A股市场。", "https://picsum.photos/seed/rmb1/400/250"),
        ("数字人民币试点范围进一步扩大", "数字人民币试点城市进一步增加，应用场景涵盖零售、交通、政务等多个领域。", "https://picsum.photos/seed/digital1/400/250"),
        ("量子计算取得重大突破 相关概念股大涨", "中国科学家在量子计算领域取得重大技术突破，量子科技概念股集体涨停。", "https://picsum.photos/seed/quantum1/400/250"),
        ("跨境电商出口增速创新高 政策红利持续释放", "跨境电商出口继续保持高速增长，多项支持政策持续发力。", "https://picsum.photos/seed/cross1/400/250"),
        ("粮食安全战略升级 农业现代化加速推进", "国家粮食安全战略全面升级，农业科技创新和现代化进程加速推进。", "https://picsum.photos/seed/agri1/400/250"),
        ("5G基站建设超额完成 工业互联网加速落地", "全国5G基站建设任务超额完成，工业互联网应用场景不断丰富。", "https://picsum.photos/seed/5g1/400/250"),
        ("REITs市场规模突破千亿 基础设施投资新渠道", "公募REITs市场总规模突破千亿元，成为基础设施领域重要投融资渠道。", "https://picsum.photos/seed/reits1/400/250"),
        ("半导体国产替代加速 设备材料企业订单饱满", "半导体产业链国产替代进程明显加速，国内设备和材料企业订单量持续增长。", "https://picsum.photos/seed/semi1/400/250"),
        ("消费复苏态势良好 社零总额同比大幅增长", "社会消费品零售总额同比增长超预期，消费市场呈现良好复苏态势。", "https://picsum.photos/seed/consume1/400/250"),
        ("新型储能技术取得突破 商业化进程加速", "我国新型储能技术研发取得多项突破，产业化和商业化进程明显加快。", "https://picsum.photos/seed/energy1/400/250"),
    ]

    today = date.today()
    created = 0
    for i, (title, summary, img) in enumerate(sample_news):
        pub_date = today - timedelta(days=random.randint(0, 6))
        cat = categories[i % len(categories)]
        src = sources[i % len(sources)]
        if db.query(News).filter(News.title == title).first():
            continue
        news = News(
            title=title,
            summary=summary,
            content=summary + "\n\n更多详细内容请关注后续报道。",
            image_url=img,
            source_url=f"https://example.com/news/{i+1}",
            source_name=src,
            category=cat,
            publish_date=pub_date,
        )
        db.add(news)
        created += 1

    db.commit()
    return {"status": "success", "created": created}


@app.get("/api/news/{news_id}/source")
def fetch_source_content(news_id: int, db: Session = Depends(get_db)):
    import re
    import httpx
    from bs4 import BeautifulSoup as BS

    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="新闻不存在")
    if not news.source_url:
        return {"status": "no_url", "content": ""}

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        resp = httpx.get(news.source_url, headers=headers, timeout=15, follow_redirects=True)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding
        soup = BS(resp.text, "lxml")

        for tag in soup(["script", "style", "nav", "header", "footer", "aside", "iframe", "noscript"]):
            tag.decompose()

        article = soup.find("article") or soup.find("div", class_=re.compile(r"(article|content|detail|body|post)", re.I)) or soup.find("div", id=re.compile(r"(article|content|detail|body)", re.I))

        if article:
            paragraphs = article.find_all("p")
        else:
            paragraphs = soup.find_all("p")

        content = "\n\n".join(p.get_text().strip() for p in paragraphs if p.get_text().strip() and len(p.get_text().strip()) > 10)

        if not content:
            content = article.get_text(separator="\n", strip=True) if article else soup.get_text(separator="\n", strip=True)

        return {"status": "success", "content": content[:10000]}
    except Exception as e:
        return {"status": "error", "detail": str(e), "content": ""}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
