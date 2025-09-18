interface Post {
  id: number
  title: string
  excerpt: string
  createdAt: string
  author?: {
    username: string
  }
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
      <p className="text-gray-600 mb-4">{post.excerpt}</p>
      <div className="text-sm text-gray-500">
        {post.author && <span>作者: {post.author.username} • </span>}
        <time>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</time>
      </div>
    </article>
  )
}
