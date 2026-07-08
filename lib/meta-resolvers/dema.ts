import { MetaFetcher, NowPlayingInfo } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

const baseUrl = "https://www.dema.mil.kr";

export const DemaMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const root = await fetchJson(metaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!root) return null;

      const current = root?.map?.timeResult;
      const title = optStringOrNull(current, "program_title");
      const startTime = optStringOrNull(current, "start_time");
      const endTime = optStringOrNull(current, "end_time");
      const actor = optStringOrNull(current, "movie_actor");
      const artist = startTime && endTime ? `${startTime} ~ ${endTime}` : actor;

      const progId = optStringOrNull(current, "home_url");
      const homepageUrl = progId ? `${baseUrl}/web/home/${progId}` : null;

      const thumbnailPath = optStringOrNull(current, "movie_icon");
      const thumbnailUrl = thumbnailPath ? `${baseUrl}${thumbnailPath}` : null;

      return {
        title,
        artist, // 진행자 이름 우선, 없으면 방송 시간대
        thumbnailUrl,
        homepageUrl,
        songListUrl: null,
        songList: null,
      };
    } catch (err) {
      console.error("[DemaMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
