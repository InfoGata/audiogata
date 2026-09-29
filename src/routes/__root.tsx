import AudioComponent from "@/components/AudioComponent";
import { Toaster } from "@/components/ui/sonner";
import useOffline from "@/hooks/useOffline";
import useUpdateServiceWorker from "@/hooks/useUpdateServiceWorker";
import PlayerBar from "@/layouts/PlayerBar";
import SideBar from "@/layouts/SideBar";
import TopBar from "@/layouts/TopBar";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import React from "react";

export const Root: React.FC = () => {
  useUpdateServiceWorker();
  useOffline();

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster closeButton />
      <TopBar />
      <SideBar />
      <main className="px-2 flex-1 overflow-auto pb-32 pt-20">
        <Outlet />
      </main>
      <PlayerBar />
      <AudioComponent />
    </div>
  );
};

export const Route = createRootRoute({
  component: Root,
});
