import React from "react";
import { createCaller } from "./lib/create-caller";
import PluginsContext from "./contexts/PluginsContext";

const callConfig = createCaller({
  usePlugins: () => React.useContext(PluginsContext),
});

export default callConfig;
