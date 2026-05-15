import React from 'react'

const PLACEHOLDER_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTRhM2I4IiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

const categoryColors = {
  '股市': 'bg-red-100 text-red-700',
  '科技': 'bg-blue-100 text-blue-700',
  '经济': 'bg-green-100 text-green-700',
  '财经': 'bg-yellow-100 text-yellow-700',
  '政策': 'bg-purple-100 text-purple-700',
  '市场': 'bg-orange-100 text-orange-700',
}

export default function NewsCard({ news, onClick }) {
  const colorClass = categoryColors[news.category] || 'bg-gray-100 text-gray-700'

  return (
    <div
      onClick={() => onClick(news)}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={news.image_url || PLACEHOLDER_IMG}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG }}
        />
        {news.category && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {news.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-base leading-snug line-clamp-2 mb-2">
          {news.title}
        </h3>
        {news.summary && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
            {news.summary}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{news.publish_date}</span>
          <span className="flex items-center gap-1 truncate ml-2 max-w-[140px]">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="truncate">{news.source_name || (news.source_url ? new URL(news.source_url).hostname : '')}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
