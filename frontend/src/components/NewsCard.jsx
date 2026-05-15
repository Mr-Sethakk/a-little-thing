import React from 'react'

const PLACEHOLDER_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTRhM2I4IiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

const categoryImages = {
  '股市': 'data:image/svg+xml;base64,' + btoa(`<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fecaca"/><stop offset="100%" stop-color="#fca5a5"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><polyline points="30,130 70,90 110,110 150,50 190,70 230,30 270,60 290,40" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="230" cy="30" r="4" fill="#dc2626"/><text x="160" y="165" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#991b1b">Stock Market</text></svg>`),
  '科技': 'data:image/svg+xml;base64,' + btoa(`<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#bfdbfe"/><stop offset="100%" stop-color="#93c5fd"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><circle cx="160" cy="75" r="28" fill="none" stroke="#2563eb" stroke-width="2.5"/><circle cx="160" cy="75" r="12" fill="#2563eb" opacity="0.7"/><line x1="160" y1="47" x2="160" y2="20" stroke="#2563eb" stroke-width="2"/><line x1="160" y1="103" x2="160" y2="130" stroke="#2563eb" stroke-width="2"/><line x1="132" y1="75" x2="105" y2="75" stroke="#2563eb" stroke-width="2"/><line x1="188" y1="75" x2="215" y2="75" stroke="#2563eb" stroke-width="2"/><line x1="140" y1="55" x2="120" y2="35" stroke="#2563eb" stroke-width="2"/><line x1="180" y1="95" x2="200" y2="115" stroke="#2563eb" stroke-width="2"/><text x="160" y="165" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#1e40af">Technology</text></svg>`),
  '财经': 'data:image/svg+xml;base64,' + btoa('<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef3c7"/><stop offset="100%" stop-color="#fde68a"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><circle cx="160" cy="70" r="32" fill="none" stroke="#d97706" stroke-width="2.5"/><circle cx="160" cy="70" r="22" fill="none" stroke="#d97706" stroke-width="1.5" opacity="0.5"/><circle cx="160" cy="70" r="6" fill="#d97706" opacity="0.6"/><line x1="100" y1="115" x2="220" y2="115" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/><line x1="110" y1="125" x2="210" y2="125" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><line x1="120" y1="135" x2="200" y2="135" stroke="#d97706" stroke-width="1" stroke-linecap="round" opacity="0.3"/><text x="160" y="165" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#92400e">Finance</text></svg>'),
  '政策': 'data:image/svg+xml;base64,' + btoa(`<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e9d5ff"/><stop offset="100%" stop-color="#d8b4fe"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><rect x="135" y="25" width="50" height="65" rx="3" fill="none" stroke="#7c3aed" stroke-width="2.5"/><line x1="145" y1="40" x2="175" y2="40" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/><line x1="145" y1="50" x2="175" y2="50" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/><line x1="145" y1="60" x2="165" y2="60" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/><line x1="125" y1="90" x2="195" y2="90" stroke="#7c3aed" stroke-width="3" stroke-linecap="round"/><circle cx="160" cy="90" r="4" fill="#7c3aed"/><line x1="160" y1="90" x2="160" y2="130" stroke="#7c3aed" stroke-width="2.5"/><line x1="140" y1="130" x2="180" y2="130" stroke="#7c3aed" stroke-width="3" stroke-linecap="round"/><text x="160" y="165" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#5b21b6">Policy</text></svg>`),
}

const categoryColors = {
  '股市': 'bg-red-100 text-red-700',
  '科技': 'bg-blue-100 text-blue-700',
  '财经': 'bg-yellow-100 text-yellow-700',
  '政策': 'bg-purple-100 text-purple-700',
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
          src={news.image_url || categoryImages[news.category] || PLACEHOLDER_IMG}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { e.target.src = categoryImages[news.category] || PLACEHOLDER_IMG }}
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
