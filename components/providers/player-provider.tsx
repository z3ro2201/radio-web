"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BroadcastProps } from "@/common/props/broadcast";

type PlayerViewMode = "bar" | "now";

interface PlayerContextValue {
  currentChannel: BroadcastProps | null;
  isPlay: boolean;
  isBuffering: boolean;
  hasError: boolean;
  viewMode: PlayerViewMode;
  play: (channel: BroadcastProps) => void;
  pause: () => void;
  toggle: () => void;
  setIsBuffering: (value: boolean) => void;
  setHasError: (value: boolean) => void;
  setViewMode: (mode: PlayerViewMode) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentChannel, setCurrentChannel] = useState<BroadcastProps | null>(null);
  const [isPlay, setIsPlay] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [viewMode, setViewMode] = useState<PlayerViewMode>("bar");

  const play = (channel: BroadcastProps) => {
    setCurrentChannel(channel);
    setIsPlay(true);
    setHasError(false);
  };

  const pause = () => setIsPlay(false);
  const toggle = () => setIsPlay((prev) => !prev);

  return (
    <PlayerContext.Provider
      value={{
        currentChannel,
        isPlay,
        isBuffering,
        hasError,
        viewMode,
        play,
        pause,
        toggle,
        setIsBuffering,
        setHasError,
        setViewMode,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);

  if (!ctx) {
    throw new Error("usePlayer는 PlayerProvider 내부에서만 사용할 수 있습니다.");
  }

  return ctx;
};
