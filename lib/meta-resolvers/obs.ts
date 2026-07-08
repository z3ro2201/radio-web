import { MetaFetcher, NowPlayingInfo, SongListItem } from "./types";
import { fetchJsonLegacyTls, optStringOrNull } from "../fetchJson";

const baseUrl = "https://obs.co.kr";

export const ObsMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const current = await fetchJsonLegacyTls(metaUrl);
      if (!current) return null;

      const title = optStringOrNull(current, "name");
      const startTime = optStringOrNull(current, "stime");
      const endTime = optStringOrNull(current, "etime");
      const artist = `${startTime} ~ ${endTime}`;
      const progId = optStringOrNull(current, "pgmid");
      const thumbnailPath = optStringOrNull(current, "bg");
      const thumbnailUrl = `${baseUrl}${thumbnailPath}`;
      const homepageUrl = `${baseUrl}/program/?id=${progId}`;

      return {
        title,
        artist, // 진행자 이름 우선, 없으면 방송 시간대
        thumbnailUrl,
        homepageUrl,
        songListUrl: null,
        songList: null,
      };
    } catch (err) {
      console.error("[ObsMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
