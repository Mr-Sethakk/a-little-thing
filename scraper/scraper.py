import os
import sys
import re
import logging
import hashlib
import time
import random
from datetime import datetime, date

import requests
from bs4 import BeautifulSoup
import feedparser
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))
from models import News
from database import Base

from config import (
    NEWS_SOURCES, DEFAULT_HEADERS, REQUEST_TIMEOUT,
    MAX_RETRIES, RETRY_BACKOFF_BASE,
    REQUEST_DELAY_MIN, REQUEST_DELAY_MAX,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "news.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)


def content_hash(title: str, source_url: str) -> str:
    return hashlib.md5(f"{title}{source_url}".encode()).hexdigest()


def is_duplicate(db, title: str, source_url: str) -> bool:
    existing = db.query(News).filter(News.title == title).first()
    if existing:
        return True
    existing = db.query(News).filter(News.source_url == source_url).first()
    if existing:
        return True
    return False


def fetch_url(url: str) -> str:
    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(url, headers=DEFAULT_HEADERS, timeout=REQUEST_TIMEOUT)
            resp.encoding = resp.apparent_encoding
            return resp.text
        except Exception as e:
            wait = RETRY_BACKOFF_BASE ** (attempt + 1) + random.uniform(0, 1)
            if attempt < MAX_RETRIES - 1:
                logger.warning(f"请求失败 {url} (第{attempt+1}次): {e}, {wait:.1f}s后重试")
                time.sleep(wait)
            else:
                logger.error(f"请求失败 {url} (已重试{MAX_RETRIES}次): {e}")
    return ""


def extract_image(soup, url: str) -> str:
    img = soup.find("img", src=True)
    if img:
        src = img["src"]
        if src.startswith("//"):
            src = "https:" + src
        elif src.startswith("/"):
            from urllib.parse import urlparse
            parsed = urlparse(url)
            src = f"{parsed.scheme}://{parsed.netloc}{src}"
        return src
    return ""


def scrape_rss(source: dict) -> list:
    news_list = []
    try:
        feed = feedparser.parse(source["url"])
        for entry in feed.entries[:30]:
            title = entry.get("title", "").strip()
            summary = entry.get("summary", "").strip()
            if summary:
                summary = BeautifulSoup(summary, "lxml").get_text()[:500]
            link = entry.get("link", "")
            published = entry.get("published_parsed") or entry.get("updated_parsed")
            if published:
                pub_date = date(published.tm_year, published.tm_mon, published.tm_mday)
            else:
                pub_date = date.today()

            image_url = ""
            if hasattr(entry, "media_content") and entry.media_content:
                image_url = entry.media_content[0].get("url", "")
            elif hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
                image_url = entry.media_thumbnail[0].get("url", "")

            if title and link:
                news_list.append({
                    "title": title,
                    "summary": summary[:500] if summary else "",
                    "content": summary,
                    "image_url": image_url,
                    "source_url": link,
                    "source_name": source.get("name", ""),
                    "category": source.get("category", "经济"),
                    "publish_date": pub_date,
                })
    except Exception as e:
        logger.error(f"RSS解析失败 {source['name']}: {e}")
    return news_list


def scrape_web_sina(source: dict) -> list:
    news_list = []
    try:
        html = fetch_url(source["url"])
        if not html:
            return news_list
        soup = BeautifulSoup(html, "lxml")
        links = soup.find_all("a", href=re.compile(r"https://finance\.sina\.com\.cn/.+\.shtml"))
        seen = set()
        for link in links[:30]:
            href = link.get("href", "")
            title = link.get_text().strip()
            if not title or len(title) < 6 or href in seen:
                continue
            seen.add(href)
            news_list.append({
                "title": title,
                "summary": "",
                "content": "",
                "image_url": "",
                "source_url": href,
                "source_name": source.get("name", ""),
                "category": source.get("category", "财经"),
                "publish_date": date.today(),
            })
    except Exception as e:
        logger.error(f"网页爬取失败 {source['name']}: {e}")
    return news_list


def scrape_web_generic(source: dict) -> list:
    news_list = []
    try:
        html = fetch_url(source["url"])
        if not html:
            return news_list
        soup = BeautifulSoup(html, "lxml")
        for article in soup.find_all(["article", "div"], class_=re.compile(r"(news|article|item)", re.I))[:20]:
            a_tag = article.find("a", href=True)
            if not a_tag:
                continue
            title = a_tag.get_text().strip()
            href = a_tag["href"]
            if not title or len(title) < 4:
                continue
            if href.startswith("/"):
                from urllib.parse import urlparse
                parsed = urlparse(source["url"])
                href = f"{parsed.scheme}://{parsed.netloc}{href}"

            img = article.find("img", src=True)
            image_url = img["src"] if img else ""

            summary_tag = article.find(["p", "span", "div"], class_=re.compile(r"(summary|desc|intro)", re.I))
            summary = summary_tag.get_text().strip()[:300] if summary_tag else ""

            news_list.append({
                "title": title,
                "summary": summary,
                "content": "",
                "image_url": image_url,
                "source_url": href,
                "source_name": source.get("name", ""),
                "category": source.get("category", "经济"),
                "publish_date": date.today(),
            })
    except Exception as e:
        logger.error(f"通用爬取失败 {source['name']}: {e}")
    return news_list


def run_scraper(source_type: str = None):
    """
    source_type: "rss" / "web" / None(全部)
    """
    label = source_type or "全部"
    logger.info(f"=== 开始新闻抓取任务 ({label}) ===")
    db = Session()
    total_new = 0
    total_skip = 0

    sources = [s for s in NEWS_SOURCES if source_type is None or s["type"] == source_type]

    for i, source in enumerate(sources):
        # Random delay between sources (skip first)
        if i > 0:
            delay = random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX)
            logger.debug(f"随机延迟 {delay:.1f}s")
            time.sleep(delay)

        logger.info(f"抓取源: {source['name']} ({source['type']})")
        if source["type"] == "rss":
            items = scrape_rss(source)
        elif source["type"] == "web" and "sina" in source["url"]:
            items = scrape_web_sina(source)
        elif source["type"] == "web":
            items = scrape_web_generic(source)
        else:
            items = []

        for item in items:
            if is_duplicate(db, item["title"], item["source_url"]):
                total_skip += 1
                continue
            try:
                news = News(
                    title=item["title"],
                    summary=item["summary"],
                    content=item["content"],
                    image_url=item["image_url"],
                    source_url=item["source_url"],
                    source_name=item.get("source_name", ""),
                    category=item["category"],
                    publish_date=item["publish_date"],
                )
                db.add(news)
                total_new += 1
            except Exception as e:
                logger.error(f"存储失败: {item['title']}: {e}")

        logger.info(f"  {source['name']}: 获取 {len(items)} 条")

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"数据库提交失败: {e}")
    finally:
        db.close()

    logger.info(f"抓取完成 ({label}): 新增 {total_new} 条, 跳过 {total_skip} 条(重复)")
    return total_new


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--type", choices=["rss", "web"], default=None, help="只抓取指定类型")
    args = parser.parse_args()
    run_scraper(source_type=args.type)
