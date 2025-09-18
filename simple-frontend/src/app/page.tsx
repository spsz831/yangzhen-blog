'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  createdAt: string
  author?: {
    username: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yangzhen-blog-railway-production.up.railway.app/api'

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <a href="/" className="logo">YangZhen 博客</a>
            <ul className="nav-links">
              <li><a href="/">首页</a></li>
              <li><a href="/posts">文章</a></li>
              <li><a href="/categories">分类</a></li>
              <li><a href="/about">关于</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          <h1>欢迎来到 YangZhen 个人博客</h1>
          <p>分享技术心得和项目经验</p>

          {/* API Status */}
          <div style={{ background: '#f0f8ff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3>🔗 API 连接状态</h3>
            <p><strong>API URL:</strong> {API_URL}</p>
            <p><strong>状态:</strong> {loading ? '连接中...' : error ? '❌ 连接失败' : '✅ 连接成功'}</p>
          </div>

          {/* Posts */}
          <h2>最新文章</h2>

          {loading && <div className="loading">正在加载文章...</div>}

          {error && <div className="error">{error}</div>}

          {!loading && !error && posts.length === 0 && (
            <div className="loading">暂无文章</div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="posts-grid">
              {posts.map((post) => (
                <article key={post.id} className="post-card">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-meta">
                    {post.author?.username && `作者: ${post.author.username} • `}
                    {formatDate(post.createdAt)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 YangZhen 个人博客. 所有权利保留.</p>
          <p>Powered by Next.js + Railway API</p>
        </div>
      </footer>
    </div>
  )
}