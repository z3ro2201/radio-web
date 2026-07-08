import { MetaFetcher, NowPlayingInfo, SongListItem } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

const baseUrl = "https://me.sayclub.com/bdcst/bdcst-home?bdcstDomainId=";
const IMAGE_BASE_URL = "https://file.sayclub.com/image-file-container";

interface sayCastSongListProps {
  body: songItemsProps[];
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

interface songItemsProps {
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

const fetchSongList = async (streamerId: string) => {
  const SONG_LIST_URL = `https://me.sayclub.com/api/bdcst/popularSongList?domainid=${streamerId}`;
  const res = await fetch(SONG_LIST_URL, {
    method: "POST",
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json: sayCastSongListProps = await res.json();

  return (json.body ?? []).map((songItem) => ({
    albumImage: null,
    title: songItem.trackTitle,
    artist: songItem.mainArtistNm,
    time: `${songItem.brdate.slice(11, 13)}:${songItem.brdate.slice(14, 16)}`,
  }));
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
      const homepageUrl = `${baseUrl}${domainid}`;
      const thumbnailUrl = optStringOrNull(current, "bnrImagePath");
      const fullThumbnailUrl = `${IMAGE_BASE_URL}/${thumbnailUrl}`;

      const songList = (await fetchSongList(domainid ?? "")) ?? null;
      return {
        title,
        artist: artist,
        thumbnailUrl: fullThumbnailUrl,
        homepageUrl,
        songListUrl: null,
        songList,
      };
    } catch (err) {
      console.error("[KbsMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
