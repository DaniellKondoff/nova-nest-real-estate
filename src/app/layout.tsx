import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import ConditionalWrapper from "@/components/layout/ConditionalWrapper";

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
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
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
      <body className={`${inter.variable} antialiased flex min-h-screen flex-col`}>
        <ConditionalWrapper>
          {children}
        </ConditionalWrapper>
      </body>
    </html>
  );
}
