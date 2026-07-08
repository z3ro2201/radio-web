import { MetaFetcher, NowPlayingInfo, SongListItem } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

const DOMAIN = "https://www.cbs.co.kr";
const SCHEDULE_API = `${DOMAIN}/schedule/all/ajax`;
const FALLBACK_IMG = "https://www.cbs.co.kr/img/logo/replace_img.png";

const resolveUrl = (path: string | null): string | null => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${DOMAIN}${path}`;
};

// metaUrl에 포함된 라디오 채널(미디어ID)로 schedule/all/ajax의 배열 키 추론
// radio001 = 음악FM(musicfm), radio002 = 표준FM(fm), radio003 = JOY4U(joy4u)
const resolveArrayKey = (metaUrl: string, url: URL): string => {
  const ch = url.searchParams.get("ch");
  if (ch !== null) {
    switch (ch) {
      case "0":
        return "musicfm";
      case "1":
        return "fm";
      case "2":
        return "joy4u";
      default:
        return "fm";
    }
  }

  if (metaUrl.includes("radio001")) return "musicfm";
  if (metaUrl.includes("radio003")) return "joy4u";
  return "fm"; // radio002 또는 기본값
};

const pad2 = (n: number) => String(n).padStart(2, "0");

// 자정을 넘어가는 편성(end < start)까지 고려한 "지금 이 구간에 속하는지" 판정
const isNowInRange = (nowTime: string, start: string, end: string): boolean => {
  return end < start ? nowTime >= start || nowTime < end : nowTime >= start && nowTime < end;
};

export const CbsAppMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const root = await fetchJson(metaUrl);
      const programs: any[] = root?.ProgramList ?? [];
      if (programs.length === 0) return null;

      const now = new Date();
      const nowTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

      const current =
        programs.find((item) => {
          const start = item?.Start ?? "";
          const end = item?.End ?? "";
          if (!start || !end) return false;
          return isNowInRange(nowTime, start, end);
        }) ?? programs[0];

      const pName = optStringOrNull(current, "PName");
      if (!pName) return null;

      const subTitle = optStringOrNull(current, "subTitle");
      const fullTitle = subTitle ? `${pName}\n${subTitle}` : pName;

      const startTime = optStringOrNull(current, "Start");
      const endTime = optStringOrNull(current, "End");
      const timeRange = startTime && endTime ? `${startTime} ~ ${endTime}` : null;

      const thumbnailUrl = optStringOrNull(current, "Img_Thumb");
      const programId = optStringOrNull(current, "PID");
      const programIdFull = programId?.padStart(6, "0") ?? null;
      const fallbackHomepageUrl = programIdFull ? `${DOMAIN}/radio` : null;

      const url = new URL(metaUrl);
      const applyExtra = url.hash === "#seoul";

      let resolvedHomepageUrl = fallbackHomepageUrl;
      let resolvedSongListUrl: string | null = null;
      let programIds = "";

      // ── #seoul 마커일 때만 schedule/all/ajax로 홈페이지/선곡표 보강 ──
      if (applyExtra) {
        try {
          const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
          const scheduleRoot = await fetchJson(SCHEDULE_API);
          const arrayKey = resolveArrayKey(metaUrl, url);
          const schedules: any[] = scheduleRoot?.[arrayKey] ?? [];

          const nowItem = schedules.find((item) => {
            const date = optStringOrNull(item, "date");
            const start = optStringOrNull(item, "startTime");
            const end = optStringOrNull(item, "endTime");
            if (date !== today || !start || !end) return false;
            return isNowInRange(nowTime, start, end);
          });

          const program = nowItem?.program;
          if (program) {
            const rawLink = program?.homepage?.link ?? null;
            const resolved = resolveUrl(rawLink);
            if (resolved) resolvedHomepageUrl = resolved;

            // 선곡표는 프로그램 홈페이지 내 "선곡표" 탭으로 제공됨
            resolvedSongListUrl = resolvedHomepageUrl;
            programIds = String(program?.id ?? "");
          }
        } catch (err) {
          console.error("[CbsAppMeta] schedule/all/ajax 조회 실패:", err);
        }
      }

      let songList: SongListItem[] | null = null;

      if (applyExtra) {
        try {
          const todayCompact = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
          const playlistUrl = `${DOMAIN}/program/playlist/${programIds}?order=desc&date=${todayCompact}&returnType=ajax`;
          const playlistRoot = await fetchJson(playlistUrl);
          const items: any[] = playlistRoot?.songList ?? [];

          if (items.length > 0) {
            const parsed = items
              .map((item) => {
                const title = optStringOrNull(item, "title");
                if (!title) return null;

                const artist = optStringOrNull(item, "artist");
                const rawImage = optStringOrNull(item, "image")?.replace(/\\/g, "/") ?? null;
                const albumImage =
                  rawImage && (rawImage.startsWith("http://") || rawImage.startsWith("https://"))
                    ? rawImage
                    : FALLBACK_IMG;

                const startRaw = optStringOrNull(item, "startTime") ?? "";
                const time =
                  startRaw.length >= 12
                    ? `${startRaw.slice(0, 2)}:${startRaw.slice(2, 4)}~`
                    : `${startRaw.slice(0, 5)}`;

                return {
                  startRaw,
                  item: { albumImage, title, artist, time } as SongListItem,
                };
              })
              .filter((v): v is { startRaw: string; item: SongListItem } => v !== null);
            // 최신순(startTime 내림차순) 정렬
            songList = parsed.sort((a, b) => (a.startRaw < b.startRaw ? 1 : -1)).map((v) => v.item);
          }
        } catch (err) {
          console.error("[CbsAppMeta] 선곡 리스트 파싱 실패:", err);
        }
      }
      return {
        title: fullTitle,
        artist: timeRange,
        thumbnailUrl,
        homepageUrl: resolvedHomepageUrl,
        songListUrl: resolvedSongListUrl,
        songList,
      };
    } catch (err) {
      console.error("[CbsAppMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
