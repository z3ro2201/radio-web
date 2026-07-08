import { NextRequest, NextResponse } from "next/server";
import { fetchJson } from "@/lib/fetchJson";

const getByPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

export const GET = async (req: NextRequest) => {
  const url = req.nextUrl.searchParams.get("url");
  const streamType = req.nextUrl.searchParams.get("streamType");
  const jsonPath = req.nextUrl.searchParams.get("jsonPath");

  if (!url || !streamType) {
    return NextResponse.json({ streamUrl: null }, { status: 400 });
  }

  try {
    if (streamType === "fetchJson") {
      if (!jsonPath) return NextResponse.json({ streamUrl: null }, { status: 400 });
      const method = jsonPath !== "data.hls_url" ? "GET" : "POST";
      const res = await fetch(url, { method, cache: "no-store" });
      if (!res.ok) return NextResponse.json({ streamUrl: null }, { status: res.status });

      const json = await res.json();
      const resolved = getByPath(json, jsonPath);
      return NextResponse.json({ streamUrl: typeof resolved === "string" ? resolved : null });
    }

    if (streamType === "fetchText") {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return NextResponse.json({ streamUrl: null }, { status: res.status });

      const text = await res.text();
      // 응답이 순수 텍스트로 온다 - 앞뒤 공백/따옴표 정도만 제거하면
      // 대부분 그 자체가 스트림 주소다 (예: SBS 고릴라M, MBC 올댓뮤직)
      const trimmed = text.trim().replace(/^["']|["']$/g, "");

      const resolvedUrl = trimmed.startsWith("http") ? trimmed : null;

      return NextResponse.json({ streamUrl: resolvedUrl });
    }

    if (streamType === "pls") {
      // .pls는 INI 스타일 텍스트 플레이리스트다:
      //   [playlist]
      //   File1=http://실제스트림주소
      //   Title1=...
      // File1= 뒤의 값이 실제 재생 가능한 주소다. File2, File3처럼 대체 주소가
      // 더 있는 경우도 있지만, 일단 첫 번째(File1)만 사용한다.
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return NextResponse.json({ streamUrl: null }, { status: res.status });

      const text = await res.text();
      const match = text.match(/^File1\s*=\s*(.+)$/im);
      const resolvedUrl = match ? match[1].trim() : null;

      return NextResponse.json({ streamUrl: resolvedUrl && resolvedUrl.startsWith("http") ? resolvedUrl : null });
    }

    return NextResponse.json({ streamUrl: null });
  } catch {
    return NextResponse.json({ streamUrl: null }, { status: 500 });
  }
};
