import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Nova Nest Real Estate | Стара Загора",
    template: "%s | Nova Nest",
  },
  description:
    "Модерна агенция за недвижими имоти в Стара Загора. Продажби, наеми и консултации.",
  keywords: [
    "недвижими имоти",
    "Стара Загора",
    "апартаменти",
    "къщи",
    "офиси",
    "наеми",
    "продажби",
  ],
  openGraph: {
    title: "Nova Nest Real Estate | Стара Загора",
    description:
      "Модерна агенция за недвижими имоти в Стара Загора. Продажби, наеми и консултации.",
    locale: "bg_BG",
    siteName: "Nova Nest",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "16x16 32x32", type: "image/x-icon" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  alternates: undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
