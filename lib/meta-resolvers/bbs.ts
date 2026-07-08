import { MetaFetcher, NowPlayingInfo } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

// 실제 사이트 주소가 응답에 없어서 고정값으로 둔다. 정확한 URL인지는
// 별도로 확인이 필요하다.
const baseUrl = "https://www.bbsi.co.kr";

interface BbsScheduleItem {
  Pos: number;
  ProgramCode: string;
  ProgramStartTime: string; // "2026-07-08T22:00:00"
  ProgramEndTime: string;
  StartTime: string; // "HH:mm"
  EndTime: string; // "HH:mm" (자정 넘어가면 "00:00"으로 나옴)
  ProgramName: string;
  ProgramImg: string; // 이미 완전한 URL로 내려옴
  BroadCastTime: string;
  IsView: "Y" | "N";
  IsSpecial: "Y" | "N";
}

interface BbsScheduleRoot {
  Result: string;
  Data: BbsScheduleItem[];
  Msg: number;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// 자정을 넘어가는 편성(예: 23:55~00:00)까지 고려한 "지금 이 구간에 속하는지" 판정
const isNowInRange = (nowM: number, startM: number, endM: number): boolean => {
  return endM < startM ? nowM >= startM || nowM < endM : nowM >= startM && nowM < endM;
};

export const BbsMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const root: BbsScheduleRoot = await fetchJson(metaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ACT: "SCHEDULE_CUR_NEW",
          CODE: "WWW",
          GUBUN: "RADIO",
        }),
      });

      if (root?.Result !== "SUCCESS" || !root.Data?.length) return null;

      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      // schedule 목록 중 지금 이 시각에 해당하는 프로그램을 찾는다.
      // 못 찾으면(시간 겹침 데이터 이상 등) 그냥 첫 번째 항목으로 대체한다.
      const current =
        root.Data.find((item) => {
          if (!item.StartTime || !item.EndTime) return false;
          return isNowInRange(nowMinutes, toMinutes(item.StartTime), toMinutes(item.EndTime));
        }) ?? root.Data[0];

      if (!current?.ProgramName) return null;

      const artist = current.StartTime && current.EndTime ? `${current.StartTime} ~ ${current.EndTime}` : null;
      const progId = optStringOrNull(current, "ProgramCode");
      const homepageUrl = progId ? `${baseUrl}/HOME2/?ACT=RADIO&MODE=HOME&ProgramCode=${progId}` : null;
      const songListUrl = progId
        ? `${baseUrl}/HOME2/?ACT=RADIO&MODE=CONTENTS&ProgramCode=${progId}&BoardType=BBSI_BOARD_NOTICE&BoardTitle=%EC%84%A0%EA%B3%A1%ED%91%9C&BoardGubun=RADIO`
        : null;
      return {
        title: current.ProgramName,
        artist,
        thumbnailUrl: current.ProgramImg || null,
        homepageUrl,
        songListUrl,
        songList: null,
      };
    } catch (err) {
      console.error("[BbsMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
