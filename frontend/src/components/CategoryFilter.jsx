import React from 'react'

const defaultCategories = [
  { key: '', label: '全部' },
  { key: '股市', label: '股市' },
  { key: '科技', label: '科技' },
  { key: '经济', label: '经济' },
  { key: '财经', label: '财经' },
  { key: '政策', label: '政策' },
  { key: '市场', label: '市场' },
]

const EXCLUDED = ['市场', '经济']

export default function CategoryFilter({ categories, selected, onChange }) {
  const allCategories = [
    { key: '', label: '全部' },
    ...categories.filter((c) => !EXCLUDED.includes(c)).map((c) => ({ key: c, label: c })),
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === cat.key
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
