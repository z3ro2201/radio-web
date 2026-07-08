import { MetaFetcher, NowPlayingInfo } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

const imageUrl = "https://static.ebs.co.kr";

export const EbsMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const root = await fetchJson(metaUrl);
      if (!root) return null;

      const current = root?.nowProgram;
      const title = optStringOrNull(current, "title");
      const startTime = optStringOrNull(current, "start");
      const endTime = optStringOrNull(current, "end");
      const actor = optStringOrNull(current, "chrctNm");
      const artist = startTime && endTime ? `${startTime} ~ ${endTime}` : actor;

      const homepageUrl = optStringOrNull(current, "mobHomepageUrl");

      const thumbnailPath = optStringOrNull(current, "programThumbnail");
      const thumbnailUrl = thumbnailPath ? `${imageUrl}/images/${thumbnailPath}` : null;

      return {
        title,
        artist,
        thumbnailUrl,
        homepageUrl,
        songListUrl: null,
        songList: null,
      };
    } catch (err) {
      console.error("[EbsMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
