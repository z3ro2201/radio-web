import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"], // API 라우트는 크롤링 대상 아님
    },
    sitemap: "https://damoaradio.example.com/sitemap.xml", // 실제 도메인으로 교체 필요
  };
}
