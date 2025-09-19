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
  const [contentTextarea, setContentTextarea] = useState<HTMLTextAreaElement | null>(null)

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

  // Markdown编辑器功能函数
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    if (!contentTextarea) return

    const start = contentTextarea.selectionStart
    const end = contentTextarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = selectedText || placeholder

    const newContent = content.substring(0, start) + before + replacement + after + content.substring(end)
    setContent(newContent)

    // 重新聚焦并设置光标位置
    setTimeout(() => {
      if (contentTextarea) {
        contentTextarea.focus()
        const newCursorPos = start + before.length + replacement.length
        contentTextarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const insertHeading = (level: number) => {
    const headingPrefix = '#'.repeat(level) + ' '
    insertMarkdown(headingPrefix, '', `标题 ${level}`)
  }

  const toggleBold = () => {
    insertMarkdown('**', '**', '粗体文本')
  }

  const toggleItalic = () => {
    insertMarkdown('*', '*', '斜体文本')
  }

  const insertLink = () => {
    insertMarkdown('[', '](url)', '链接文本')
  }

  const insertCode = () => {
    insertMarkdown('`', '`', '代码')
  }

  const insertCodeBlock = () => {
    insertMarkdown('```\n', '\n```', '代码块')
  }

  const insertList = () => {
    insertMarkdown('- ', '', '列表项')
  }

  const insertNumberedList = () => {
    insertMarkdown('1. ', '', '列表项')
  }

  const insertQuote = () => {
    insertMarkdown('> ', '', '引用文本')
  }

  // 键盘快捷键处理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
        case 'B':
          e.preventDefault()
          toggleBold()
          break
        case 'i':
        case 'I':
          e.preventDefault()
          toggleItalic()
          break
        case 'k':
        case 'K':
          e.preventDefault()
          insertLink()
          break
        case '`':
          e.preventDefault()
          insertCode()
          break
      }
    }
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
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                {/* 标题下拉菜单 */}
                <div className="relative group">
                  <button className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs font-medium">
                    ⇩ 标题
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button onClick={() => insertHeading(1)} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-xl font-bold">H1 标题 1</button>
                    <button onClick={() => insertHeading(2)} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-lg font-semibold">H2 标题 2</button>
                    <button onClick={() => insertHeading(3)} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-base font-medium">H3 标题 3</button>
                    <button onClick={() => insertHeading(4)} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium">H4 标题 4</button>
                  </div>
                </div>

                <span className="text-gray-300 dark:text-gray-600">|</span>

                {/* 格式化按钮 */}
                <button onClick={toggleBold} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-bold text-sm" title="粗体 (Ctrl+B)">
                  B
                </button>
                <button onClick={toggleItalic} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded italic text-sm" title="斜体 (Ctrl+I)">
                  I
                </button>
                <button onClick={insertLink} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm" title="插入链接">
                  🔗
                </button>
                <button onClick={insertCode} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm font-mono" title="行内代码">
                  {'</>'}
                </button>
                <button onClick={insertCodeBlock} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm" title="代码块">
                  💻
                </button>

                <span className="text-gray-300 dark:text-gray-600">|</span>

                {/* 列表按钮 */}
                <button onClick={insertList} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm" title="无序列表">
                  •
                </button>
                <button onClick={insertNumberedList} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm" title="有序列表">
                  1.
                </button>
                <button onClick={insertQuote} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm" title="引用">
                  ❝
                </button>

                <span className="text-gray-300 dark:text-gray-600 ml-4">|</span>
                <span className="text-xs">支持 Markdown 格式化语法</span>
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
                      ref={setContentTextarea}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                      rows={20}
                      placeholder="在此处输入文章内容，支持 Markdown 格式...&#10;快捷键: Ctrl+B (粗体), Ctrl+I (斜体), Ctrl+K (链接), Ctrl+` (代码)"
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