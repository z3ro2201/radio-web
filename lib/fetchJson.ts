import { Agent, fetch as undiciFetch } from "undici";

export const fetchJson = async (url: string, init?: RequestInit): Promise<any> => {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
      ...(init?.headers as Record<string, string> | undefined),
    },
    signal: init?.signal ?? AbortSignal.timeout(5000),
  });
  return res.json();
};

// obs.co.kr처럼 서버가 구식 DH 키(2048비트 미만)를 써서 기본 TLS 보안 레벨(SECLEVEL 2)에
// 막히는 경우 전용. 이 요청에만 SECLEVEL을 낮춰서 예외적으로 허용한다.
// (전역 설정이 아니라 이 함수를 쓰는 요청에만 적용됨 - 다른 정상적인 서버는 영향 없음)
const legacyTlsAgent = new Agent({
  connect: {
    ciphers: "DEFAULT@SECLEVEL=1",
    rejectUnauthorized: true, // 인증서 검증 자체는 그대로 유지
  },
});

export const fetchJsonLegacyTls = async (url: string): Promise<any> => {
  const res = await undiciFetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
    signal: AbortSignal.timeout(5000),
    dispatcher: legacyTlsAgent,
  });
  return res.json();
};

export const optStringOrNull = (obj: unknown, key: string): string | null => {
  const v = (obj as Record<string, unknown> | null | undefined)?.[key];
  if (v === undefined || v === null) return null;
  const s = String(v);
  return s === "" || s === "null" ? null : s;
};
