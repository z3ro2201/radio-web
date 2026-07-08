"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useFontSize } from "@/components/providers/font-size-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useRecent } from "@/components/providers/recent-provider";
import { FontSize } from "@/lib/storage/font-size";

const THEME_OPTIONS = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템 설정" },
] as const;

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "normal", label: "보통" },
  { value: "large", label: "크게" },
  { value: "xlarge", label: "매우크게" },
];

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { clearFavorites } = useFavorites();
  const { clearRecent } = useRecent();
  // next-themes는 서버에선 실제 테마를 모르니, 마운트 전엔 UI를 안 그려서
  // hydration mismatch(서버/클라이언트 결과 다름)를 피한다.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClearRecent = () => {
    if (!confirm("최근 들은 채널 기록을 전부 지울까요?")) return;
    clearRecent();
  };

  const handleClearFavorites = () => {
    if (!confirm("즐겨찾기한 채널을 전부 지울까요?")) return;
    clearFavorites();
  };

  const handleResetAll = () => {
    if (!confirm("최근목록, 즐겨찾기, 테마, 글자 크기 설정을 전부 초기화할까요?")) return;
    clearRecent();
    clearFavorites();
    setTheme("system");
    setFontSize("normal");
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <section>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">테마</h3>
        {mounted && (
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  theme === option.value
                    ? "bg-brand text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">글자 크기</h3>
        <div className="flex gap-2">
          {FONT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFontSize(option.value)}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                fontSize === option.value
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">데이터 관리</h3>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleClearRecent}
            className="px-3 py-2 rounded-md text-sm text-left bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            최근기록 지우기
          </button>
          <button
            type="button"
            onClick={handleClearFavorites}
            className="px-3 py-2 rounded-md text-sm text-left bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            즐겨찾기 지우기
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-2 rounded-md text-sm text-left bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900"
          >
            전체초기화
          </button>
        </div>
      </section>

      <Link href="/web/privacy" className="text-sm text-gray-500 dark:text-gray-400 underline">
        Privacy
      </Link>
    </div>
  );
};

export default SettingsPage;
