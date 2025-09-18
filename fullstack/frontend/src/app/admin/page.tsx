'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yangzhen-blog-railway-production.up.railway.app/api'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  createdAt: string
  updatedAt: string
  author?: {
    username: string
  }
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('auth_token')
    setIsLoggedIn(!!token)

    if (token) {
      fetchPosts()
    }
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`)
      setPosts(response.data.posts || [])
    } catch (error) {
      console.error('获取文章失败:', error)
    }
  }

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
      if (editingPost) {
        // 更新文章
        await axios.put(`${API_URL}/posts/${editingPost.id}`, {
          title,
          content,
          excerpt: excerpt || content.substring(0, 150) + '...'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        setMessage('文章更新成功！')
        setEditingPost(null)
        fetchPosts()
      } else {
        // 创建新文章
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
        fetchPosts()
      }

      setTitle('')
      setContent('')
      setExcerpt('')
    } catch (error: unknown) {
      setMessage((error as { response?: { data?: { error?: string } } })?.response?.data?.error || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setTitle(post.title)
    setContent(post.content)
    setExcerpt(post.excerpt)
    setActiveTab('create') // 切换到编辑标签页
    setMessage('')
  }

  const handleCancelEdit = () => {
    setEditingPost(null)
    setTitle('')
    setContent('')
    setExcerpt('')
    setMessage('')
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    window.location.href = '/auth'
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">需要登录</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">请先登录才能访问管理后台</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              <Link href="/">杨振的个人博客</Link>
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">管理后台</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => {
                setActiveTab('create')
                if (!editingPost) {
                  setTitle('')
                  setContent('')
                  setExcerpt('')
                  setMessage('')
                }
              }}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border dark:border-gray-700'
              }`}
            >
              {editingPost ? '编辑文章' : '发布新文章'}
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'manage'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border dark:border-gray-700'
              }`}
            >
              文章管理
            </button>
          </nav>
        </div>

        {activeTab === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {editingPost ? '编辑文章' : '发布新文章'}
            </h2>

            {editingPost && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex justify-between items-center">
                  <p className="text-blue-800 dark:text-blue-200">
                    正在编辑文章: <strong>{editingPost.title}</strong>
                  </p>
                  <button
                    onClick={handleCancelEdit}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                  >
                    取消编辑
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.includes('成功')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文章标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="输入文章标题..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文章摘要（可选）
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="输入文章摘要..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文章内容（支持Markdown）
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={15}
                  placeholder="输入文章内容..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                {editingPost && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    取消
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '处理中...' : editingPost ? '更新文章' : '发布文章'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">文章管理</h2>

            {posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">暂无文章，快去发布第一篇文章吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{post.excerpt}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span>创建时间: {new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                          {post.updatedAt !== post.createdAt && (
                            <span className="ml-4">更新时间: {new Date(post.updatedAt).toLocaleDateString('zh-CN')}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-6 flex space-x-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          编辑
                        </button>
                        <Link
                          href={`/posts/${post.slug}`}
                          target="_blank"
                          className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          预览
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}