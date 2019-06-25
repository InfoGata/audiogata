import React from "react";

const napsterApiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
const napsterApi = "https://api.napster.com";
const napsterServerUrl = "http://localhost:2000";
const napsterOauthUrl = `${napsterApi}/oauth/authorize?client_id=${napsterApiKey}&response_type=code`;
const spotifyServerUrl = "http://localhost:8888";

function onSpotifyLoginClick(e: React.MouseEvent) {
  e.preventDefault();
  const redirectUrl = `${napsterServerUrl}/authorize`;
  window.location.href = `${napsterOauthUrl}&redirect_uri=${redirectUrl}`;
}
function onNapsterLoginClick(e: React.MouseEvent) {
  e.preventDefault();
  const loginUrl = `${spotifyServerUrl}/login`;
  window.location.href = `${loginUrl}`;
}

const Plugins = () => {
  return (
    <div>
      <a href="#" onClick={onSpotifyLoginClick}>
        Login to Spotify
      </a>
      <a href="#" onClick={onNapsterLoginClick}>
        Login to Napster
      </a>
    </div>
  );
};

export default Plugins;
