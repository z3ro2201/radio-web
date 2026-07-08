"use client";

import { useState } from "react";
import { useStations } from "@/components/providers/stations-provider";
import { usePlayer } from "@/components/providers/player-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { isRegionFile, stationToBroadcast } from "@/lib/stations";
import { StationFile } from "@/common/props/stations";
import { BroadcastProps } from "@/common/props/broadcast";
import { HeartIcon } from "lucide-react";

// 지역 파일(region 있음)은 지역명, 그 외엔 type(internet/radio)으로 구분해서 라벨을 정한다.
// (ko, ko.internet 둘 다 region이 없어서 isRegionFile만으론 구분이 안 됨)
const getRegionLabel = (file: StationFile): string => {
  if (isRegionFile(file)) return file.region;
  if (file.type === "internet") return "인터넷방송";
  return "전국";
};

interface StationListProps {
  fileKey: string;
  file: StationFile;
  currentChannel: BroadcastProps | null;
  play: (channel: BroadcastProps) => void;
  isFavorite: (channelId: string | null) => boolean;
  toggleFavorite: (channel: BroadcastProps) => void;
}

// ko(전국)든 지역이든 같은 방식으로 렌더링해야 해서 공용으로 뺐다.
// 이걸 그대로 재사용해서 "전국 채널"을 모든 지역 탭 안에도 같이 보여줄 수 있다.
const StationList = ({ fileKey, file, currentChannel, play, isFavorite, toggleFavorite }: StationListProps) => {
  return (
    <ul className="flex flex-col">
      {file.stationList.map((station, idx) => {
        const broadcast = stationToBroadcast(fileKey, station, file.type, idx);
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
              {station.name}
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
  );
};

const ChannelListPage = () => {
  const { stations, isLoading } = useStations();
  const { currentChannel, play } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeRegion, setActiveRegion] = useState("ko.seoul");

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-400 dark:text-gray-500">채널 목록을 불러오는 중...</div>;
  }

  const koFile = stations["ko"];

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-hidden">
      {/* shrink-0로 이 nav는 절대 줄어들지 않게 고정하고, article 스크롤 영역 밖에 둬서
          채널 목록을 스크롤해도 지역 탭은 같이 안 딸려 올라간다. */}
      <nav className="flex overflow-x-auto gap-2 shrink-0">
        {Object.entries(stations).map(([fileKey, file]) => {
          if (fileKey === "ko") return null;
          return (
            <button
              key={fileKey}
              type="button"
              onClick={() => setActiveRegion(fileKey)}
              className={`shrink-0 whitespace-nowrap text-sm font-semibold px-2 py-1 rounded-md transition-colors ${
                activeRegion === fileKey
                  ? "bg-brand text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {getRegionLabel(file)}
            </button>
          );
        })}
      </nav>

      <article className="relative flex-1 overflow-y-auto">
        {Object.entries(stations).map(([fileKey, file]) => {
          if (fileKey === "ko") return null;
          return (
            <section
              className={fileKey === activeRegion ? "flex flex-col gap-6" : "hidden"}
              data-regionid={fileKey}
              key={fileKey}
            >
              {/* 전국 채널 - ko.internet 탭에서는 제외하고, 나머지 지역 탭에는 공통으로 표시 */}
              {koFile && fileKey !== "ko.internet" && (
                <StationList
                  fileKey="ko"
                  file={koFile}
                  currentChannel={currentChannel}
                  play={play}
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                />
              )}

              <StationList
                fileKey={fileKey}
                file={file}
                currentChannel={currentChannel}
                play={play}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
              />
            </section>
          );
        })}
      </article>
    </div>
  );
};

export default ChannelListPage;
