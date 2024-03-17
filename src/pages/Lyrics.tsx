import { Box, Typography } from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import usePlugins from "../hooks/usePlugins";
import { useAppSelector } from "../store/hooks";
import Spinner from "../components/Spinner";

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
    <Box>
      <Spinner open={query.isLoading} />
      <Typography align="center" variant="h4">
        {trackName}
      </Typography>
      {artistName && (
        <Typography align="center" variant="h5">
          {artistName}
        </Typography>
      )}
      <Typography
        align="center"
        sx={{ whiteSpace: "pre-line" }}
        dangerouslySetInnerHTML={{ __html: sanitizer(query.data ?? "") }}
      />
    </Box>
  );
};

export default Lyrics;
