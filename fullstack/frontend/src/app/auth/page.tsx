'use client'
import Link from 'next/link'
import { useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yangzhen-blog-railway-production.up.railway.app/api'

export default function AuthPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setMessage('请输入用户名和密码')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      })

      if (response.data.token) {
        // 保存token到localStorage
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user_info', JSON.stringify(response.data.user))

        setMessage('登录成功！')
        setIsLoggedIn(true)

        // 3秒后跳转到管理后台
        setTimeout(() => {
          window.location.href = '/admin'
        }, 2000)
      }
    } catch (error: unknown) {
      console.error('登录失败:', error)
      const errorMessage = error instanceof Error && 'response' in error &&
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : '登录失败，请检查用户名和密码'
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">登录成功！</h2>
          <p className="text-gray-600 mb-4">正在跳转到管理后台...</p>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">立即跳转</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            <Link href="/">YangZhen 个人博客</Link>
          </h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">管理员登录</h2>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              message.includes('成功')
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入用户名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入密码"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              仅限管理员访问
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
