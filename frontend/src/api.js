import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export async function fetchNews({ date, category, keyword, page = 1 } = {}) {
  const params = { page }
  if (date) params.date = date
  if (category) params.category = category
  if (keyword) params.keyword = keyword
  const { data } = await api.get('/news', { params })
  return data
}

export async function fetchNewsDetail(id) {
  const { data } = await api.get(`/news/${id}`)
  return data
}

export async function fetchSourceContent(id) {
  const { data } = await api.get(`/news/${id}/source`, { timeout: 20000 })
  return data
}

export async function fetchCategories() {
  const { data } = await api.get('/categories')
  return data.categories
}

export async function fetchDates() {
  const { data } = await api.get('/dates')
  return data.dates
}

export async function fetchStats() {
  const { data } = await api.get('/stats')
  return data
}

export async function fetchScrapeStatus() {
  const { data } = await api.get('/scrape/status')
  return data
}

export async function fetchScrapeLogs(limit = 200) {
  const { data } = await api.get('/scrape/logs', { params: { limit } })
  return data.logs
}

export async function triggerScrape() {
  const { data } = await api.post('/scrape')
  return data
}
