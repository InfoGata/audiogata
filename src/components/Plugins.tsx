import { Button } from "@material-ui/core";
import React from "react";

const napsterApiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
const napsterApi = "https://api.napster.com";
const napsterServerUrl = "http://localhost:2000";
const napsterOauthUrl = `${napsterApi}/oauth/authorize?client_id=${napsterApiKey}&response_type=code`;
const spotifyServerUrl = "http://localhost:8888";

const onSpotifyLoginClick = () => {
  const redirectUrl = `${napsterServerUrl}/authorize`;
  window.location.href = `${napsterOauthUrl}&redirect_uri=${redirectUrl}`;
};
const onNapsterLoginClick = () => {
  const loginUrl = `${spotifyServerUrl}/login`;
  window.location.href = `${loginUrl}`;
};

const Plugins: React.FC = () => {
  return (
    <>
      <Button onClick={onSpotifyLoginClick}>Login to Spotify</Button>
      <Button onClick={onNapsterLoginClick}>Login to Napster</Button>
    </>
  );
};

export default Plugins;
