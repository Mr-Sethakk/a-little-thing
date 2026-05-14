# 经济新闻抓取与展示系统

自动抓取主流财经新闻网站内容，存储到本地数据库，并提供图文并茂的前端界面进行可视化展示。

## 功能特性

- **新闻自动抓取** — 支持 RSS 和网页爬虫两种方式，每日自动抓取经济新闻
- **分类浏览** — 股市、科技、经济、财经、政策、市场等多分类筛选
- **日期筛选** — 按日期查看历史新闻
- **关键词搜索** — 支持标题和摘要的模糊搜索
- **原文查看** — 可在弹窗内直接阅读原文内容，或跳转到原网页
- **来源标注** — 每条新闻标注来源媒体名称
- **暗黑模式** — 支持亮色/暗色主题切换
- **响应式布局** — 适配桌面端和移动端
- **一键启动** — 单个脚本启动所有服务并自动打开浏览器

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端服务 | Python + FastAPI + SQLAlchemy |
| 数据库 | SQLite |
| 新闻抓取 | Python + Requests + BeautifulSoup + Feedparser |
| 前端界面 | React + Vite + Tailwind CSS |
| 定时任务 | 内置于后端启动流程 |

## 项目结构

```
news_project/
├── backend/                    # 后端 API 服务
│   ├── main.py                 # FastAPI 应用入口，REST API
│   ├── database.py             # 数据库连接配置
│   ├── models.py               # SQLAlchemy 数据模型
│   ├── schemas.py              # Pydantic 数据校验
│   └── requirements.txt
├── scraper/                    # 新闻爬虫模块
│   ├── scraper.py              # 爬虫主程序
│   ├── config.py               # 新闻源配置
│   └── requirements.txt
├── frontend/                   # 前端 React 应用
│   ├── src/
│   │   ├── App.jsx             # 主应用组件
│   │   ├── api.js              # API 调用封装
│   │   └── components/         # UI 组件
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── data/                       # 数据目录（自动生成）
│   ├── news.db                 # SQLite 数据库
│   ├── backend.log             # 后端日志
│   ├── scraper.log             # 爬虫日志
│   └── frontend.log            # 前端日志
├── start.bat                   # Windows 一键启动脚本
├── start.sh                    # Linux/macOS 一键启动脚本
├── CHANGELOG.md                # 版本更新日志
└── README.md                   # 本文件
```

## 快速开始

### 环境要求

- **Python** 3.8+
- **Node.js** 16+
- **npm** 8+

### 一键启动

**Windows：**

```bash
# 双击 start.bat 或在命令行中运行
start.bat
```

**Linux / macOS：**

```bash
chmod +x start.sh
./start.sh
```

启动脚本会自动：
1. 检查 Python 和 Node.js 环境
2. 安装所有依赖
3. 启动后端服务
4. 运行新闻爬虫并填充演示数据
5. 启动前端开发服务器
6. 自动打开浏览器访问 `http://localhost:3000`

### 手动启动

如果需要分别控制各服务，可以手动启动：

```bash
# 1. 安装后端依赖
cd backend
pip install -r requirements.txt

# 2. 安装爬虫依赖
cd ../scraper
pip install -r requirements.txt

# 3. 安装前端依赖
cd ../frontend
npm install

# 4. 启动后端（新终端窗口）
cd ../backend
python main.py

# 5. 运行爬虫抓取数据（可选，新终端窗口）
cd ../scraper
python scraper.py

# 6. 填充演示数据（如果爬虫没有抓到数据）
curl -X POST http://localhost:8000/api/seed

# 7. 启动前端（新终端窗口）
cd ../frontend
npm run dev
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端界面 | http://localhost:3000 |
| 后端 API | http://localhost:8000 |
| API 文档 (Swagger) | http://localhost:8000/docs |

## API 接口

### 获取新闻列表

```
GET /api/news?date=2026-05-14&page=1&category=股市&keyword=芯片
```

| 参数 | 类型 | 说明 |
|------|------|------|
| date | string | 日期筛选，格式 YYYY-MM-DD |
| category | string | 分类筛选 |
| keyword | string | 关键词搜索（标题/摘要） |
| page | int | 页码，默认 1 |

### 获取新闻详情

```
GET /api/news/{id}
```

### 获取原文内容

```
GET /api/news/{id}/source
```

从新闻来源网址抓取原文正文内容。

### 获取分类列表

```
GET /api/categories
```

### 获取可用日期

```
GET /api/dates
```

### 获取统计信息

```
GET /api/stats
```

### 触发爬虫

```
POST /api/scrape
```

### 填充演示数据

```
POST /api/seed
```

## 新闻源配置

编辑 `scraper/config.py` 可添加或修改新闻源：

```python
NEWS_SOURCES = [
    {
        "name": "中国经济网",
        "type": "rss",           # rss 或 web
        "url": "http://...",
        "category": "经济",       # 分类标签
    },
    # 添加更多源...
]
```

支持的抓取方式：
- **rss** — 解析 RSS/Atom 订阅源
- **web** — 网页爬虫提取新闻链接

## 停止服务

**一键启动方式：** 在启动窗口中按任意键，会自动停止所有后台服务。

**手动启动方式：** 关闭各服务的终端窗口即可。

## 常见问题

**Q: 前端显示"暂无新闻数据"**
A: 运行爬虫抓取数据或调用 `POST /api/seed` 填充演示数据。

**Q: 爬虫抓取失败**
A: 检查网络连接，确认新闻源网站可访问。可在 `data/scraper.log` 查看详细错误。

**Q: 端口被占用**
A: 后端默认使用 8000 端口，前端默认使用 3000 端口。如有冲突，修改 `backend/main.py` 和 `frontend/vite.config.js` 中的端口配置。

## License

MIT
