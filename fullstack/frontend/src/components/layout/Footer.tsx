export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 YangZhen 个人博客. 保留所有权利.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Powered by Next.js</span>
          <span>•</span>
          <span>Built with ❤️</span>
        </div>
      </div>
    </footer>
  );
}