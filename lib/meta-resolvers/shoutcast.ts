import { MetaFetcher, NowPlayingInfo } from "./types";
import { fetchShoutcastRaw } from "../shoutcastSocket";
import iconv from "iconv-lite";

const isReadableKorean = (text: string): boolean => {
  let koreanChars = 0;
  let garbledChars = 0;

  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0xac00 && code <= 0xd7a3) koreanChars++;
    if (ch === "\uFFFD") garbledChars++;
  }

  return koreanChars > 0 && garbledChars === 0;
};

/**
 * Content-Type에 charset이 명시돼 있으면 그걸 쓰고, 없으면 UTF-8로 먼저
 * 시도해서 한글이 깨지지 않았는지 확인한 뒤, 깨졌으면 EUC-KR(한국 SHOUTcast
 * 서버들의 사실상 기본값)로 다시 디코딩한다.
 */
const decodeWithCharset = (buffer: Buffer, contentType: string | undefined): string => {
  const charsetMatch = /charset=([\w-]+)/i.exec(contentType ?? "");
  const charsetName = charsetMatch?.[1];

  if (charsetName) {
    try {
      return iconv.decode(buffer, charsetName);
    } catch {
      return iconv.decode(buffer, "utf-8");
    }
  }

  const utf8 = iconv.decode(buffer, "utf-8");
  if (isReadableKorean(utf8)) return utf8;

  try {
    return iconv.decode(buffer, "euc-kr");
  } catch {
    return iconv.decode(buffer, "iso-8859-1");
  }
};

const fetchFrom7Html = async (host: string, port: number): Promise<NowPlayingInfo | null> => {
  try {
    const res = await fetchShoutcastRaw(host, port, "/7.html");
    if (res.statusCode !== 200) return null;

    const body = decodeWithCharset(res.body, res.headers["content-type"]);
    const match = body.match(/<body>([\s\S]*?)<\/body>/i);
    const content = match?.[1]?.trim();
    if (!content) return null;

    // /7.html 응답 형식: "리스너수,상태,피크,최대,비트레이트,?,아티스트 - 곡제목" (콤마 구분)
    const parts = content.split(",");
    const song = parts[6]?.trim();
    if (!song) return null;

    return { title: song, artist: null };
  } catch (err) {
    console.warn("[ShoutcastMeta] /7.html 실패:", err);
    return null;
  }
};

const fetchFromCurrentSong = async (host: string, port: number): Promise<NowPlayingInfo | null> => {
  try {
    const res = await fetchShoutcastRaw(host, port, "/currentsong");
    if (res.statusCode !== 200) return null;

    const song = decodeWithCharset(res.body, res.headers["content-type"]).trim();
    if (!song) return null;

    return { title: song, artist: null };
  } catch (err) {
    console.warn("[ShoutcastMeta] /currentsong 실패:", err);
    return null;
  }
};

export const ShoutcastMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const cleaned = metaUrl.replace(/[/;]+$/, "");
      const url = new URL(cleaned);
      const host = url.hostname;
      const port = url.port ? parseInt(url.port, 10) : 80;

      return (await fetchFrom7Html(host, port)) ?? (await fetchFromCurrentSong(host, port));
    } catch (err) {
      console.error("[ShoutcastMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
