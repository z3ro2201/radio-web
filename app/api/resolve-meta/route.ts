import { NextRequest, NextResponse } from "next/server";
import { resolveMeta } from "@/lib/meta-resolvers";

export const GET = async (req: NextRequest) => {
  const metaUrl = req.nextUrl.searchParams.get("url");
  const metaType = req.nextUrl.searchParams.get("type");

  if (!metaUrl || !metaType) {
    return NextResponse.json(null, { status: 400 });
  }

  const info = await resolveMeta(metaType, metaUrl);
  return NextResponse.json(info);
};
