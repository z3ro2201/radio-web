import { MetaFetcher, NowPlayingInfo } from "./types";
import { CbsAppMetaFetcher } from "./cbsApp";
import { FebcMetaFetcher } from "./febc";
import { KbsMetaFetcher } from "./kbs";
import { IgbfMetaFetcher } from "./igbf";
import { WbsMetaFetcher } from "./wbs";
import { ObsMetaFetcher } from "./obs";
import { SbsMetaFetcher } from "./sbs";

const fetchers: Record<string, MetaFetcher> = {
  cbsApp: CbsAppMetaFetcher,
  febc: FebcMetaFetcher,
  kbs: KbsMetaFetcher,
  igbf: IgbfMetaFetcher,
  wbs: WbsMetaFetcher,
  obs: ObsMetaFetcher,
  sbs: SbsMetaFetcher,
  // TODO: kbs, febc, ebs, sayCast 등은 실제 응답 구조 확인 전이라 아직 비워둠.
  // 확인되는 대로 이 자리에 각자의 MetaFetcher 구현을 추가하면 됨.
};

export const resolveMeta = async (metaType: string, metaUrl: string): Promise<NowPlayingInfo | null> => {
  const fetcher = fetchers[metaType];
  if (!fetcher) return null;

  return fetcher.fetchNowPlaying(metaUrl);
};

export type { NowPlayingInfo, SongListItem, MetaFetcher } from "./types";
