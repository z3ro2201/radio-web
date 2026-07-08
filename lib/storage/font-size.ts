export type FontSize = "normal" | "large" | "xlarge";

const FONT_SIZE_KEY = "font-size";

// 이 배율만큼 <html>의 기본 font-size(16px)에 곱해진다.
// Tailwind의 text-* 클래스들이 대부분 rem 기반이라, 이거 하나로 앱 전체 글자가 같이 커진다.
const FONT_SIZE_SCALE: Record<FontSize, number> = {
  normal: 1,
  large: 1.15,
  xlarge: 1.3,
};

export const getFontSize = (): FontSize => {
  if (typeof window === "undefined") return "normal";

  const raw = localStorage.getItem(FONT_SIZE_KEY);
  if (raw === "normal" || raw === "large" || raw === "xlarge") return raw;
  return "normal";
};

export const saveFontSize = (size: FontSize): void => {
  try {
    localStorage.setItem(FONT_SIZE_KEY, size);
  } catch {
    // 저장 공간 초과 등은 무시해도 앱 동작엔 지장 없음
  }
};

export const getFontScale = (size: FontSize): number => FONT_SIZE_SCALE[size];
