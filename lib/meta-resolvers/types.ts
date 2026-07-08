export interface SongListItem {
  albumImage: string;
  title: string;
  artist: string | null;
  time: string;
}

export interface NowPlayingInfo {
  title: string | null;
  // 방송사에 따라 실제 아티스트가 아니라 다른 의미로 쓰일 수 있음
  // (예: cbsApp은 여기에 방송 시간대 "HH:mm ~ HH:mm" 문자열이 들어감)
  artist: string | null;
  thumbnailUrl?: string | null;
  homepageUrl?: string | null;
  songListUrl?: string | null;
  songList?: SongListItem[] | null;
}

export interface MetaFetcher {
  fetchNowPlaying(metaUrl: string): Promise<NowPlayingInfo | null>;
}
