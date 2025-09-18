'use client'
import Link from 'next/link'

export default function PostsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            <Link href="/">YangZhen 个人博客</Link>
          </h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">所有文章</h2>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-600">文章列表功能正在开发中...</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">← 返回首页</Link>
        </div>
      </main>
    </div>
  )
}
