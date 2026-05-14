from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


class NewsItem(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    category: Optional[str] = None
    publish_date: date

    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    news: List[NewsItem]
    page: int
    total_pages: int
    total_count: int


class NewsDetailResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    category: Optional[str] = None
    publish_date: date
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
