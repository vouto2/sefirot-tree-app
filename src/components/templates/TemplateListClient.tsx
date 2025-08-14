'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import SelectTemplateForTreeModal from './SelectTemplateForTreeModal'

interface Template {
  id: string
  name: string
  description?: string | null // Changed
  created_at: string
  // updated_at: string // Removed as per new DB schema
}

interface TemplateListClientProps {
  initialTemplates: Template[]
}

export default function TemplateListClient({ initialTemplates }: TemplateListClientProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [isSelectTemplateForTreeModalOpen, setIsSelectTemplateForTreeModalOpen] = useState(false)
  const router = useRouter()

  const handleCreateTreeFromTemplateClick = () => {
    setIsSelectTemplateForTreeModalOpen(true)
  }

  // Removed handleEditClick function and "編集" button as per user's request
  // const handleEditClick = (template: Template) => {
  //   setEditingTemplateData(template)
  //   alert('テンプレートの編集機能は現在無効です。')
  // }

  const handleDeleteClick = async (id: string) => {
    if (!confirm('本当にこのテンプレートを削除しますか？')) {
      return
    }

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'テンプレートの削除に失敗しました。')
      }

      setTemplates(templates.filter((template) => template.id !== id))
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unknown error occurred')
      }
    }
  }

  const handleSelectTemplateForTreeModalClose = () => {
    setIsSelectTemplateForTreeModalOpen(false)
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreateTreeFromTemplateClick}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          テンプレートから樹を作成
        </button>
      </div>

      {templates.length === 0 ? (
        <p>まだテンプレートがありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">名前</th>
                <th className="py-2 px-4 border-b text-left">説明</th> {/* Changed from タイトル */}
                <th className="py-2 px-4 border-b text-left">作成日</th>
                <th className="py-2 px-4 border-b text-left">アクション</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{template.name}</td>
                  <td className="py-2 px-4 border-b">{template.description || 'なし'}</td> {/* Changed from title_template */}
                  <td className="py-2 px-4 border-b">{format(new Date(template.created_at), 'yyyy/MM/dd HH:mm')}</td>
                  <td className="py-2 px-4 border-b">
                    {/* Removed "編集" button */}
                    <button
                      onClick={() => handleDeleteClick(template.id)}
                      className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-2 rounded"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SelectTemplateForTreeModal
        isOpen={isSelectTemplateForTreeModalOpen}
        onClose={handleSelectTemplateForTreeModalClose}
        templates={templates.map(t => ({ id: t.id, name: t.name }))}
      />
    </>
  )
}