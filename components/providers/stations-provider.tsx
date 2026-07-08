"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Manifest } from "@/common/props/manifest";
import { StationFile } from "@/common/props/stations";
import { getStationFile } from "@/lib/stations";

interface StationsContextValue {
  stations: Record<string, StationFile>;
  isLoading: boolean;
}

const StationsContext = createContext<StationsContextValue | null>(null);

// TODO: 다국어 지원 시 locale을 고정값 대신 외부에서 주입받도록 확장
const LOCALE = "ko";

export const StationsProvider = ({ manifest, children }: { manifest: Manifest; children: ReactNode }) => {
  const [stations, setStations] = useState<Record<string, StationFile>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const entry = manifest.stations_version[LOCALE];

    if (!entry) {
      setIsLoading(false);
      return;
    }

    const versionKey = `stations-version:${LOCALE}`;
    const dataKey = `stations-data:${LOCALE}`;

    const cachedVersion = localStorage.getItem(versionKey);
    const cachedData = localStorage.getItem(dataKey);

    // 버전이 같으면 캐시 그대로 사용, 네트워크 요청 없음
    if (cachedVersion && Number(cachedVersion) === entry.version && cachedData) {
      try {
        setStations(JSON.parse(cachedData));
        setIsLoading(false);
        return;
      } catch {
        // 캐시가 손상됐으면 그냥 아래에서 새로 받아옴
      }
    }

    let cancelled = false;

    const load = async () => {
      const results = await Promise.all(entry.files.map((fileKey) => getStationFile(fileKey)));

      if (cancelled) return;

      const merged = entry.files.reduce(
        (acc, fileKey, idx) => {
          acc[fileKey] = results[idx];
          return acc;
        },
        {} as Record<string, StationFile>,
      );

      setStations(merged);
      setIsLoading(false);

      try {
        localStorage.setItem(versionKey, String(entry.version));
        localStorage.setItem(dataKey, JSON.stringify(merged));
      } catch {
        // 저장 공간 초과 등은 무시해도 앱 동작엔 지장 없음
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [manifest]);

  return <StationsContext.Provider value={{ stations, isLoading }}>{children}</StationsContext.Provider>;
};

export const useStations = () => {
  const ctx = useContext(StationsContext);

  if (!ctx) {
    throw new Error("useStations는 StationsProvider 내부에서만 사용할 수 있습니다.");
  }

  return ctx;
};
