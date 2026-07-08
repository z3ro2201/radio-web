import type { MetadataRoute } from "next";

// 실제 배포 도메인으로 교체 필요
const BASE_URL = "https://damoaradio.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/web/channel-list", "/web/favorites", "/web/recent", "/web/search", "/web/settings"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "/web/channel-list" ? 1 : 0.5,
  }));
}
