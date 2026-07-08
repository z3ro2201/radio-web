import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { FontSizeProvider } from "@/components/providers/font-size-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import Script from "next/script";

const BASE_URL = "https://radio.2er0.io";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "다모아 라디오 | Korean Radio Online | 韓国ラジオ",
    template: "%s | 다모아 라디오",
  },
  description:
    "대한민국 라디오를 한 곳에서 - 다모아 라디오. KBS, MBC, SBS, CBS 등 전국 지상파/지역 라디오와 인터넷 방송을 실시간으로 들을 수 있어요. " +
    "Listen to Korean radio stations live, all in one place. " +
    "韓国全国のラジオ局をリアルタイムで聴ける韓国ラジオアプリ。",
  keywords: [
    "라디오",
    "인터넷라디오",
    "실시간라디오",
    "지역라디오",
    "KBS라디오",
    "MBC라디오",
    "SBS라디오",
    "korean radio",
    "korean radio online",
    "listen to korean radio",
    "韓国ラジオ",
    "韓国 ラジオ 生放送",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "다모아 라디오 | Korean Radio Online | 韓国ラジオ",
    description: "대한민국 라디오를 한 곳에서. Listen to Korean radio live. 韓国のラジオをリアルタイムで。",
    url: BASE_URL,
    siteName: "다모아 라디오",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "다모아 라디오 | Korean Radio Online | 韓国ラジオ",
    description: "대한민국 라디오를 한 곳에서. Listen to Korean radio live. 韓国のラジオをリアルタイムで。",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "다모아 라디오",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9489",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6002054718389108"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FontSizeProvider>{children}</FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
