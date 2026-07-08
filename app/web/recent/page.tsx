"use client";

import { useRecent } from "@/components/providers/recent-provider";
import { usePlayer } from "@/components/providers/player-provider";

const RecentPage = () => {
  const { recent } = useRecent();
  const { currentChannel, play } = usePlayer();

  if (recent.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">
        최근 들은 채널이 없습니다
      </div>
    );
  }

  return (
    <div className="p-4">
      <ul className="flex flex-col">
        {recent.map((channel) => {
          const isSelected = currentChannel?.channelId === channel.channelId;

          return (
            <li key={channel.channelId}>
              <button
                type="button"
                onClick={() => play(channel)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  isSelected ? "bg-brand text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {channel.channelName}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentPage;
