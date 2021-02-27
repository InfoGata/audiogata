import { Button } from "@material-ui/core";
import { UserManager, UserManagerSettings } from 'oidc-client';
import React from "react";

const napsterApiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
const napsterApi = "https://api.napster.com";
const napsterServerUrl = "http://localhost:2000";
const napsterOauthUrl = `${napsterApi}/oauth/authorize?client_id=${napsterApiKey}&response_type=code`;
const spotifyUrl = "https://accounts.spotify.com/authorize";
const spotifyTokenEndpoint = "https://accounts.spotify.com/api/token"

const onSpotifyLoginClick = async () => {
  const settings: UserManagerSettings = {
    authority: "https://accounts.spotify.com",
    client_id: "b8f2fce4341b42e580e66a37302b358e",
    response_type: "code",
    redirect_uri: "http://localhost:3000",
    scope: "streaming",
    popup_redirect_uri: window.origin + "/audio-pwa/login_popup.html",
    metadata: {
      authorization_endpoint: spotifyUrl,
      token_endpoint: spotifyTokenEndpoint
    }
  };
  const userManager = new UserManager(settings);
  userManager.signinPopup();
};
const onNapsterLoginClick = () => {
  const redirectUrl = `${napsterServerUrl}/authorize`;
  window.location.href = `${napsterOauthUrl}&redirect_uri=${redirectUrl}`;
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
