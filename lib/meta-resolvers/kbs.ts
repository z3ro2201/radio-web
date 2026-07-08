import { MetaFetcher, NowPlayingInfo, SongListItem } from "./types";
import { fetchJson, optStringOrNull } from "../fetchJson";

interface KbsRunning {
  start_time: string;
  end_time: string;
  status?: string;
  duration_minute?: string;
  duration_second?: string;
  ad_del_yn?: "Y" | "N";
}

// 개별 방송 스케줄 항목 (schedules 배열의 원소 하나)
interface KbsScheduleItem {
  running: KbsRunning;
  schedule_unique_id: number;
  program_planned_date: string;
  local_station_code: string;
  channel_code: string;
  program_planned_start_time: string; // "HHMMSSxx" 8자리 (예: "12000000" = 12시)
  program_planned_end_time: string;
  program_planned_duration_m: string;
  service_date: string; // "YYYYMMDD"
  service_start_time: string;
  service_end_time: string;
  program_code: string;
  program_id: string;
  program_title: string;
  program_subtitle: string;
  channel_code_name: string;
  image_w: string | null; // 이미 완전한 URL로 내려옴
  program_staff: string | null;
  program_actor: string | null; // 진행자(DJ)
  program_genre: string | null;
  homepage_url: string | null; // 이미 완전한 URL로 내려옴
  source: string | null; // 선곡표 API 호출에 필요
  sname: string | null; // 선곡표 API 호출에 필요
  stype: string | null; // 선곡표 API 호출에 필요
}

// root 배열의 원소 하나 = 채널 하나 (schedules를 감싸고 있음)
interface KbsChannelSchedule {
  channel_code: string;
  local_station_code: string;
  schedules: KbsScheduleItem[];
}

// 선곡표 - 응답 자체가 이 객체 하나다 (Record로 감싸져 있지 않음)
export interface KbsSongListItem {
  artist: string;
  duration: string;
  music_id: string;
  timestamp: string;
  album_name: string;
  song_title: string;
  album_image: string;
  program_code: string;
}

interface KbsSongListRoot {
  result: string | null;
  result_msg: string;
  channel_code: string;
  items: KbsSongListItem[];
}

const pad2 = (n: number) => String(n).padStart(2, "0");

// "HHMMSSxx" 형태에서 앞 4자리(HHMM)만 비교에 사용한다
const toHHMM = (raw: string) => raw.slice(0, 4);

const isNowInRange = (nowHHMM: string, startHHMM: string, endHHMM: string): boolean => {
  return endHHMM < startHHMM ? nowHHMM >= startHHMM || nowHHMM < endHHMM : nowHHMM >= startHHMM && nowHHMM < endHHMM;
};

/**
 * 선곡표를 가져온다. 실패하거나 못 찾으면 빈 배열을 반환한다 (예외를 던지지 않음).
 * 이 함수가 실패해도 fetchNowPlaying 전체가 실패하면 안 되기 때문에,
 * 여기서 실패 처리를 완결시키고 절대 밖으로 에러/null을 전파하지 않는다.
 */
const fetchSongList = async (
  homepageUrl: string,
  source: string,
  sname: string,
  stype: string,
  requestDate: string,
): Promise<SongListItem[]> => {
  try {
    const menuParams = new URLSearchParams();
    menuParams.set("platform", "M");
    menuParams.set("source", source);
    menuParams.set("sname", sname);
    menuParams.set("stype", stype);
    menuParams.set("page_type", "index");

    const menuApiUrl = `https://pprogramapi.kbs.co.kr/api/v1/page?${menuParams.toString()}`;
    const menuRoot = await fetchJson(menuApiUrl);
    const programCode = optStringOrNull(menuRoot?.data?.site?.meta, "program_code");

    if (!programCode) return [];

    const songListParams = new URLSearchParams();
    songListParams.set("program_code", programCode);
    songListParams.set("request_date", requestDate);
    songListParams.set("rtype", "json");

    const songListApiUrl = `https://kong2017.kbs.co.kr/api/mobile/select_song_list?${songListParams.toString()}`;
    const songRoot: KbsSongListRoot = await fetchJson(songListApiUrl);

    return (songRoot.items ?? []).map((songItem) => ({
      albumImage: songItem.album_image,
      title: songItem.song_title,
      artist: songItem.artist,
      time: `${songItem.timestamp.slice(8, 10)}:${songItem.timestamp.slice(10, 12)}`,
    }));
  } catch (err) {
    console.error("[KbsMeta] 선곡표 조회 실패:", err);
    return [];
  }
};

export const KbsMetaFetcher: MetaFetcher = {
  fetchNowPlaying: async (metaUrl: string): Promise<NowPlayingInfo | null> => {
    try {
      const url = new URL(metaUrl);
      const channelCode = url.searchParams.get("channel_code");

      // root는 채널 배열이다. 채널 하나 = { channel_code, local_station_code, schedules: [...] }
      const root: KbsChannelSchedule[] = await fetchJson(metaUrl);
      const channelEntry = root.find((item) => String(item.channel_code) === String(channelCode));
      if (!channelEntry) return null;

      const now = new Date();
      const nowHHMM = `${pad2(now.getHours())}${pad2(now.getMinutes())}`;
      const today = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;

      // schedules[0]을 무조건 쓰면 안 된다 - 하루치 여러 프로그램이 시간순으로 들어있어서,
      // 지금 이 순간 방송 중인 항목을 시간 비교로 직접 찾아야 한다.
      const current =
        channelEntry.schedules.find((item) => {
          if (item.service_date !== today) return false;
          const start = optStringOrNull(item, "program_planned_start_time");
          const end = optStringOrNull(item, "program_planned_end_time");
          if (!start || !end) return false;
          return isNowInRange(nowHHMM, toHHMM(start), toHHMM(end));
        }) ?? channelEntry.schedules[0];

      if (!current) return null;

      const programTitle = optStringOrNull(current, "program_title");
      if (!programTitle) return null;

      const subtitle = optStringOrNull(current, "program_subtitle");
      const fullTitle = subtitle ? `${programTitle}\n${subtitle}` : programTitle;

      const actor = optStringOrNull(current, "program_actor");
      const startTime = optStringOrNull(current, "program_planned_start_time");
      const endTime = optStringOrNull(current, "program_planned_end_time");
      const timeRange =
        startTime && endTime
          ? `${toHHMM(startTime).slice(0, 2)}:${toHHMM(startTime).slice(2, 4)} ~ ${toHHMM(endTime).slice(0, 2)}:${toHHMM(endTime).slice(2, 4)}`
          : null;

      const homepageUrl = optStringOrNull(current, "homepage_url");
      const source = optStringOrNull(current, "source");
      const sname = optStringOrNull(current, "sname");
      const stype = optStringOrNull(current, "stype");
      const programPlannedDate = optStringOrNull(current, "program_planned_date");

      // 선곡표는 있으면 좋은 부가 정보일 뿐, 실패해도 기본 정보(제목/진행자 등)는 그대로 반환해야 한다.
      const songList =
        homepageUrl && source && sname && stype
          ? await fetchSongList(homepageUrl, source, sname, stype, programPlannedDate ?? today)
          : [];

      return {
        title: fullTitle,
        artist: actor ?? timeRange, // 진행자 이름 우선, 없으면 방송 시간대
        thumbnailUrl: optStringOrNull(current, "image_w"),
        homepageUrl,
        songListUrl: songList.length > 0 ? homepageUrl : null,
        songList: songList.length > 0 ? songList : null,
      };
    } catch (err) {
      console.error("[KbsMeta] 메타 조회 실패:", err);
      return null;
    }
  },
};
