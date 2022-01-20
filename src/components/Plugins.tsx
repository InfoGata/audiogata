import React from "react";
import { Button } from "@mui/material";
import Spotify from "../plugins/spotify";
import Napster from "../plugins/napster";

function usePersistedState(
  key: string,
  defaultValue: string
): [string, React.Dispatch<React.SetStateAction<string>>] {
  const [state, setState] = React.useState(
    localStorage.getItem(key) || defaultValue
  );
  React.useEffect(() => {
    localStorage.setItem(key, state);
  }, [key, state]);
  return [state, setState];
}

const Plugins: React.FC = () => {
  const [napsterClientId, setNapsterClientId] = usePersistedState("napsterClientId", "");
  const [napsterSecretKey, setNapsterSecretKey] = usePersistedState("napsterSecretKey", "");

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
        <input value={napsterClientId} placeholder="Api Key" onChange={onClientIdChange} />
        <input value={napsterSecretKey} placeholder="Client Secret" onChange={onSecretKeyChange} />
        <Button onClick={onNapsterLoginClick}>Login to Napster</Button>
      </div>
    </div>
  );
};

export default Plugins;
