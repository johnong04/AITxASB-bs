import "./globals.css";

export const metadata = {
  title: "ASBhive Ecosystem Data Aggregator",
  description:
    "Discover and connect with Malaysian Social Enterprises. Powered by AI for intelligent search and insights.",
  keywords:
    "social enterprises, Malaysia, ASB, ecosystem, sustainability, innovation",
  authors: [{ name: "ASBhive Team" }],
  creator: "ASBhive",
  publisher: "ASBhive",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  generator: "Next.js",
  applicationName: "ASBhive Ecosystem Data Aggregator",
  referrer: "origin-when-cross-origin",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
