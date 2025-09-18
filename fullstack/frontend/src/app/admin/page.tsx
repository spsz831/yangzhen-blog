'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yangzhen-blog-railway-production.up.railway.app/api'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('auth_token')
    setIsLoggedIn(!!token)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !content) {
      setMessage('请填写标题和内容')
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      setMessage('请先登录')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await axios.post(`${API_URL}/posts`, {
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setMessage('文章发布成功！')
      setTitle('')
      setContent('')
      setExcerpt('')

      // 3秒后跳转到首页
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)

    } catch (error: unknown) {
      console.error('发布失败:', error)
      const errorMessage = error instanceof Error && 'response' in error &&
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : '发布失败，请重试'
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    window.location.href = '/'
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">需要登录</h2>
          <p className="text-gray-600 mb-6">请先登录才能访问管理后台</p>
          <Link
            href="/auth"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            去登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              <Link href="/">杨振的个人博客</Link>
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">管理后台</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">发布新文章</h2>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('成功')
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入文章标题..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章摘要（可选）
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入文章摘要，留空则自动生成..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章内容（支持Markdown）
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入文章内容，支持Markdown格式..."
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回首页
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '发布中...' : '发布文章'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Markdown语法提示</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div><code># 标题</code> - 一级标题</div>
            <div><code>## 标题</code> - 二级标题</div>
            <div><code>**粗体**</code> - 粗体文字</div>
            <div><code>*斜体*</code> - 斜体文字</div>
            <div><code>`代码`</code> - 行内代码</div>
            <div><code>- 列表项</code> - 无序列表</div>
          </div>
        </div>
      </main>
    </div>
  )
}