import * as napster from "@ryb73/napster";
import React, { Component } from "react";

class NapsterComponent extends Component<{}, {}> {
  private readonly apiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
  private readonly napsterApi = "https://api.napster.com";
  private readonly oauthUrl = `${this.napsterApi}/oauth/authorize?client_id=${
    this.apiKey
  }&response_type=code`;
  public async componentDidMount() {
    napster.init({
      consumerKey: this.apiKey,
      isHTML5Compatible: true,
    });
  }

  public render() {
    return <button onClick={this.login}>Log In</button>;
  }

  public login = () => {
    const width = 700;
    const height = 400;
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;
    const redirectUrl = location.href;
    window.open(
      `${this.oauthUrl}&redirect_uri=${redirectUrl}`,
      "Napster",
      `menubar=no,location=no,resizable=no,scrollbars=no,status=no,width=${width},height=${height},top=${top}, left=${left}`,
    );
  };
}

export default NapsterComponent;
