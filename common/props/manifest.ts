export interface StationsVersionEntry {
  version: number;
  files: string[];
}

export interface Manifest {
  stations_version: Record<string, StationsVersionEntry>;
  logos_version: number;
  broadcasters_version: Record<string, number>;
}
