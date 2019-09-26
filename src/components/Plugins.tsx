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
    <div>
      <button onClick={onSpotifyLoginClick}>Login to Spotify</button>
      <button onClick={onNapsterLoginClick}>Login to Napster</button>
    </div>
  );
};

export default Plugins;
