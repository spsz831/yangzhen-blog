'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  excerpt: string
  createdAt: string
  author?: {
    username: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yangzhen-blog-railway-production.up.railway.app/api'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 检查URL参数，支持管理员快速访问
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === '1' || urlParams.get('m') === 'admin') {
      window.location.href = '/auth'
      return
    }

    // 添加快捷键监听
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl + Alt + A = 管理后台
      if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault()
        window.location.href = '/auth'
      }
      // Ctrl + Shift + L = 登录
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        event.preventDefault()
        window.location.href = '/auth'
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    // 获取文章数据
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/posts`)
        setPosts(response.data.posts || [])
        setError(null)
      } catch (err) {
        console.error('获取文章失败:', err)
        setError('获取文章失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()

    // 清理事件监听器
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              杨振的个人博客
            </h1>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">首页</Link>
              {typeof window !== 'undefined' && localStorage.getItem('auth_token') && (
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">管理后台</Link>
              )}
              <Link href="/about" className="text-gray-600 hover:text-gray-900">关于</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">欢迎来到我的博客</h2>
          <p className="text-gray-600">分享技术心得和项目经验</p>
        </div>

        {/* Posts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">最新文章</h2>

          {loading && (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">暂无文章</p>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600">
                    <Link href={`/posts/${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      {post.author && <span>作者: {post.author.username} • </span>}
                      <time>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</time>
                    </div>
                    <Link
                      href={`/posts/${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      阅读更多 →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 杨振的个人博客. 所有权利保留.</p>
          <p className="mt-2 text-sm">Powered by Next.js + Railway API</p>
        </div>
      </footer>
    </div>
  )
}