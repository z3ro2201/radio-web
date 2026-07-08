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

    // .pls를 그대로 브라우저에 넘겨봤지만 브라우저가 아예 이해를 못 해서
    // (code:4 SRC_NOT_SUPPORTED) 실패했다. 다시 서버에서 File1= 파싱하고,
    // 거기서 나온 최종 스트림 주소도 우리 서버(/api/stream-proxy)를 거치게 한다.
    // (SHOUTcast 서버가 Content-Type을 이상하게 주는 경우가 많아, 원본에
    //  직접 붙으면 여기서도 code:4가 똑같이 났었음 - 우리가 헤더를 강제로 붙여줘야 함)
    const isPls = (() => {
      try {
        return new URL(channel.streamUrl).pathname.toLowerCase().endsWith(".pls");
      } catch {
        return channel.streamUrl.toLowerCase().endsWith(".pls");
      }
    })();

    // "direct"면 바로 재생 가능한 주소이므로 서버를 거칠 필요가 없다 (.pls 제외)
    if (channel.streamType === "direct" && !isPls) {
      setResolvedUrl(channel.streamUrl);
      return;
    }

    if (isPls || channel.streamType === "fetchJson" || channel.streamType === "fetchText") {
      let cancelled = false;
      setIsResolving(true);
      setResolvedUrl(null);

      const params = new URLSearchParams({
        url: channel.streamUrl,
        streamType: isPls ? "pls" : channel.streamType!,
      });
      if (channel.jsonPath) params.set("jsonPath", channel.jsonPath);
      // fetchBody가 있으면 POST로 보내야 한다는 뜻이다
      if (channel.fetchBody) {
        params.set("method", "POST");
        params.set("body", channel.fetchBody);
      }

      fetch(`/api/resolve-stream?${params.toString()}`)
        .then((res) => res.json())
        .then((data: { streamUrl: string | null }) => {
          if (cancelled) return;
          if (!data.streamUrl) {
            setResolvedUrl(null);
            return;
          }
          // .pls로 얻은 스트림은 원본 헤더를 못 믿으니 프록시를 거친다
          setResolvedUrl(isPls ? `/api/stream-proxy?url=${encodeURIComponent(data.streamUrl)}` : data.streamUrl);
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
