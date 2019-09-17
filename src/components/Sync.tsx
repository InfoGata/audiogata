import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTracks } from "../store/actions/song";
import { AppState } from "../store/store";
import BlockstackSync from "../syncs/BlockstackSync";

const sync = new BlockstackSync();
const Sync: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const dispatch = useDispatch();
  const songs = useSelector((state: AppState) => state.song.songs);
  React.useEffect(() => {
    sync.init().then(() => {
      setIsLoggedIn(sync.isLoggedIn());
    });
  }, []);

  function signIn() {
    sync.login();
  }

  function signOut() {
    sync.logout();
  }

  async function getData() {
    const data = await sync.getData();
    dispatch(setTracks(data));
  }

  async function syncData() {
    await sync.sync(songs);
  }

  return isLoggedIn ? (
    <div>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={syncData}>Sync Data</button>
      <button onClick={getData}>Get Data</button>
    </div>
  ) : (
    <button onClick={signIn}>Sign In</button>
  );
};

export default Sync;
