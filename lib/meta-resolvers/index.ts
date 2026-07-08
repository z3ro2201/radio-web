import { MetaFetcher, NowPlayingInfo } from "./types";
import { CbsAppMetaFetcher } from "./cbsApp";
import { FebcMetaFetcher } from "./febc";
import { KbsMetaFetcher } from "./kbs";
import { IgbfMetaFetcher } from "./igbf";
import { WbsMetaFetcher } from "./wbs";
import { ObsMetaFetcher } from "./obs";
import { SbsMetaFetcher } from "./sbs";
import { SayCastMetaFetcher } from "./saycast";
import { ShoutcastMetaFetcher } from "./shoutcast";

const fetchers: Record<string, MetaFetcher> = {
  cbsApp: CbsAppMetaFetcher,
  febc: FebcMetaFetcher,
  kbs: KbsMetaFetcher,
  igbf: IgbfMetaFetcher,
  wbs: WbsMetaFetcher,
  obs: ObsMetaFetcher,
  sbs: SbsMetaFetcher,
  sayCast: SayCastMetaFetcher,
  shoutcast: ShoutcastMetaFetcher,
  // 확인되는 대로 이 자리에 각자의 MetaFetcher 구현을 추가하면 됨.
};

export const resolveMeta = async (metaType: string, metaUrl: string): Promise<NowPlayingInfo | null> => {
  const fetcher = fetchers[metaType];
  if (!fetcher) return null;

  return fetcher.fetchNowPlaying(metaUrl);
};

export type { NowPlayingInfo, SongListItem, MetaFetcher } from "./types";
