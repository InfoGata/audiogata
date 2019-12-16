import { Button } from "@material-ui/core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import BlockstackSync from "../syncs/BlockstackSync";

const sync = new BlockstackSync();
const Sync: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const songs = useSelector((state: AppState) => state.song.songs);
  React.useEffect(() => {
    sync.init().then(() => {
      setIsLoggedIn(sync.isLoggedIn());
    });
  }, []);

  const signIn = () => sync.login();
  const signOut = () => sync.logout();
  const syncData = async () => await sync.sync(songs);
  const getData = async () => {
    const data = await sync.getData();
    dispatch(setTracks(data));
  };

  return isLoggedIn ? (
    <>
      <Button onClick={signOut}>Sign Out</Button>
      <Button onClick={syncData}>Sync Data</Button>
      <Button onClick={getData}>Get Data</Button>
    </>
  ) : (
    <Button onClick={signIn}>Sign In</Button>
  );
};

export default Sync;
