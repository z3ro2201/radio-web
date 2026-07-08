"use client";

import { MetaSkeleton } from "./skeleton";
import { usePlayer } from "@/components/providers/player-provider";
import { useNowPlayingMeta } from "@/hooks/useNowPlayingMeta";
import { useResolvedStreamUrl } from "@/hooks/useResolvedStreamUrl";
import { NowPlayingInfo } from "@/lib/meta-resolvers/types";
import Hls, { FetchLoader } from "hls.js";
import { ChevronDownIcon, ChevronUpIcon, Loader2Icon, PauseIcon, PlayIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { SongListItem } from "@/lib/meta-resolvers/types";

import Image from "next/image";
import Link from "next/link";

const AudioPlayer = ({ streamUrl, isPlay }: { streamUrl: string | null; isPlay: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { setIsBuffering, setHasError } = usePlayer();
  const isPlayRef = useRef(isPlay);
  const generationRef = useRef(0);
  const readyRef = useRef(false);

  useEffect(() => {
    isPlayRef.current = isPlay;
  }, [isPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentGeneration = ++generationRef.current;
    let hls: Hls | null = null;

    setIsBuffering(false);
    setHasError(false);
    readyRef.current = false;

    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    if (!streamUrl) return;

    // 원본 서버에 브라우저가 직접 붙지 않고 우리 서버를 거치게 한다.
    // (일부 CDN이 gzip 압축 + 206 Partial Content를 같이 응답해서 브라우저가
    //  디코딩을 거부하는 문제 - "ERR_CONTENT_DECODING_FAILED" - 를 여기서 원천 차단)
    // const proxiedUrl = `/api/stream-proxy?url=${encodeURIComponent(streamUrl)}`;
    const proxiedUrl = streamUrl;

    const tryPlay = () => {
      if (currentGeneration !== generationRef.current) return;
      readyRef.current = true;
      if (!isPlayRef.current) return;
      audio.play().catch((err) => {
        console.error("[AudioPlayer] play() 실패:", err);
        setHasError(true);
      });
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setHasError(false);
    };
    const handleNativeError = () => setHasError(true);

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleNativeError);

    if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = proxiedUrl;
      audio.addEventListener("loadedmetadata", tryPlay, { once: true });
    } else if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 6, // 라이브 엣지보다 몇 세그먼트 뒤에서 재생할지 (여유 버퍼 확보용 - 늘릴수록 버벅임은 줄고 지연은 조금 늘어남)
        liveMaxLatencyDurationCount: 10, // 이보다 엣지에서 멀어지면 강제로 따라잡음
        fragLoadingMaxRetry: 8,
        fragLoadingRetryDelay: 1000,
        manifestLoadingMaxRetry: 8,
        manifestLoadingRetryDelay: 1500,
        loader: FetchLoader,
        fetchSetup: (context, initParams) => {
          return new Request(context.url, { ...initParams, cache: "no-store" });
        },
      });
      hls.loadSource(proxiedUrl);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("[AudioPlayer] hls.js 에러:", data);
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            setIsBuffering(true);
            hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            setIsBuffering(true);
            hls?.recoverMediaError();
            break;
          default:
            setIsBuffering(false);
            setHasError(true);
            hls?.destroy();
            break;
        }
      });
    }

    return () => {
      audio.removeEventListener("loadedmetadata", tryPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleNativeError);
      hls?.destroy();
    };
  }, [streamUrl, setIsBuffering, setHasError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !readyRef.current) return;
    if (isPlay) {
      audio.play().catch((err) => {
        console.error("[AudioPlayer] play() 실패:", err);
        setHasError(true);
      });
    } else {
      audio.pause();
    }
  }, [isPlay, setHasError]);

  return <audio ref={audioRef} className="hidden" />;
};

interface PlayButtonProps {
  isPlay: boolean;
  onClick: () => void;
  size?: "sm" | "lg";
}

const PlayButton = ({ isPlay, onClick, size = "sm" }: PlayButtonProps) => {
  const dimension = size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const iconSize = size === "lg" ? "w-7 h-7" : "w-5 h-5";
  return (
    <button
      onClick={onClick}
      className={`${dimension} flex justify-center items-center bg-brand text-white rounded-full cursor-pointer`}
    >
      {isPlay ? <PauseIcon className={iconSize} /> : <PlayIcon className={iconSize} />}
    </button>
  );
};

const ModeChangeButton = () => {
  const { setViewMode } = usePlayer();
  return (
    <button
      onClick={() => setViewMode("now")}
      className="w-12 h-12 flex justify-center items-center bg-gray-200 rounded-full cursor-pointer"
    >
      <ChevronUpIcon />
    </button>
  );
};

const SongListIntent = ({ songListArray }: { songListArray: SongListItem[] }) => {
  console.log(songListArray);

  const w = 80;
  const h = 80;
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white">
      <h1>선곡표</h1>
      <ul className="h-full overflow-auto">
        {songListArray.map((item, key) => {
          return (
            <li className="p-2 flex gap-2" key={key}>
              <img
                src={item.albumImage}
                width={w}
                height={h}
                className={`min-w-[${w}px] min-h-[${h}px] max-w-[${w}px] max-h-[${h}px] rounded-lg`}
                alt={item.artist ?? ""}
              />
              <div className="flex flex-col gap-1">
                <span className="block">{item.title}</span>
                <span className="block">{item.artist}</span>
                <span className="block">{item.time}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const NowPlayIntent = ({ meta }: { meta: NowPlayingInfo | null }) => {
  const { currentChannel, isPlay, isBuffering, hasError, toggle, setViewMode } = usePlayer();
  if (!currentChannel) {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center text-gray-400">
        재생 중인 채널이 없습니다
        <button onClick={() => setViewMode("bar")} className="mt-4 text-sm text-brand underline">
          닫기
        </button>
      </div>
    );
  }

  const [isSongList, setIsSongList] = useState<boolean>(false);
  useEffect(() => {
    console.log(isSongList);
  }, [isSongList]);
  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col px-6 py-8">
      <div className="self-start w-full flex p-2 -ml-2 justify-between">
        <button onClick={() => setViewMode("bar")}>
          <ChevronDownIcon className="w-6 h-6" />
        </button>
        {!meta?.songList && meta?.songListUrl && (
          <Link href={meta.songListUrl} target="_blank">
            선곡표
          </Link>
        )}
        {meta?.songList && (
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsSongList((prev) => !prev);
            }}
          >
            선곡표
          </Link>
        )}
      </div>
      <div className="relative flex-1 flex flex-col items-center justify-center gap-8">
        {meta?.songList && isSongList && <SongListIntent songListArray={meta.songList} />}
        {meta?.thumbnailUrl ? (
          <img src={meta.thumbnailUrl} className="w-64 h-64 rounded-2xl object-cover" />
        ) : (
          <div className="w-64 h-64 rounded-2xl bg-gray-200" />
        )}
        <div className="text-center px-4">
          <h2 className="text-lg font-semibold">{currentChannel.channelName}</h2>
          {isBuffering ? (
            <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Loader2Icon className="w-4 h-4 animate-spin" />
              버퍼링중입니다...
            </p>
          ) : hasError ? (
            <p className="text-sm text-red-500 mt-2">재생에 문제가 발생했습니다.</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mt-2">{meta?.title ?? ""}</p>
              {meta?.artist && <p className="text-xs text-gray-400 mt-1">{meta.artist}</p>}
            </>
          )}
        </div>
        <PlayButton isPlay={isPlay} onClick={toggle} size="lg" />
      </div>
    </div>
  );
};

const PlayerBar = ({ meta, isLoading }: { meta: NowPlayingInfo | null; isLoading: boolean }) => {
  const { currentChannel, isPlay, isBuffering, hasError, toggle } = usePlayer();
  if (!currentChannel) {
    return (
      <div className="w-full min-h-14 pb-[env(safe-area-inset-bottom)] border-t rounded-t-lg border border-b-0 border-brand bg-white flex items-center justify-center text-sm text-gray-400">
        재생 중인 채널이 없습니다
      </div>
    );
  }
  const showInitialSkeleton = isLoading && !meta;
  return (
    <div className="w-full min-h-14 pb-[env(safe-area-inset-bottom)] border-t rounded-t-lg border border-b-0 border-brand bg-white">
      <div className="flex gap-2 justify-between">
        <div className="w-9/12">
          {isBuffering ? (
            <div className="h-[50px] px-3 py-2 flex items-center gap-2 text-sm text-gray-500">
              <Loader2Icon className="w-4 h-4 animate-spin" />
              버퍼링중입니다...
            </div>
          ) : hasError ? (
            <div className="px-3 py-2 flex items-center text-sm text-red-500">재생에 문제가 발생했습니다.</div>
          ) : showInitialSkeleton ? (
            <MetaSkeleton />
          ) : (
            <div className="px-3 py-2 flex flex-row gap-2">
              {meta?.thumbnailUrl ? (
                <img
                  src={meta.thumbnailUrl}
                  width={50}
                  height={50}
                  className="rounded-lg max-w-[50px] max-h-[50px] min-w-[50px] min-h-[50px]"
                />
              ) : (
                <div className="w-[50px] h-[50px] rounded-lg bg-gray-200" />
              )}
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="text-sm font-semibold truncate">{currentChannel.channelName}</span>
                <span className="text-xs text-gray-500 truncate">{meta?.title ?? ""}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 mx-2">
          <PlayButton isPlay={isPlay} onClick={toggle} />
          <ModeChangeButton />
        </div>
      </div>
    </div>
  );
};

const Player = () => {
  const { currentChannel, isPlay, viewMode } = usePlayer();
  // meta는 여기 Player에서 한 번만 fetch한다. PlayerBar/NowPlayIntent 각자 따로 호출하면
  // viewMode 전환 시 컴포넌트가 새로 마운트되면서 이전에 불러온 meta를 잃어버리고
  // 다시 처음부터 로딩하게 되므로, 부모에서 한 번만 들고 있다가 props로 내려준다.
  const { meta, isLoading } = useNowPlayingMeta(currentChannel?.metaUrl ?? null, currentChannel?.metaType ?? null);
  // streamType이 "direct"가 아니면(fetchJson/fetchText) 서버를 거쳐 실제 재생 URL을 해석한다
  const { resolvedUrl } = useResolvedStreamUrl(currentChannel);

  return (
    <>
      <AudioPlayer streamUrl={resolvedUrl} isPlay={isPlay} />
      <PlayerBar meta={meta} isLoading={isLoading} />
      {viewMode === "now" && <NowPlayIntent meta={meta} />}
    </>
  );
};

export default Player;
