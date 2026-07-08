import React from "react";

import View from "@/components/layout/view";
import { StationsProvider } from "@/components/providers/stations-provider";
import { PlayerProvider } from "@/components/providers/player-provider";
import { FavoritesProvider } from "@/components/providers/favorites-provider";
import { RecentProvider } from "@/components/providers/recent-provider";
import { getManifest } from "@/lib/manifest";

export const dynamic = "force-dynamic";

const AppsLayout = async ({ children }: { children: React.ReactNode }) => {
  const manifest = await getManifest();
  return (
    <>
      <StationsProvider manifest={manifest}>
        <PlayerProvider>
          <RecentProvider>
            <FavoritesProvider>
              <div className="bg-gray-100">
                <View children={children} />
              </div>
            </FavoritesProvider>
          </RecentProvider>
        </PlayerProvider>
      </StationsProvider>
    </>
  );
};

export default AppsLayout;
