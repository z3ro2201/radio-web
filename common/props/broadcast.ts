export interface BroadcastMetaProps {
  songName: string | null;
  actorName: string | null;
}

export interface BroadcastProps {
  channelName: string | null;
  channelId: string | null;
  streamUrl: string | null;
  streamType: "direct" | "fetchJson" | "fetchText" | null;
  jsonPath: string | null; // streamType이 "fetchJson"일 때, 응답에서 실제 스트림 주소를 꺼낼 경로
  broadcastType: "internet" | "radio";
  metaUrl: string | null;
  metaType: string | null;
}
