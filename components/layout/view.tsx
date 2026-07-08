"use client";
import React, { useEffect } from "react";
import { Navigator } from "../ui/navigator";
import { AntennaIcon, HeartIcon, HistoryIcon, SearchIcon, SettingsIcon } from "lucide-react";

// app Navigator List
const NavigatorList = [
  { menuLink: "recent", menuIcon: <HistoryIcon />, menuName: "최근" },
  { menuLink: "channel-list", menuIcon: <AntennaIcon />, menuName: "채널" },
  { menuLink: "search", menuIcon: <SearchIcon />, menuName: "검색" },
  { menuLink: "favorites", menuIcon: <HeartIcon />, menuName: "즐겨찾기" },
  { menuLink: "settings", menuIcon: <SettingsIcon />, menuName: "설정" },
];

const View = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    try {
      // 페이지 이동 시 광고 초기화 실행
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className="container mx-auto max-w-xl h-screen flex flex-col bg-white dark:bg-gray-800">
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-6002054718389108"
          data-ad-slot="YOUR_AD_SLOT"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: "var(--navigator-height, 7.5rem)" }}>
        {children}
      </main>
      <Navigator menuList={NavigatorList} />
    </div>
  );
};

export default View;
