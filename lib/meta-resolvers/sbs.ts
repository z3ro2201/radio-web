import { MetaFetcher, NowPlayingInfo, SongListItem } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

const baseUrl = "https://obs.co.kr";

interface PlayListDataProps {
  result: { code: number; message: string };
  data: {
    playlist: PlayListProps[];
    winners: Record<string, string>;
    top: { programImage: string; programMessage: string };
  };
}

interface PlayListProps {
  _id: string;
  SBS_SEQ: number;
  ALBUM_IMG: string;
  ALBUM_TITLE: string;
  ARTIST_NAME: string;
  BROAD_NAME: string;
  CHANNEL: string;
  DISPLAY_NAME: string;
  DISPLAY_YN: string;
  END_TIME: number;
  GENERE_NM: string;
  IS_ACTIVE: boolean;
  KAKAO_BP_ID: string;
  KAKAO_LINK: string;
  KAKAO_SEQ: number;
  LYRICS: string;
  MOD_DATE: number;
  MONGO_MODIFIED: number;
  PLAY_TIME: number;
  REG_DATE: number;
  RELEASE_YEAR: number;
  SONG_TITLE: string;
  START_TIME: number;
  TRACK_ID: string;
  VOID_ID: string;
}

const fetchSongList = async (progName: string) => {
  try {
    const homepageApiUrl = `https://static.apis.sbs.co.kr/program-api/1.0/menu/${progName}?platform=mobile`;
    const homepageMenu = await fetchJson(homepageApiUrl);
    const program = homepageMenu?.program;

    console.log(homepageApiUrl);

    if (!program) return null;

    const progId = optStringOrNull(program, "programid") ?? "";
    const now = new Date();
    const today = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const playListApiUrl = `https://apis.sbs.co.kr/radio-api/playlist/V${progId.slice(1)}/${today}`;
    const playListRoot: PlayListDataProps = await fetchJson(playListApiUrl);
    const playList: PlayListProps[] = playListRoot?.data?.playlist ?? [];
    console.log(playListApiUrl);

    return (playList ?? []).map((songItem) => ({
      albumImage: songItem.ALBUM_IMG,
      title: songItem.ALBUM_TITLE,
      artist: songItem.ARTIST_NAME,
      time: `${String(songItem.START_TIME).slice(8, 10)}:${String(songItem.START_TIME).slice(10, 12)}`,
    }));
  } catch (e) {
    return null;
  }
};

export const SbsMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const root = await fetchJson(metaUrl);
      if (!root) return null;

      const current = root?.onair?.info ?? null;
      if (!current) return null;

      const title = optStringOrNull(current, "title");
      const artist = "";
      const thumbnailUrl = optStringOrNull(current, "thumbimg");
      const homepageUrl = optStringOrNull(current, "homeurl") ?? "";

      const url = new URL(homepageUrl);
      const progName = url.pathname.split("/").slice(-1);
      const songList = !progName ? null : await fetchSongList(progName[0]);

      return {
        title,
        artist, // 진행자 이름 우선, 없으면 방송 시간대
        thumbnailUrl,
        homepageUrl,
        songListUrl: null,
        songList,
      };
    } catch (err) {
      console.error("[SbsMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
