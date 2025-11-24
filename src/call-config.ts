import React from "react";
import { createCaller } from "react-outside-call";
import PluginsContext from "./contexts/PluginsContext";

const callConfig = createCaller({
  usePlugins: () => React.useContext(PluginsContext),
});

export default callConfig;
