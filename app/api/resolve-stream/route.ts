import { NextRequest, NextResponse } from "next/server";

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

      const res = await fetch(url, { cache: "no-store" });
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

    return NextResponse.json({ streamUrl: null });
  } catch {
    return NextResponse.json({ streamUrl: null }, { status: 500 });
  }
};
