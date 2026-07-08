"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import Player from "./player";

interface ButtonProps {
  menuName: string | null;
  menuLink: string | null;
  menuIcon: React.ReactNode | null;
}

interface NavigatorProps {
  menuList: ButtonProps[];
}

const NavigatorButton = ({ menuName, menuLink, menuIcon }: ButtonProps) => {
  return (
    <Link
      href={menuLink || "#"}
      className="flex flex-col items-center justify-center gap-1 py-1 px-2 text-gray-700 dark:text-gray-300"
    >
      <div className="w-6 h-6">{menuIcon}</div>
      <span className="text-xs">{menuName}</span>
    </Link>
  );
};

export const Navigator = ({ menuList }: NavigatorProps) => {
  const navRef = useRef<HTMLDivElement>(null);

  // Player 높이가 재생 상태에 따라 바뀔 수 있어서, 실제 렌더링된 높이를
  // 측정해 CSS 변수로 내보낸다. main이 이 값만큼 하단 패딩을 잡아 가림 현상을 막는다.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty("--navigator-height", `${el.offsetHeight}px`);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={navRef} className="fixed bottom-0 left-0 w-screen z-50">
      <div className="container mx-auto max-w-xl flex flex-col">
        <Player />
        <div className="h-16 pb-[env(safe-area-inset-bottom)] flex items-center justify-around border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {menuList.map((menu, index) => (
            <NavigatorButton menuName={menu.menuName} menuIcon={menu.menuIcon} menuLink={menu.menuLink} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};
