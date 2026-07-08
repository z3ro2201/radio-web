"use client";

import { useFavorites } from "@/components/providers/favorites-provider";
import { usePlayer } from "@/components/providers/player-provider";
import { HeartIcon } from "lucide-react";

const FavoritesPage = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { currentChannel, play } = usePlayer();

  if (favorites.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">
        즐겨찾기한 채널이 없습니다
      </div>
    );
  }

  return (
    <div className="p-4">
      <ul className="flex flex-col">
        {favorites.map((channel) => {
          const isSelected = currentChannel?.channelId === channel.channelId;

          return (
            <li key={channel.channelId} className="flex items-center">
              <button
                type="button"
                onClick={() => play(channel)}
                className={`flex-1 text-left px-3 py-2 rounded-md transition-colors ${
                  isSelected ? "bg-brand text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {channel.channelName}
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(channel)}
                className="p-2 shrink-0"
                aria-label="즐겨찾기 해제"
              >
                <HeartIcon className="w-5 h-5 fill-brand text-brand" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FavoritesPage;
