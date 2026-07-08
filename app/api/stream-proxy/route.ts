import { NextRequest, NextResponse } from "next/server";
import net from "node:net";
import { Readable } from "node:stream";

// net(raw socket) 모듈을 쓰기 때문에 반드시 Node.js 런타임이어야 한다 (Edge에선 안 됨)
export const runtime = "nodejs";

interface ShoutcastResponse {
  statusCode: number;
  headers: Record<string, string>;
  stream: Readable;
}

/**
 * SHOUTcast v1 서버는 "ICY 200 OK"라는 비표준 상태줄로 응답한다.
 * fetch()/undici는 HTTP/, RTSP/, ICE/만 허용해서 이 응답 자체를 파싱 단계에서
 * 거부해버린다 (HTTPParserError). 그래서 표준 HTTP 클라이언트를 아예 안 쓰고,
 * raw TCP 소켓으로 직접 붙어서 응답을 우리가 수동으로 파싱한다.
 */
const connectShoutcast = (host: string, port: number, path: string): Promise<ShoutcastResponse> => {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, host);
    let headerBuffer = Buffer.alloc(0);
    let settled = false;

    const request =
      `GET ${path} HTTP/1.0\r\n` +
      `Host: ${host}\r\n` +
      `Icy-MetaData: 0\r\n` + // 오디오 바이트 사이에 메타데이터 안 섞이게
      `User-Agent: Mozilla/5.0\r\n` +
      `Connection: close\r\n` +
      `\r\n`;

    const cleanupAndReject = (err: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(err);
    };

    socket.setTimeout(10000, () => cleanupAndReject(new Error("연결 타임아웃")));
    socket.on("error", cleanupAndReject);

    socket.on("connect", () => {
      socket.write(request);
    });

    const onData = (chunk: Buffer) => {
      if (settled) return;
      headerBuffer = Buffer.concat([headerBuffer, chunk]);

      const headerEndIndex = headerBuffer.indexOf("\r\n\r\n");
      if (headerEndIndex === -1) {
        // 헤더가 아직 다 안 왔으면 계속 기다린다 (너무 커지면 방어적으로 끊음)
        if (headerBuffer.length > 8192) cleanupAndReject(new Error("헤더가 너무 큼"));
        return;
      }

      settled = true;
      socket.removeListener("data", onData);
      socket.setTimeout(0);

      const headerText = headerBuffer.subarray(0, headerEndIndex).toString("utf-8");
      const remaining = headerBuffer.subarray(headerEndIndex + 4);

      const lines = headerText.split("\r\n");
      const statusLine = lines[0] ?? "";
      const statusMatch = statusLine.match(/(\d{3})/);
      const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 0;

      const headers: Record<string, string> = {};
      for (const line of lines.slice(1)) {
        const idx = line.indexOf(":");
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim().toLowerCase();
        const value = line.slice(idx + 1).trim();
        headers[key] = value;
      }

      // 헤더 파싱하고 남은 나머지 바이트(이미 도착한 오디오 데이터)부터
      // 이어서 body 스트림으로 흘려보낸다. 소켓에 더 오는 데이터도 계속 이어붙인다.
      const bodyStream = new Readable({ read() {} });
      if (remaining.length > 0) bodyStream.push(remaining);

      socket.on("data", (c: Buffer) => bodyStream.push(c));
      socket.on("end", () => bodyStream.push(null));
      socket.on("close", () => bodyStream.push(null));
      socket.on("error", (err) => bodyStream.destroy(err));

      resolve({ statusCode, headers, stream: bodyStream });
    };

    socket.on("data", onData);
  });
};

export const GET = async (req: NextRequest) => {
  const targetUrl = req.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const url = new URL(targetUrl);
    const host = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 80;

    // SHOUTcast v1은 루트("/")로 접속하면 관리자 상태 페이지를 주고,
    // 경로 끝에 세미콜론(";")을 붙여야 실제 스트림을 준다 (Winamp 등 예전
    // 플레이어들의 관례를 SHOUTcast v1이 "재생 요청"으로 인식하는 방식).
    const basePath = url.pathname || "/";
    const path = (basePath.endsWith(";") ? basePath : `${basePath}${basePath.endsWith("/") ? ";" : "/;"}`) + url.search;

    const { statusCode, headers, stream } = await connectShoutcast(host, port, path);

    if (statusCode !== 200) {
      stream.destroy();
      return new NextResponse(null, { status: statusCode || 502 });
    }

    const originContentType = headers["content-type"] ?? "";
    const contentType = /^audio\//i.test(originContentType) ? originContentType : "audio/mpeg";

    const webStream = Readable.toWeb(stream) as unknown as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[stream-proxy] raw socket 실패:", err);
    return new NextResponse(null, { status: 502 });
  }
};
