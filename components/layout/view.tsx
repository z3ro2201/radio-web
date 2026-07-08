"use client";
import React from "react";
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
  return (
    <div className="container mx-auto max-w-xl h-screen flex flex-col bg-white">
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: "var(--navigator-height, 7.5rem)" }}>
        {children}
      </main>
      <Navigator menuList={NavigatorList} />
    </div>
  );
};

export default View;
