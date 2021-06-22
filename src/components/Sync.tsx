import React from "react";
import auth from 'solid-auth-client';
import { useDispatch, useSelector } from "react-redux";
import { ISong } from "../models";
import { setTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import { useEffect } from "react";

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
  await auth.fetch(todoUrl, options);
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
  const response = await auth.fetch(todoUrl, options);
  const todos = await response.json();
  return todos as ISong[];
};

const Sync: React.FC = () => {
  const [webId, setWebId]  = React.useState("");

  useEffect(() => {
    auth.trackSession(session => {
      if (!session) {
        setWebId("");
        console.log('The user is not logged in')
      }
      else {
        console.log(`The user is ${session.webId}`)
        setWebId(session.webId);
      }
    });
  }, [])

  const solidLogin = () => {
    let popupUri = '/audio-pwa/popup.html';
    auth.popupLogin({ popupUri });
  };

  const solidLogout = async () => {
    await auth.logout();
  }
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
      {webId ? (
        <div>
          <button onClick={onSave}>Save</button>
          <button onClick={onLoad}>Load</button>
          <button onClick={solidLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={solidLogin}>Login</button>
      )}
    </>
  );
};

export default Sync;
