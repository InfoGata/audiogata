import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import isElectron from "is-electron";
import React from "react";
import Spinner from "./components/Spinner";
import usePlugins from "./hooks/usePlugins";
import { Album, Artist, PlaylistInfo } from "./plugintypes";
import { routeTree } from "./routeTree.gen";

const history = isElectron() ? createHashHistory() : createBrowserHistory();
const router = createRouter({
  routeTree,
  history,
  defaultPendingComponent: Spinner,
  scrollRestoration: true,
});
export type RouterType = typeof router;

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    playlistInfo?: PlaylistInfo;
    album?: Album;
    artist?: Artist;
  }
}

const Router: React.FC = () => {
  const { aliasesLoaded } = usePlugins();

  // Plugin routes translate the alias in the url to a plugin id through
  // params.parse, which reads a module-level registry populated from IndexedDB.
  // Mounting before that lands would make a cold `/s/<alias>/...` load resolve
  // the alias as if it were an id. This waits on one IndexedDB read, not on
  // `pluginsLoaded`, which additionally boots an iframe per plugin.
  if (!aliasesLoaded) {
    return <Spinner />;
  }

  return <RouterProvider router={router} />
}

export default Router;