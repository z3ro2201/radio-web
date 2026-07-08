import { BroadcastProps } from "@/common/props/broadcast";

const FAVORITES_KEY = "favorites";

/**
 * localStorage에서 즐겨찾기 목록을 읽어온다.
 * 서버 사이드(window 없음)나 파싱 실패 시엔 빈 배열을 반환한다.
 */
export const getFavorites = (): BroadcastProps[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BroadcastProps[];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites: BroadcastProps[]): void => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // 저장 공간 초과 등은 무시해도 앱 동작엔 지장 없음
  }
};

export const isFavorite = (channelId: string | null): boolean => {
  if (!channelId) return false;
  return getFavorites().some((fav) => fav.channelId === channelId);
};

/**
 * 즐겨찾기 상태를 뒤집는다 (있으면 제거, 없으면 추가).
 * 최신 목록을 그대로 반환하니, 호출부에서 이 반환값으로 상태를 갱신하면 된다.
 */
export const toggleFavorite = (channel: BroadcastProps): BroadcastProps[] => {
  const current = getFavorites();
  const exists = current.some((fav) => fav.channelId === channel.channelId);

  const next = exists ? current.filter((fav) => fav.channelId !== channel.channelId) : [...current, channel];

  saveFavorites(next);
  return next;
};

export const removeFavorite = (channelId: string): BroadcastProps[] => {
  const next = getFavorites().filter((fav) => fav.channelId !== channelId);
  saveFavorites(next);
  return next;
};

export const clearFavorites = (): void => {
  saveFavorites([]);
};
