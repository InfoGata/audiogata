import DOMPurify from "dompurify";
import React from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import Spinner from "../components/Spinner";
import usePlugins from "../hooks/usePlugins";
import { useAppSelector } from "../store/hooks";

const Lyrics: React.FC = () => {
  const { plugins, pluginsLoaded } = usePlugins();
  const sanitizer = DOMPurify.sanitize;
  const lyricsPluginId = useAppSelector(
    (state) => state.settings.lyricsPluginId
  );
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const trackName = params.get("trackName");
  const artistName = params.get("artistName") ?? "";

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

export default Lyrics;
