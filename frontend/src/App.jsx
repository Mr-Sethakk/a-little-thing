import React, { useState, useEffect, useCallback } from 'react'
import { fetchNews, fetchCategories, fetchDates, fetchStats, fetchScrapeStatus } from './api'
import NewsCard from './components/NewsCard'
import NewsDetail from './components/NewsDetail'
import CategoryFilter from './components/CategoryFilter'
import Pagination from './components/Pagination'

export default function App() {
  const [news, setNews] = useState([])
  const [categories, setCategories] = useState([])
  const [dates, setDates] = useState([])
  const [stats, setStats] = useState({})
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedNews, setSelectedNews] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dark, setDark] = useState(false)
  const [newCount, setNewCount] = useState(0)

  const loadNews = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchNews({
        date: selectedDate || undefined,
        category: selectedCategory || undefined,
        keyword: keyword || undefined,
        page,
      })
      setNews(data.news)
      setTotalPages(data.total_pages)
      setTotalCount(data.total_count)
    } catch (err) {
      console.error('Failed to load news:', err)
      setNews([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedCategory, keyword, page])

  useEffect(() => {
    loadNews()
  }, [loadNews])

  useEffect(() => {
    Promise.all([fetchCategories(), fetchDates(), fetchStats()])
      .then(([cats, dts, st]) => {
        setCategories(cats)
        setDates(dts)
        setStats(st)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
  }, [dark])

  // Poll every 60s: check if backend scraped new news
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const st = await fetchStats()
        if (st.total_news > totalCount && totalCount > 0) {
          setNewCount(st.total_news - totalCount)
        }
      } catch {}
    }, 60000)
    return () => clearInterval(interval)
  }, [totalCount])

  const handleRefresh = () => {
    setNewCount(0)
    loadNews()
    fetchStats().then(setStats).catch(() => {})
    fetchCategories().then(setCategories).catch(() => {})
    fetchDates().then(setDates).catch(() => {})
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(1)
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setPage(1)
  }

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setPage(1)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b ${dark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  每日经济新闻
                </h1>
                <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stats.total_news ? `${stats.total_news} 条新闻` : '加载中...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="hidden sm:flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="搜索新闻..."
                    className={`w-56 pl-10 pr-4 py-2 rounded-xl text-sm border outline-none transition-all focus:w-72 ${
                      dark
                        ? 'bg-gray-800 border-gray-700 text-gray-100 focus:border-blue-500'
                        : 'bg-gray-100 border-transparent text-gray-900 focus:bg-white focus:border-blue-300'
                    }`}
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
              <button
                onClick={() => setDark(!dark)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  dark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pt-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索新闻..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none ${
              dark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
            }`}
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* New news banner */}
        {newCount > 0 && (
          <div className="mb-4">
            <button
              onClick={handleRefresh}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all animate-pulse ${
                dark
                  ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70 border border-blue-700'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {newCount} 条新新闻已抓取，点击刷新
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Date selector */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>日期:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleDateChange('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !selectedDate
                    ? 'bg-blue-600 text-white'
                    : dark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                全部
              </button>
              {dates.slice(0, 10).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDateChange(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDate === d
                      ? 'bg-blue-600 text-white'
                      : dark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            {loading ? '加载中...' : `共 ${totalCount} 条新闻`}
          </p>
        </div>

        {/* News grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`rounded-xl overflow-hidden animate-pulse ${dark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`h-44 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className="p-4 space-y-3">
                  <div className={`h-4 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'} w-3/4`} />
                  <div className={`h-3 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'} w-full`} />
                  <div className={`h-3 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'} w-1/2`} />
                </div>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} onClick={setSelectedNews} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className={`text-lg font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>暂无新闻数据</p>
            <p className={`text-sm mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>请先运行爬虫抓取新闻数据</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </main>

      {/* News Detail Modal */}
      <NewsDetail news={selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  )
}
