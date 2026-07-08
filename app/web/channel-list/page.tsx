"use client";

import { useStations } from "@/components/providers/stations-provider";
import { usePlayer } from "@/components/providers/player-provider";
import { isRegionFile, stationToBroadcast } from "@/lib/stations";

const ChannelListPage = () => {
  const { stations, isLoading } = useStations();
  const { currentChannel, play } = usePlayer();

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-400">채널 목록을 불러오는 중...</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      {Object.entries(stations).map(([fileKey, file]) => (
        <section key={fileKey}>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">{isRegionFile(file) ? file.region : "전국"}</h3>

          <ul className="flex flex-col">
            {file.stationList.map((station, index) => {
              const channelId = `${fileKey}:${station.url}:${index}`;
              const isSelected = currentChannel?.channelId === channelId;

              return (
                <li key={channelId}>
                  <button
                    type="button"
                    onClick={() => play(stationToBroadcast(fileKey, station, file.type))}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      isSelected ? "bg-brand text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {station.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default ChannelListPage;
