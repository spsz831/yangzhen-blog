export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">关于我</h1>

        <div className="prose prose-lg max-w-none">
          <p>
            欢迎来到我的个人博客！我是 YangZhen，一名热爱技术的开发者。
          </p>

          <h2>关于这个博客</h2>
          <p>
            这个博客是我分享技术见解、学习心得和生活感悟的地方。在这里，你可以找到：
          </p>

          <ul>
            <li>前端开发技术文章</li>
            <li>后端架构设计分享</li>
            <li>编程学习心得</li>
            <li>项目开发经验</li>
            <li>技术趋势思考</li>
          </ul>

          <h2>技术栈</h2>
          <p>
            我主要使用以下技术栈进行开发：
          </p>

          <ul>
            <li><strong>前端：</strong>React, Next.js, TypeScript, Tailwind CSS</li>
            <li><strong>后端：</strong>Node.js, Express, PostgreSQL, Prisma</li>
            <li><strong>工具：</strong>Git, Docker, VS Code</li>
          </ul>

          <h2>联系我</h2>
          <p>
            如果你想与我交流技术话题或有任何问题，欢迎通过以下方式联系我：
          </p>

          <ul>
            <li>邮箱：yangzhen@example.com</li>
            <li>GitHub：github.com/yangzhen</li>
            <li>Twitter：@yangzhen</li>
          </ul>

          <p>
            感谢你的访问，希望我的分享能对你有所帮助！
          </p>
        </div>
      </div>
    </div>
  );
}