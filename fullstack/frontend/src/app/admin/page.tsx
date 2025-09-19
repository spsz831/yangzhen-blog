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
          <div className="max-w-4xl mx-auto">
            {/* 编辑器工具栏 */}
            <div className="bg-white dark:bg-gray-800 rounded-t-lg border border-b-0 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-bold">B</button>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded italic">I</button>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  <span className="text-gray-400">|</span>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6M9 16h6m2-8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                </div>
                <span className="text-gray-400">|</span>
                <span>在此处输入，使用 Markdown、BBCode 或 HTML 进行格式化，插件或插入图片。</span>
              </div>
            </div>

            {/* 主编辑区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-b-lg border dark:border-gray-700 shadow-sm">
              {editingPost && (
                <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
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
                <div className={`px-6 py-4 border-b dark:border-gray-700 ${
                  message.includes('成功')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* 文章标题 */}
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-0 py-3 text-2xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="请输入文章标题..."
                    required
                  />
                  <div className="h-px bg-gray-200 dark:bg-gray-700 mt-2"></div>
                </div>

                {/* 文章摘要 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    文章摘要 <span className="text-gray-400">(可选)</span>
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                    rows={3}
                    placeholder="输入文章摘要..."
                  />
                </div>

                {/* 文章内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    文章内容 <span className="text-gray-400">(支持Markdown)</span>
                  </label>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                      rows={20}
                      placeholder="在此处输入文章内容，支持 Markdown 格式..."
                      required
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    在用时：新增评论通论者功能查询功能或还是含有类似问题。编辑器会告诉你提示相关问题。
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    搞笑，回复谁记录，真诚，关爱，回趣，专业，共建你我们以为来支之社区。
                  </div>
                </div>
              </form>
            </div>

            {/* 底部按钮区域 */}
            <div className="flex justify-between items-center mt-6 px-2">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('manage')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  文章管理
                </button>
              </div>
              <div className="flex items-center space-x-3">
                {editingPost && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    取消
                  </button>
                )}
                <button
                  type="submit"
                  form="article-form"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handleSubmit}
                >
                  {loading ? '发布中...' : editingPost ? '更新文章' : '发布文章'}
                </button>
              </div>
            </div>
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