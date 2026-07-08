import { MetaFetcher, NowPlayingInfo, SongListItem } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

const baseUrl = "https://wbsi.kr";

interface WbsMetaProps {
  gr_id: string;
  gr_image: string;
  gr_subject: string;
  gr_subtitle: string;
  gr_btime: string;
  gr_man: string;
}

export const WbsMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const root: WbsMetaProps[] = await fetchJson(metaUrl);

      const toMinutes = (hhmm: string): number => {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
      };

      const isNowInRange = (nowM: number, startM: number, endM: number): boolean => {
        // 자정을 넘어가는 편성(예: 23:00~01:00)까지 고려
        return endM < startM ? nowM >= startM || nowM < endM : nowM >= startM && nowM < endM;
      };

      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const extractTimeRange = (raw: string): { start: string | null; end: string | null } => {
        const matches = raw.match(/\d{1,2}:\d{2}/g);
        const [start, end] = matches ?? [];
        return { start: start ?? null, end: end ?? null };
      };

      const current = root.find((item) => {
        const { start, end } = extractTimeRange(item.gr_btime);
        if (!start || !end) return false;

        return isNowInRange(nowMinutes, toMinutes(start), toMinutes(end));
      });

      if (!current) return null;

      const gr_id = optStringOrNull(current, "gr_id");
      const title = optStringOrNull(current, "gr_subject");
      const time = optStringOrNull(current, "gr_btime");
      const gr_man = optStringOrNull(current, "gr_man");
      const { start, end } = extractTimeRange(time ?? "");
      const timeRange = `${start} ~ ${end}`;
      const homepageUrl = `${baseUrl}/prog_intro.php?gr_id=${gr_id}&device=mobile`;
      const songListUrl = `${baseUrl}/bbs/board.php?bo_table=${gr_id}_02&device=mobile`;
      const thumbnail_path = optStringOrNull(current, "gr_image");
      const thumbnailUrl = `https://wbsi.kr${thumbnail_path}`;
      return {
        title,
        artist: `${gr_man}`, // 진행자 이름 우선, 없으면 방송 시간대
        thumbnailUrl,
        homepageUrl,
        songListUrl,
        songList: null,
      };
    } catch (err) {
      console.error("[WbsMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
