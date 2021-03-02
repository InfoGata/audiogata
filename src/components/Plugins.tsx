import { Button } from "@material-ui/core";
import { UserManager, UserManagerSettings } from 'oidc-client';
import React from "react";
import { setPlugin } from "../store/reducers/pluginReducer";
import { AppDispatch } from "../store/store";
import { useDispatch } from "react-redux";
import { Plugin } from "../models";

const napsterApi = "https://api.napster.com";
const napsterOauthUrl = `${napsterApi}/oauth/authorize`;
const spotifyUrl = "https://accounts.spotify.com/authorize";
const spotifyTokenEndpoint = "https://accounts.spotify.com/api/token"

const Plugins: React.FC = () => {
  const [napsterClientId, setNapsterClientId] = React.useState("");
  const [napsterSecretKey, setNapsterSecretKey] = React.useState("");
  const dispatch = useDispatch<AppDispatch>();


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
    const user = await userManager.signinPopup();
    const plugin: Plugin = {
      name: "napster",
      data: {
        "access_token": user.access_token,
        "refresh_token": user.refresh_token || "",
      }
    };
    dispatch(setPlugin(plugin));
  };

  const onNapsterLoginClick = async () => {
    if (napsterClientId && napsterSecretKey) {
      const settings: UserManagerSettings = {
        authority: "https://api.napster.com",
        client_id: napsterClientId,
        client_secret: napsterSecretKey,
        response_type: "code",
        redirect_uri: "http://localhost:3000",
        popup_redirect_uri: window.origin + "/audio-pwa/login_popup.html",
        metadata: {
          authorization_endpoint: napsterOauthUrl,
          token_endpoint: "https://api.napster.com/oauth/access_token",
          userinfo_endpoint: "https://api.napster.com/v2.2/me/account",
        },
      };
      const userManager = new UserManager(settings);
      const user = await userManager.signinPopup();
      const plugin: Plugin = {
        name: "napster",
        data: {
          access_token: user.access_token,
          refresh_token: user.refresh_token || "",
        },
      };
      dispatch(setPlugin(plugin));
    }
  };

  const onClientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNapsterClientId(e.target.value);
  };
  const onSecretKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNapsterSecretKey(e.target.value);
  }

  return (
    <div>
      <div>
        <Button onClick={onSpotifyLoginClick}>Login to Spotify</Button>
      </div>
      <div>
        <input value={napsterClientId} onChange={onClientIdChange} />
        <input value={napsterSecretKey} onChange={onSecretKeyChange} />
        <Button onClick={onNapsterLoginClick}>Login to Napster</Button>
      </div>
    </div>
  );
};

export default Plugins;
