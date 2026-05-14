import React, { useState } from 'react'
import { fetchSourceContent } from '../api'

const PLACEHOLDER_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTRhM2I4IiBmb250LXNpemU9IjE4Ij7ml6DmnIjliqDovb3lm77niYc8L3RleHQ+PC9zdmc+'

export default function NewsDetail({ news, onClose }) {
  const [sourceContent, setSourceContent] = useState(null)
  const [loadingSource, setLoadingSource] = useState(false)
  const [showSource, setShowSource] = useState(false)

  if (!news) return null

  const handleFetchSource = async () => {
    if (sourceContent) {
      setShowSource(!showSource)
      return
    }
    setLoadingSource(true)
    try {
      const data = await fetchSourceContent(news.id)
      if (data.status === 'success' && data.content) {
        setSourceContent(data.content)
        setShowSource(true)
      } else {
        window.open(news.source_url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(news.source_url, '_blank', 'noopener,noreferrer')
    } finally {
      setLoadingSource(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-2xl">
          <img
            src={news.image_url || PLACEHOLDER_IMG}
            alt={news.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = PLACEHOLDER_IMG }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {news.category && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm mb-3">
                {news.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {news.title}
            </h1>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {news.publish_date}
            </span>

            {(news.source_name || news.source_url) && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                {news.source_name || (news.source_url ? new URL(news.source_url).hostname : '')}
              </span>
            )}

            {news.source_url && (
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                跳转原文
              </a>
            )}

            {news.source_url && (
              <button
                onClick={handleFetchSource}
                disabled={loadingSource}
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors disabled:opacity-50"
              >
                {loadingSource ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {loadingSource ? '正在获取...' : (showSource ? '收起原文' : '查看原文')}
              </button>
            )}
          </div>

          {news.summary && !showSource && (
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <p className="text-gray-700 leading-relaxed text-base">{news.summary}</p>
            </div>
          )}

          {news.content && news.content !== news.summary && !showSource && (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                {news.content}
              </p>
            </div>
          )}

          {showSource && sourceContent && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                  原文内容
                </span>
                {news.source_name && (
                  <span className="text-xs text-gray-400">来源: {news.source_name}</span>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-5 max-h-[50vh] overflow-y-auto">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                  {sourceContent}
                </p>
              </div>
            </div>
          )}

          {!news.content && !news.summary && !showSource && (
            <p className="text-gray-400 text-center py-8">暂无详细内容，可点击"查看原文"或"跳转原文"阅读完整文章</p>
          )}
        </div>
      </div>
    </div>
  )
}
