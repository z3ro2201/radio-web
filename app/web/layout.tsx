import React from "react";

import View from "@/components/layout/view";
import { StationsProvider } from "@/components/providers/stations-provider";
import { PlayerProvider } from "@/components/providers/player-provider";
import { getManifest } from "@/lib/manifest";

const AppsLayout = async ({ children }: { children: React.ReactNode }) => {
  const manifest = await getManifest();
  return (
    <>
      <StationsProvider manifest={manifest}>
        <PlayerProvider>
          <div className="bg-gray-100">
            <View children={children} />
          </div>
        </PlayerProvider>
      </StationsProvider>
    </>
  );
};

export default AppsLayout;
