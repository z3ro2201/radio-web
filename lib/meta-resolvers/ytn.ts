import { MetaFetcher, NowPlayingInfo } from "./types";
import { DOMParser } from "@xmldom/xmldom";

const baseUrl = "https://radio.ytn.co.kr";

export const YtnMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      // JSON이 아니라 XML로 응답하는 API라서 GET + XML Accept 헤더를 그대로 써야 한다
      const res = await fetch(metaUrl, {
        method: "GET",
        headers: {
          Accept: "application/xml, text/xml",
          "User-Agent": "Mozilla/5.0",
        },
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });

      if (!res.ok) return null;

      const xmlText = await res.text();
      const doc = new DOMParser().parseFromString(xmlText, "text/xml");
      console.log(doc);

      // <now_pro> 태그 값 - 썸네일 이미지 URL 조합에 쓰인다
      const nowProNode = doc.getElementsByTagName("now_pro").item(0);
      const nowPro = nowProNode?.textContent?.trim() || null;

      // 여러 <schedule> 중 첫 번째 것만 사용한다
      const scheduleNodes = doc.getElementsByTagName("schedule");
      if (scheduleNodes.length === 0) return null;

      const firstSchedule = scheduleNodes.item(0);
      const time = firstSchedule?.getElementsByTagName("time").item(0)?.textContent?.trim() || null;
      const title = firstSchedule?.getElementsByTagName("title").item(0)?.textContent?.trim() || null;

      if (!title) return null;

      // now_pro 값을 조합해 이미지 URL을 만든다 (YTN 고유 규칙)
      const thumbnailUrl = nowPro ? `https://imgradio.ytn.co.kr/program_info/pro_img6_${nowPro}.jpg` : null;

      return {
        title,
        artist: time, // 진행자 이름이 아니라 방송 시간대
        thumbnailUrl,
        homepageUrl: baseUrl,
        songListUrl: null,
        songList: null,
      };
    } catch (err) {
      console.error("[YtnMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
