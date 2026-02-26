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
      <body>{children}</body>
    </html>
  )
}
