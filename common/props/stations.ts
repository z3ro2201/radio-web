export type StreamType = "direct" | "fetchJson" | "fetchText";
export type MetaType = "kbs" | "wbs" | "febc" | "cbsApp" | "igbf" | "ebs" | "dema" | "sbs" | "bbs" | (string & {});
export type StationType = "radio" | "internet";

export interface FrequencyDetail {
  frequency: string;
  area: string;
  lat: number;
  lng: number;
}

export interface Station {
  name: string;
  broadcaster: string;
  frequency: string | FrequencyDetail[]; // 대분류는 배열일 수 있음
  url: string;
  streamType: StreamType;
  type?: StationType; // station 개별로 붙는 경우 있음
  logo?: string;
  subRegion?: string;
  jsonPath?: string;
  metaUrl?: string;
  metaType?: MetaType;
  schedule?: string;
  homepage?: string;
  app?: string;
  genre?: string;
  fetchBody?: string; // fetchJson 요청 시 함께 보내야 하는 body (있는 경우)
}

export interface StationCategoryFile {
  country: string;
  countryName: string;
  version: number;
  type: StationType;
  stationList: Station[];
}

export interface StationRegionFile extends StationCategoryFile {
  region: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
}

export type StationFile = StationCategoryFile | StationRegionFile;
