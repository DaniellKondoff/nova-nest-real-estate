import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
