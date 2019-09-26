import React from "react";
import { Route } from "react-router-dom";
import Home from "./Home";
import Playlist from "./Playlist";
import Plugins from "./Plugins";
import Settings from "./Settings";
import Sync from "./Sync";

const Routes: React.FC = () => {
  return (
    <>
      <Route exact={true} path="/" component={Home} />
      <Route path="/plugins" component={Plugins} />
      <Route path="/sync" component={Sync} />
      <Route exact={true} path="/playlist/:id" component={Playlist} />
      <Route exact={true} path="/settings" component={Settings} />
    </>
  );
};

export default Routes;
