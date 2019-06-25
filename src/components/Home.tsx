import React from "react";
import { ISong } from "../services/data/database";
import Search from "./Search";

interface IProps {
  onSelectSong: (song: ISong) => void;
}

const Home = (props: IProps) => (
  <div>
    <Search onSelectSong={props.onSelectSong} />
  </div>
);

export default Home;
