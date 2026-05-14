from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Index
from sqlalchemy.sql import func
from database import Base


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    summary = Column(Text)
    content = Column(Text)
    image_url = Column(Text)
    source_url = Column(Text)
    source_name = Column(String(100))
    category = Column(String(50))
    publish_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("idx_publish_date", "publish_date"),
        Index("idx_category", "category"),
    )
