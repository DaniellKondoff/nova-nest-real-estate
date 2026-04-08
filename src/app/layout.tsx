import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "../styles/globals.css";
import ConditionalWrapper from "@/components/layout/ConditionalWrapper";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { generateDefaultMetadata, generateDefaultViewport } from "@/lib/seo/metadata";
import { env } from "@/lib/env";
import { OrganizationSchema, WebsiteSchema } from "@/components/seo/StructuredData";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = generateDefaultMetadata();

export const viewport: Viewport = generateDefaultViewport();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={`${inter.variable} antialiased`}>
        <OrganizationSchema />
        <WebsiteSchema />
        <ConditionalWrapper>
          {children}
        </ConditionalWrapper>
        {env.NEXT_PUBLIC_CHAT_ENABLED !== "false" && <ChatWidget />}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
