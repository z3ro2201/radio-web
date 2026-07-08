import { Station, StationFile, StationRegionFile, StationType } from "@/common/props/stations";
import { BroadcastProps } from "@/common/props/broadcast";
import { getManifest } from "./manifest";

const BASE_URL = "https://raw.githubusercontent.com/z3ro2201/damoaRadio/refs/heads/main/release";

export const getStationFile = async (fileKey: string): Promise<StationFile> => {
  const res = await fetch(`${BASE_URL}/stations.${fileKey}.json`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`stations.${fileKey}.json 파일을 찾을 수 없습니다. (${res.status})`);
  }

  return res.json();
};

export const isRegionFile = (file: StationFile): file is StationRegionFile => {
  return "region" in file;
};

/**
 * Station 데이터를 Player가 사용하는 BroadcastProps 형태로 변환한다.
 * fileKey(예: "ko.busan")와 station이 배열 안에서 위치한 index를 합쳐 channelId로 사용한다.
 *
 * name도, url도 고유하다는 보장이 없다:
 * - name 중복 사례: 같은 파일 안에 "SilentNight"이라는 이름으로 서로 다른 DJ 방송이 2개 존재
 * - url 중복 사례: 같은 파일 안에 스트림 URL이 완전히 똑같은 서로 다른 방송 항목이 존재 (대전 지역 등)
 * 반면 배열 안에서의 위치(index)는 항상 유일하므로, 이것만이 확실한 식별자다.
 *
 * streamType이 "direct"가 아닌 경우(fetchJson, fetchText) station.url은 실제로
 * 바로 재생 가능한 스트림 주소가 아니라 별도로 파싱/요청해야 하는 API 주소다.
 * 그 판단/해석은 여기서 미리 하지 않고, streamType과 jsonPath를 그대로 넘겨서
 * 실제 재생 시점(Player)에서 필요할 때만 서버를 통해 해석하도록 한다.
 */
export const stationToBroadcast = (
  fileKey: string,
  station: Station,
  fileType: StationType,
  index: number,
): BroadcastProps => ({
  channelName: station.name,
  channelId: `${fileKey}:${index}`,
  streamUrl: station.url,
  streamType: station.streamType,
  jsonPath: station.jsonPath ?? null,
  fetchBody: station.fetchBody ?? null,
  broadcastType: fileType,
  metaUrl: station.metaUrl ?? null,
  metaType: station.metaType ?? null,
});

export const getAllStationsByLocale = async (locale: string): Promise<Record<string, StationFile>> => {
  const manifest = await getManifest();
  const entry = manifest.stations_version[locale];

  if (!entry) {
    throw new Error(`No stations_version entry found for locale: ${locale}`);
  }

  const results = await Promise.all(entry.files.map((fileKey) => getStationFile(fileKey)));

  return entry.files.reduce(
    (acc, fileKey, idx) => {
      acc[fileKey] = results[idx];
      return acc;
    },
    {} as Record<string, StationFile>,
  );
};
