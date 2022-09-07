import { Typography } from "@mui/material";
import React from "react";
import PluginCards from "./PluginCards";
import TopItemCards from "./TopItemCards";

const Home: React.FC = () => {
  return (
    <>
      <Typography variant="h4">Greetings</Typography>
      <TopItemCards />
      <PluginCards />
    </>
  );
};

export default Home;
