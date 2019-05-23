import React from "react";

class Plugins extends React.PureComponent {
  private readonly napsterApiKey =
    "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
  private readonly napsterApi = "https://api.napster.com";
  private readonly napsterServerUrl = "http://localhost:2000";
  private readonly napsterOauthUrl = `${
    this.napsterApi
  }/oauth/authorize?client_id=${this.napsterApiKey}&response_type=code`;
  private readonly spotifyServerUrl = "http://localhost:8888";
  public render() {
    return (
      <div>
        <a href="#" onClick={this.onSpotifyLoginClick}>
          Login to Spotify
        </a>
        <a href="#" onClick={this.onNapsterLoginClick}>
          Login to Napster
        </a>
      </div>
    );
  }

  private onNapsterLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const redirectUrl = `${this.napsterServerUrl}/authorize`;
    window.location.href = `${
      this.napsterOauthUrl
    }&redirect_uri=${redirectUrl}`;
  };

  private onSpotifyLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const loginUrl = `${this.spotifyServerUrl}/login`;
    window.location.href = `${loginUrl}`;
  };
}

export default Plugins;
