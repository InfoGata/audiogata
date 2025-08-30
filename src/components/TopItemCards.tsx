import { cn } from "@/lib/utils";
import React from "react";
import { useQuery } from "react-query";
import usePlugins from "../hooks/usePlugins";
import SelectPlugin from "./SelectPlugin";
import TrackCard from "./TrackCard";
import ArtistCard from "./ArtistCard";
import AlbumCard from "./AlbumCard";
import PlaylistCard from "./PlaylistCard";
import { useTranslation } from "react-i18next";

const TopItemCards: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();
  const { t } = useTranslation();

  const getTopItems = async () => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin) {
      const results = await plugin.remote.onGetTopItems();
      return results;
    }
  };

  const query = useQuery(["topitems", pluginId], getTopItems, {
    // Keep query for 5 minutes
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <div className={cn(pluginId ? "block" : "hidden")}>
        <SelectPlugin
          pluginId={pluginId}
          setPluginId={setPluginId}
          methodName="onGetTopItems"
          useCurrentPlugin={true}
        />
      </div>
      {query.data?.tracks?.items.length ? (
        <>
          <h2 className="text-2xl font-bold">{t("tracks")}</h2>
          <div className="flex gap-5 w-full overflow-auto mt-5">
            {query.data?.tracks?.items.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </div>
        </>
      ) : null}
      {query.data?.albums?.items.length ? (
        <>
          <h2 className="text-2xl font-bold">{t("albums")}</h2>
          <div className="flex gap-5 w-full overflow-auto mt-5">
            {query.data?.albums?.items.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </div>
        </>
      ) : null}
      {query.data?.artists?.items.length ? (
        <>
          <h2 className="text-2xl font-bold">{t("artists")}</h2>
          <div className="flex gap-5 w-full overflow-auto mt-5">
            {query.data?.artists?.items.map((i) => (
              <ArtistCard key={i.id} artist={i} />
            ))}
          </div>
        </>
      ) : null}
      {query.data?.playlists?.items.length ? (
        <>
          <h2 className="text-2xl font-bold">{t("playlists")}</h2>
          <div className="flex gap-5 w-full overflow-auto mt-5">
            {query.data?.playlists?.items.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
};

export default TopItemCards;
