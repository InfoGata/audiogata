import { createFileRoute } from "@tanstack/react-router";
import DOMPurify from "dompurify";
import React from "react";
import { useQuery } from "react-query";
import Spinner from "../components/Spinner";
import usePlugins from "../hooks/usePlugins";
import { useAppSelector } from "../store/hooks";
import { z } from "zod";

const Lyrics: React.FC = () => {
  const { plugins, pluginsLoaded } = usePlugins();
  const sanitizer = DOMPurify.sanitize;
  const lyricsPluginId = useAppSelector(
    (state) => state.settings.lyricsPluginId
  );
  const { trackName, artistName } = Route.useSearch();

  const getLyrics = async () => {
    const plugin = plugins.find((p) => p.id === lyricsPluginId);
    if (trackName && plugin && (await plugin.hasDefined.onGetLyrics())) {
      const lyricsResponse = await plugin.remote.onGetLyrics({
        trackName,
        artistName,
      });
      return lyricsResponse.lyrics;
    }
  };

  const query = useQuery(
    ["lyrics", lyricsPluginId, trackName, artistName],
    getLyrics,
    {
      enabled: pluginsLoaded,
    }
  );

  return (
    <div>
      <Spinner open={query.isLoading} />
      <h2 className="text-3xl text-center">{trackName}</h2>
      {artistName && <h3 className="text-2xl text-center">{artistName}</h3>}
      <p
        className="whitespace-pre-line text-center"
        dangerouslySetInnerHTML={{ __html: sanitizer(query.data ?? "") }}
      />
    </div>
  );
};

const lyricsSearchSchema = z.object({
  trackName: z.string().optional().catch(undefined),
  artistName: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/lyrics")({
  component: Lyrics,
  validateSearch: lyricsSearchSchema,
});
