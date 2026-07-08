import net from "node:net";

export interface ShoutcastRawResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: Buffer;
}

const parseHeaderText = (headerText: string): { statusCode: number; headers: Record<string, string> } => {
  const lines = headerText.split("\r\n");
  const statusLine = lines[0] ?? "";
  const statusMatch = statusLine.match(/(\d{3})/);
  const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 0;

  const headers: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    headers[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim();
  }

  return { statusCode, headers };
};

/**
 * SHOUTcast v1 서버는 "ICY 200 OK" 같은 비표준 상태줄로 응답해서 fetch()/undici가
 * 프로토콜 파싱 단계에서 아예 거부한다 (HTTPParserError). raw TCP 소켓으로 직접
 * 붙어서 우리가 헤더/바디를 수동으로 분리한다.
 *
 * /7.html, /currentsong처럼 응답이 짧고 끝이 있는 텍스트 전용이다.
 * (오디오 스트림처럼 끝없이 흐르는 응답엔 안 맞음 - 그건 stream-proxy에서
 * 스트리밍 방식으로 별도 처리한다.)
 */
export const fetchShoutcastRaw = (
  host: string,
  port: number,
  path: string,
  timeoutMs = 5000,
): Promise<ShoutcastRawResponse> => {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, host);
    let buffer = Buffer.alloc(0);
    let settled = false;
    let headerEndIndex = -1;

    const request =
      `GET ${path} HTTP/1.0\r\n` +
      `Host: ${host}\r\n` +
      `User-Agent: Mozilla/5.0\r\n` +
      `Connection: close\r\n` +
      `\r\n`;

    const finish = (err: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(err);
    };

    socket.setTimeout(timeoutMs, () => finish(new Error("연결 타임아웃")));
    socket.on("error", finish);

    socket.on("connect", () => {
      socket.write(request);
    });

    socket.on("data", (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (headerEndIndex === -1) {
        headerEndIndex = buffer.indexOf("\r\n\r\n");
      }
    });

    socket.on("close", () => {
      if (settled) return;
      settled = true;

      if (headerEndIndex === -1) {
        reject(new Error("응답 헤더를 찾지 못했습니다."));
        return;
      }

      const headerText = buffer.subarray(0, headerEndIndex).toString("utf-8");
      const body = buffer.subarray(headerEndIndex + 4);
      const { statusCode, headers } = parseHeaderText(headerText);

      resolve({ statusCode, headers, body });
    });
  });
};
