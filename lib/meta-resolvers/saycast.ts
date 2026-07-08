import { MetaFetcher, NowPlayingInfo, SongListItem } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

const baseUrl = "https://me.sayclub.com/bdcst/bdcst-home?bdcstDomainId=";
const IMAGE_BASE_URL = "https://file.sayclub.com/image-file-container";

interface SayCastSongListRoot {
  body: SayCastSongItem[];
  hasError: boolean;
  header: {
    chnlCd: string | null;
    currentPage: number;
    orders: string | null;
    pageSize: number;
    totalRecords: number;
  };
  resultCode: string;
  resultMessage: string;
}

interface SayCastSongItem {
  albumId: string;
  brdate: string;
  cjmsrl: string | null;
  cnt: string;
  domainid: string | null;
  lusrid: string | null;
  mainArtistNm: string;
  rownum: string | null;
  songlogid: string | null;
  trackId: string;
  trackTitle: string;
}

const fetchSongList = async (streamerId: string): Promise<SongListItem[] | null> => {
  if (!streamerId) return null;

  try {
    const songListUrl = `https://me.sayclub.com/api/bdcst/popularSongList?domainid=${streamerId}`;
    const json: SayCastSongListRoot = await fetchJson(songListUrl, { method: "POST" });

    return (json.body ?? []).map((songItem) => ({
      albumImage: null,
      title: songItem.trackTitle,
      artist: songItem.mainArtistNm,
      time: `${songItem.brdate.slice(11, 13)}:${songItem.brdate.slice(14, 16)}`,
    }));
  } catch (err) {
    console.error("[SayCastMeta] 선곡표 조회 실패:", err);
    return null;
  }
};

export const SayCastMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const root = await fetchJson(metaUrl);
      const current = root?.body?.bdcstInfo;
      if (!current) return null;

      const title = optStringOrNull(current, "musicTitle");
      const artist = optStringOrNull(current, "subTitle");
      const domainid = optStringOrNull(current, "domainid");
      const homepageUrl = domainid ? `${baseUrl}${domainid}` : null;

      const thumbnailPath = optStringOrNull(current, "bnrImagePath");
      const thumbnailUrl = thumbnailPath ? `${IMAGE_BASE_URL}/${thumbnailPath}` : null;

      const songList = domainid ? await fetchSongList(domainid) : null;

      return {
        title,
        artist,
        thumbnailUrl,
        homepageUrl,
        songListUrl: null,
        songList,
      };
    } catch (err) {
      console.error("[SayCastMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
