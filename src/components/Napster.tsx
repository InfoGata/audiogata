import React, { Component } from "react";
declare var Napster: any;
class NapsterComponent extends Component<{}, {}> {
  private readonly apiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
  private readonly napsterApi = "https://api.napster.com";
  private readonly serverUrl = "http://localhost:2000";
  private readonly oauthUrl = `${this.napsterApi}/oauth/authorize?client_id=${
    this.apiKey
  }&response_type=code`;

  public async componentDidMount() {
    Napster.init({
      consumerKey: this.apiKey,
      isHTML5Compatible: true,
    });
    // Check if access_token and refresh_token are in params
    const query = new URLSearchParams(window.location.search);
    if (query.has("accessToken") && query.has("refreshToken")) {
      const accessToken = query.get("accessToken");
      const refreshToken = query.get("refreshToken");
      Napster.member.set({
        accessToken,
        refreshToken,
      });
    }
  }

  public play(id: string) {
    Napster.player.play(id);
  }

  public render() {
    return (
      <div>
        <a href="#" onClick={this.onLoginClick}>
          Login to Napster
        </a>
      </div>
    );
  }

  private onLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const redirectUrl = `${this.serverUrl}/authorize`;
    window.location.href = `${this.oauthUrl}&redirect_uri=${redirectUrl}`;
  };
}

export default NapsterComponent;
