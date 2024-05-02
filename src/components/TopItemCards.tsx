import { cn } from "@/lib/utils";
import React from "react";
import { useQuery } from "react-query";
import usePlugins from "../hooks/usePlugins";
import SelectPlugin from "./SelectPlugin";
import TrackCard from "./TrackCard";

const TopItemCards: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();

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
      <div className="flex gap-5 w-full overflow-auto mt-5">
        {query.data?.tracks?.items.map((t) => (
          <TrackCard key={t.id} track={t} />
        ))}
      </div>
    </>
  );
};

export default TopItemCards;
