"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { getRecent, addRecent, clearRecent as clearRecentStorage } from "@/lib/storage/recent";
import { usePlayer } from "./player-provider";

interface RecentContextValue {
  recent: ReturnType<typeof getRecent>;
  clearRecent: () => void;
}

const RecentContext = createContext<RecentContextValue | null>(null);

export const RecentProvider = ({ children }: { children: ReactNode }) => {
  const { currentChannel } = usePlayer();
  const [recent, setRecent] = useState<ReturnType<typeof getRecent>>([]);
  // 같은 채널로 currentChannel 객체가 재생성돼 리렌더링될 때마다 중복 기록되는 걸 막기 위한 마지막 채널 id 추적
  const lastRecordedIdRef = useRef<string | null>(null);

  // 최초 마운트 시 localStorage에서 기존 목록을 불러온다
  useEffect(() => {
    setRecent(getRecent());
  }, []);

  // 재생 중인 채널이 바뀔 때마다(= 새로 재생을 시작할 때마다) 최근목록에 자동 기록
  useEffect(() => {
    if (!currentChannel?.channelId) return;
    if (lastRecordedIdRef.current === currentChannel.channelId) return;

    lastRecordedIdRef.current = currentChannel.channelId;
    setRecent(addRecent(currentChannel));
  }, [currentChannel]);

  const clearRecent = () => {
    clearRecentStorage();
    setRecent([]);
  };

  return <RecentContext.Provider value={{ recent, clearRecent }}>{children}</RecentContext.Provider>;
};

export const useRecent = () => {
  const ctx = useContext(RecentContext);

  if (!ctx) {
    throw new Error("useRecent는 RecentProvider 내부에서만 사용할 수 있습니다.");
  }

  return ctx;
};
