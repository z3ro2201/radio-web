import { BroadcastProps } from "@/common/props/broadcast";

const RECENT_KEY = "recent-channels";
const MAX_RECENT = 20;

export const getRecent = (): BroadcastProps[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BroadcastProps[];
  } catch {
    return [];
  }
};

const saveRecent = (recent: BroadcastProps[]): void => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    // 저장 공간 초과 등은 무시해도 앱 동작엔 지장 없음
  }
};

/**
 * 재생 시작 시 호출한다. 같은 채널이 이미 있으면 맨 앞으로 옮기고,
 * 없으면 맨 앞에 추가한다. 최대 개수(MAX_RECENT)를 넘으면 오래된 것부터 잘라낸다.
 * 최신 목록을 그대로 반환하니, 호출부에서 이 반환값으로 상태를 갱신하면 된다.
 */
export const addRecent = (channel: BroadcastProps): BroadcastProps[] => {
  const current = getRecent();
  const withoutDuplicate = current.filter((item) => item.channelId !== channel.channelId);

  const next = [channel, ...withoutDuplicate].slice(0, MAX_RECENT);

  saveRecent(next);
  return next;
};

export const clearRecent = (): void => {
  saveRecent([]);
};
