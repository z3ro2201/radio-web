import { Manifest } from "@/common/props/manifest";

const BASE_URL = "https://raw.githubusercontent.com/z3ro2201/damoaRadio/refs/heads/main/release";

export const getManifest = async (): Promise<Manifest> => {
  const res = await fetch(`${BASE_URL}/manifest.json`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`manifest.json 파일을 찾을 수 없습니다. (${res.status})`);
  }

  return res.json();
};
