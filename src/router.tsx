import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import isElectron from "is-electron";
import React from "react";
import Spinner from "./components/Spinner";
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
  return <RouterProvider router={router} />
}

export default Router;