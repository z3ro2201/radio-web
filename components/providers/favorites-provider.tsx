"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { BroadcastProps } from "@/common/props/broadcast";
import {
  getFavorites,
  toggleFavorite as toggleFavoriteStorage,
  clearFavorites as clearFavoritesStorage,
} from "@/lib/storage/favorites";

interface FavoritesContextValue {
  favorites: BroadcastProps[];
  isFavorite: (channelId: string | null) => boolean;
  toggleFavorite: (channel: BroadcastProps) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<BroadcastProps[]>([]);

  // localStorage는 브라우저에만 있어서, 최초 마운트(클라이언트) 시점에 불러온다
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const isFavorite = (channelId: string | null) => {
    if (!channelId) return false;
    return favorites.some((fav) => fav.channelId === channelId);
  };

  const toggleFavorite = (channel: BroadcastProps) => {
    setFavorites(toggleFavoriteStorage(channel));
  };

  const clearFavorites = () => {
    clearFavoritesStorage();
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);

  if (!ctx) {
    throw new Error("useFavorites는 FavoritesProvider 내부에서만 사용할 수 있습니다.");
  }

  return ctx;
};
