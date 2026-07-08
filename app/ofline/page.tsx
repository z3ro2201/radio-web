const OfflinePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2 px-6 text-center">
      <h1 className="text-lg font-semibold">인터넷 연결이 끊겼어요</h1>
      <p className="text-sm text-gray-500">
        라디오는 실시간 스트리밍이라 오프라인에서는 재생할 수 없어요. 연결이 복구되면 자동으로 이용하실 수 있어요.
      </p>
    </div>
  );
};

export default OfflinePage;
