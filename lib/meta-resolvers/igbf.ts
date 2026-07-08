import { MetaFetcher, NowPlayingInfo, SongListItem } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

const baseUrl = "https://igbf.kr";

export const IgbfMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const root = await fetchJson(metaUrl);
      const current = root?.current?.[0] ?? null;
      if (!current) return null;

      const progId = optStringOrNull(current, "progId");
      const title = optStringOrNull(current, "broadcast_title");
      const start_time = optStringOrNull(current, "start_time");
      const end_time = optStringOrNull(current, "end_time");
      const timeRange = `${start_time}~${end_time}`;
      const homepageUrl = `${baseUrl}/gugak_web/radio/radio_program_main_sub.jsp?idx=${progId}&sub_num=787`;
      const thumbnailUrl = optStringOrNull(current, "onAirImg");
      return {
        title,
        artist: timeRange, // 진행자 이름 우선, 없으면 방송 시간대
        thumbnailUrl,
        homepageUrl,
        songListUrl: null,
        songList: null,
      };
    } catch (err) {
      console.error("[KbsMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
