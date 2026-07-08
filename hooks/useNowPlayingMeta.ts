"use client";

import { useEffect, useState } from "react";
import { NowPlayingInfo } from "@/lib/meta-resolvers/types";

const POLL_INTERVAL_MS = 15_000; // 15초마다 갱신

export const useNowPlayingMeta = (metaUrl: string | null, metaType: string | null) => {
  const [meta, setMeta] = useState<NowPlayingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!metaUrl || !metaType) {
      setMeta(null);
      return;
    }

    let cancelled = false;

    const fetchMeta = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/resolve-meta?url=${encodeURIComponent(metaUrl)}&type=${metaType}`);
        const json: NowPlayingInfo | null = await res.json();
        if (!cancelled) setMeta(json);
      } catch {
        if (!cancelled) setMeta(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchMeta();
    const interval = setInterval(fetchMeta, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [metaUrl, metaType]);

  return { meta, isLoading };
};
