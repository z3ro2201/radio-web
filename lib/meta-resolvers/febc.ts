import { MetaFetcher, NowPlayingInfo, SongListItem } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

export const FebcMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    const url = new URL(metaUrl);
    const DOMAIN = `${url.protocol}//${url.hostname}`;

    try {
      const current = await fetchJson(metaUrl);

      const pName = optStringOrNull(current, "title");
      if (!pName) return null;

      const mcName = optStringOrNull(current, "mcName");
      const fullTitle = mcName ? `${pName}\n${mcName}` : pName;

      const startTime = optStringOrNull(current, "startTime");
      const endTime = optStringOrNull(current, "endTime");
      const timeRange = startTime && endTime ? `${startTime} ~ ${endTime}` : null;

      const thumbnailUrl = optStringOrNull(current, "poster");
      const thumbnailFullUrl = thumbnailUrl ? `${DOMAIN}${thumbnailUrl}` : null;
      const programId = optStringOrNull(current, "streamId");
      const programIdFull = programId?.padStart(6, "0") ?? null;
      const fallbackHomepageUrl = programIdFull ? `${DOMAIN}/radio` : null;

      let resolvedHomepageUrl = programIdFull ? `${DOMAIN}/program/${programIdFull}/general` : fallbackHomepageUrl;
      let resolvedSongListUrl: string | null = null;

      resolvedSongListUrl = programIdFull ? `${DOMAIN}/program/${programIdFull}/broadcast` : null;

      let songList: SongListItem[] | null = null;

      return {
        title: fullTitle,
        artist: timeRange,
        thumbnailUrl: thumbnailFullUrl,
        homepageUrl: resolvedHomepageUrl,
        songListUrl: resolvedSongListUrl,
        songList,
      };
    } catch (err) {
      console.error("[FebcAppMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
