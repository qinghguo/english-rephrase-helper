export const metadata = {
  title: 'English Rephrase Coach',
  description: 'Practice English rephrasing with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* 加上这一行，淡蓝色 UI 才会直接生效！ */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
