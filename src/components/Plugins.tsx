import React from "react";
import { Button } from "@material-ui/core";
import Spotify from "../plugins/spotify";
import Napster from "../plugins/napster";


const Plugins: React.FC = () => {
  const [napsterClientId, setNapsterClientId] = React.useState("");
  const [napsterSecretKey, setNapsterSecretKey] = React.useState("");

  const onSpotifyLoginClick = async () => {
    await Spotify.login();
  };

  const onNapsterLoginClick = async () => {
    if (napsterClientId && napsterSecretKey) {
      await Napster.login(napsterClientId, napsterSecretKey);
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
