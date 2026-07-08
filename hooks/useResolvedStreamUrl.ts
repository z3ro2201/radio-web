"use client";

import { useEffect, useState } from "react";
import { BroadcastProps } from "@/common/props/broadcast";

export const useResolvedStreamUrl = (channel: BroadcastProps | null) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!channel || !channel.streamUrl) {
      setResolvedUrl(null);
      return;
    }

    // "direct"면 바로 재생 가능한 주소이므로 서버를 거칠 필요가 없다
    if (channel.streamType === "direct") {
      setResolvedUrl(channel.streamUrl);
      return;
    }

    if (channel.streamType === "fetchJson" || channel.streamType === "fetchText") {
      let cancelled = false;
      setIsResolving(true);
      setResolvedUrl(null);

      const params = new URLSearchParams({
        url: channel.streamUrl,
        streamType: channel.streamType,
      });
      if (channel.jsonPath) params.set("jsonPath", channel.jsonPath);

      fetch(`/api/resolve-stream?${params.toString()}`)
        .then((res) => res.json())
        .then((data: { streamUrl: string | null }) => {
          if (!cancelled) setResolvedUrl(data.streamUrl);
        })
        .catch(() => {
          if (!cancelled) setResolvedUrl(null);
        })
        .finally(() => {
          if (!cancelled) setIsResolving(false);
        });

      return () => {
        cancelled = true;
      };
    }

    setResolvedUrl(null);
  }, [channel]);

  return { resolvedUrl, isResolving };
};
