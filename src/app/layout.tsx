import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import ConditionalWrapper from "@/components/layout/ConditionalWrapper";
import { generateDefaultMetadata, generateDefaultViewport } from "@/lib/seo/metadata";
import { OrganizationSchema, WebsiteSchema } from "@/components/seo/StructuredData";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = generateDefaultMetadata();

export const viewport: Viewport = generateDefaultViewport();

export default function RootLayout({
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
      </body>
    </html>
  );
}
