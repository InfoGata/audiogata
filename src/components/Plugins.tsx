import React from "react";
import { Button, Divider, Grid } from "@mui/material";
import Spotify from "../plugins/spotify";

const Plugins: React.FC = () => {
  const onSpotifyLoginClick = async () => {
    await Spotify.login();
  };

  return (
    <Grid>
      <Divider />
      <Button onClick={onSpotifyLoginClick}>Login to Spotify</Button>
    </Grid>
  );
};

export default Plugins;
