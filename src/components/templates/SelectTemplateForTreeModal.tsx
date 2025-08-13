'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Template {
  id: string
  name: string
  description: string | null // Added description
}

interface SelectTemplateForTreeModalProps {
  isOpen: boolean
  onClose: () => void
  templates: Template[]
}

export default function SelectTemplateForTreeModal({ isOpen, onClose, templates }: SelectTemplateForTreeModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const router = useRouter()

  if (!isOpen) return null

  const handleCreateTree = () => {
    if (selectedTemplateId) {
      router.push(`/trees?templateId=${selectedTemplateId}`)
      onClose()
    } else {
      alert('テンプレートを選択してください。')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">テンプレートから樹を作成</h2>
        {templates.length === 0 ? (
          <p>利用可能なテンプレートがありません。</p>
        ) : (
          <div className="mb-4 max-h-60 overflow-y-auto">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center mb-2">
                <input
                  type="radio"
                  id={`template-${template.id}`}
                  name="selectedTemplate"
                  value={template.id}
                  checked={selectedTemplateId === template.id}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="mr-2"
                />
                <label htmlFor={`template-${template.id}`}>
                  {template.name}
                  {template.description && <span className="text-gray-500 text-sm ml-2">({template.description})</span>}
                </label>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleCreateTree}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            disabled={templates.length === 0}
          >
            樹を作成
          </button>
        </div>
      </div>
    </div>
  )
}