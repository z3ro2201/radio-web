"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { FontSize, getFontSize, saveFontSize, getFontScale } from "@/lib/storage/font-size";

interface FontSizeContextValue {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

const applyFontScale = (size: FontSize) => {
  document.documentElement.style.setProperty("--font-scale", String(getFontScale(size)));
};

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");

  // 최초 마운트 시 localStorage에서 불러와 즉시 반영
  useEffect(() => {
    const stored = getFontSize();
    setFontSizeState(stored);
    applyFontScale(stored);
  }, []);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    saveFontSize(size);
    applyFontScale(size);
  };

  return <FontSizeContext.Provider value={{ fontSize, setFontSize }}>{children}</FontSizeContext.Provider>;
};

export const useFontSize = () => {
  const ctx = useContext(FontSizeContext);

  if (!ctx) {
    throw new Error("useFontSize는 FontSizeProvider 내부에서만 사용할 수 있습니다.");
  }

  return ctx;
};
