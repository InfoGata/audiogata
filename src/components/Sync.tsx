import {
  LoggedIn,
  LoggedOut,
  LoginButton,
  LogoutButton,
  useWebId,
} from "@solid/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ISong } from "../models";
import { setTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";

const path = "/private/audiopwa/queue.json";
const createFile = async (webId: string, todos: ISong[]) => {
  const url = new URL(webId || "");
  const origin = url.origin;
  const todoUrl = `${origin}${path}`;
  const options: RequestInit = {
    body: JSON.stringify(todos),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  };
  await fetch(todoUrl, options);
};

const loadFile = async (webId: string) => {
  const url = new URL(webId || "");
  const origin = url.origin;
  const todoUrl = `${origin}${path}`;
  const options: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  };
  const response = await fetch(todoUrl, options);
  const todos = await response.json();
  return todos as ISong[];
};

const Sync: React.FC = () => {
  const webId = useWebId();
  const dispatch = useDispatch<AppDispatch>();
  const songs = useSelector((state: AppState) => state.song.songs);
  const onSave = async () => {
    if (webId) {
      await createFile(webId, songs);
    }
  };
  const onLoad = async () => {
    if (webId) {
      const data = await loadFile(webId);
      dispatch(setTracks(data));
    }
  };

  return (
    <>
      <LoggedOut>
        <LoginButton popup="popup.html" />
      </LoggedOut>
      <LoggedIn>
        <LogoutButton />
        <button onClick={onSave}>Save</button>
        <button onClick={onLoad}>Load</button>
      </LoggedIn>
    </>
  );
};

export default Sync;
