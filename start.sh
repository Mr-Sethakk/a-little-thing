#!/bin/bash
echo "========================================"
echo "  经济新闻抓取与展示系统 - 一键启动"
echo "========================================"
echo

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未找到 Node.js，请先安装 Node.js 16+"
    exit 1
fi

# 安装后端依赖
echo "[1/5] 安装后端依赖..."
cd "$SCRIPT_DIR/backend"
pip3 install -r requirements.txt -q 2>/dev/null

# 安装爬虫依赖
echo "[2/5] 安装爬虫依赖..."
cd "$SCRIPT_DIR/scraper"
pip3 install -r requirements.txt -q 2>/dev/null

# 安装前端依赖
echo "[3/5] 安装前端依赖..."
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    npm install --silent
fi

# 创建数据目录
mkdir -p "$SCRIPT_DIR/data"

# 运行爬虫抓取初始数据
echo "[4/5] 运行新闻爬虫..."
cd "$SCRIPT_DIR/scraper"
python3 scraper.py

# 启动后端服务
echo "[5/5] 启动后端服务..."
cd "$SCRIPT_DIR/backend"
python3 main.py &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端服务
echo
echo "正在启动前端服务..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo
echo "========================================"
echo "  系统启动完成！"
echo
echo "  前端地址: http://localhost:3000"
echo "  后端API:  http://localhost:8000"
echo "  API文档:  http://localhost:8000/docs"
echo
echo "  按 Ctrl+C 停止所有服务"
echo "========================================"

# 捕获退出信号
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
