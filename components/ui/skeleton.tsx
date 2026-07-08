export const MetaSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-3">
      {/* 앨범 커버 */}
      <div className="w-12 h-12 rounded-md bg-gray-200 animate-pulse"></div>

      <div className="flex-1 flex flex-col gap-2">
        {/* 제목 */}
        <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
        {/* 서브텍스트 */}
        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};
