"use client";

import { useMemo, useState } from "react";
import { useStations } from "@/components/providers/stations-provider";
import { usePlayer } from "@/components/providers/player-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { stationToBroadcast } from "@/lib/stations";
import { Station, StationFile } from "@/common/props/stations";
import { HeartIcon, SearchIcon, XIcon } from "lucide-react";

interface SearchResult {
  station: Station;
  fileKey: string;
  fileType: StationFile["type"];
  index: number;
}

const SearchPage = () => {
  const { stations } = useStations();
  const { currentChannel, play } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [keyword, setKeyword] = useState("");

  // 전체 방송국을 한 번만 평탄화해둔다 - fileKey별 index를 유지해야
  // stationToBroadcast로 channelId를 정확히 만들 수 있다.
  const allStations = useMemo<SearchResult[]>(() => {
    return Object.entries(stations).flatMap(([fileKey, file]) =>
      file.stationList.map((station, index) => ({
        station,
        fileKey,
        fileType: file.type,
        index,
      })),
    );
  }, [stations]);

  const results = useMemo<SearchResult[]>(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return [];

    return allStations.filter(({ station }) => {
      return (
        station.name.toLowerCase().includes(trimmed) ||
        station.broadcaster?.toLowerCase().includes(trimmed) ||
        station.genre?.toLowerCase().includes(trimmed)
      );
    });
  }, [allStations, keyword]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="채널명, 방송사, 장르로 검색"
            className="w-full pl-9 pr-9 py-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            autoFocus
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              aria-label="검색어 지우기"
            >
              <XIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pb-4">
        {!keyword.trim() ? (
          <div className="text-sm text-gray-400 dark:text-gray-500 text-center mt-8">검색어를 입력해주세요</div>
        ) : results.length === 0 ? (
          <div className="text-sm text-gray-400 dark:text-gray-500 text-center mt-8">검색 결과가 없습니다</div>
        ) : (
          <ul className="flex flex-col">
            {results.map(({ station, fileKey, fileType, index }) => {
              const broadcast = stationToBroadcast(fileKey, station, fileType, index);
              const isSelected = currentChannel?.channelId === broadcast.channelId;
              const favorited = isFavorite(broadcast.channelId);

              return (
                <li key={broadcast.channelId} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => play(broadcast)}
                    className={`flex-1 text-left px-3 py-2 rounded-md transition-colors ${
                      isSelected ? "bg-brand text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="text-sm">{station.name}</div>
                    <div className={`text-xs ${isSelected ? "text-white/80" : "text-gray-400 dark:text-gray-500"}`}>
                      {station.broadcaster}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(broadcast)}
                    className="p-2 shrink-0"
                    aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  >
                    <HeartIcon
                      className={`w-5 h-5 ${favorited ? "fill-brand text-brand" : "text-gray-300 dark:text-gray-600"}`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
