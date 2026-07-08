import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { FontSizeProvider } from "@/components/providers/font-size-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 실제 배포 도메인으로 교체 필요 - OG 이미지 등 절대경로 URL 만드는 기준이 됨
const BASE_URL = "https://damoaradio.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "다모아 라디오",
    template: "%s | 다모아 라디오", // 하위 페이지에서 title만 지정하면 자동으로 뒤에 붙음
  },
  description:
    "대한민국 라디오를 한 곳에서 - 다모아 라디오. KBS, MBC, SBS, CBS 등 전국 지상파/지역 라디오와 인터넷 방송을 실시간으로 들을 수 있어요.",
  keywords: ["라디오", "인터넷라디오", "실시간라디오", "지역라디오", "KBS라디오", "MBC라디오", "SBS라디오"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "다모아 라디오",
    description: "대한민국 라디오를 한 곳에서 - 다모아 라디오",
    url: BASE_URL,
    siteName: "다모아 라디오",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "다모아 라디오",
    description: "대한민국 라디오를 한 곳에서 - 다모아 라디오",
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
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FontSizeProvider>{children}</FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
