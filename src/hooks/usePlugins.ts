import React from "react";
import PluginsContext from "../contexts/PluginsContext";

const usePlugins = () => React.useContext(PluginsContext);
export default usePlugins;
