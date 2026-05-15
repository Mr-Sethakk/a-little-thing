import { useState, useEffect, useRef } from 'react'
import { fetchScrapeLogs } from '../api'

export default function Console({ onClose, dark }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const wasAtBottomRef = useRef(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await fetchScrapeLogs(500)
        if (active) setLogs(data)
      } catch {} finally {
        if (active) setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 2000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  // Track if user is near the bottom before update
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      wasAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50
    }
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Only auto-scroll if user was already at the bottom
  useEffect(() => {
    if (wasAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  const statusColor = (s) =>
    s === 'success' ? 'text-green-400' : 'text-red-400'

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${dark ? 'bg-gray-950' : 'bg-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-sm font-mono text-gray-200 font-semibold tracking-wide">
            SCRAPE CONSOLE
          </h2>
          <span className="text-xs text-gray-500 font-mono">
            {logs.length} entries
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs font-mono text-gray-400 bg-gray-800 rounded hover:bg-gray-700 hover:text-gray-200 transition-colors"
        >
          CLOSE [ESC]
        </button>
      </div>

      {/* Table header */}
      <div className="px-6 py-2 bg-gray-900/80 border-b border-gray-800/50 font-mono text-xs text-gray-500 grid grid-cols-[170px_120px_1fr_130px_70px_70px_70px] gap-2">
        <span>TIME</span>
        <span>SOURCE</span>
        <span>URL</span>
        <span>IP</span>
        <span className="text-right">FOUND</span>
        <span className="text-right">NEW</span>
        <span className="text-center">STATUS</span>
      </div>

      {/* Log entries */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-2 font-mono text-xs">
        {loading ? (
          <div className="text-gray-500 py-8 text-center">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-600 py-8 text-center">No scrape logs yet. Waiting for first scrape...</div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={`grid grid-cols-[170px_120px_1fr_130px_70px_70px_70px] gap-2 py-1.5 border-b border-gray-800/30 items-center ${
                i === 0 ? 'bg-gray-800/30' : ''
              }`}
            >
              <span className="text-gray-400">{log.time}</span>
              <span className="text-cyan-400 truncate">{log.source}</span>
              <span className="text-gray-500 truncate" title={log.url}>{log.url}</span>
              <span className="text-yellow-500/80">{log.ip}</span>
              <span className="text-right text-gray-300">{log.count}</span>
              <span className="text-right text-green-400">{log.new}</span>
              <span className={`text-center ${statusColor(log.status)}`}>
                {log.status === 'success' ? '[OK]' : '[ERR]'}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="px-6 py-2 bg-gray-900 border-t border-gray-800 text-xs font-mono text-gray-600 flex justify-between">
        <span>Auto-refresh: 2s</span>
        <span>Scroll to see latest entries</span>
      </div>
    </div>
  )
}
