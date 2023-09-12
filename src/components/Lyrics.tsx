import React, { useEffect } from "react";
import usePlugins from "../hooks/usePlugins";
import { useLocation } from "react-router-dom";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { useAppSelector } from "../store/hooks";
import { useQuery } from "react-query";
import DOMPurify from "dompurify";

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
      let lyricsResponse = await plugin.remote.onGetLyrics({
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
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
