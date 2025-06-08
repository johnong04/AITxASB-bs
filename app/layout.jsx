import "./globals.css"

export const metadata = {
  title: "ASBhive Ecosystem Hub",
  description: "Discover and connect with social enterprises across Asia",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
